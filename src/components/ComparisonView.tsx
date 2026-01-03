import { useMemo, useState } from 'react';
import type { SavedOperation } from '../lib/types';
import { runSimulation } from '../lib/simulator';
import { ComparisonHeader } from './comparison/ComparisonHeader';
import { ComparisonChart } from './comparison/ComparisonChart';
import { ComparisonTable } from './comparison/ComparisonTable';
import { ChartDataPoint, ChartType, AxisType, ComparisonResult } from './comparison/types';

interface ComparisonViewProps {
    operations: SavedOperation[];
    onClose: () => void;
}

export const ComparisonView = ({ operations, onClose }: ComparisonViewProps) => {
    const [chartType, setChartType] = useState<ChartType>('roi');
    const [xAxisType, setXAxisType] = useState<AxisType>('rate');

    // Calcular resultados para cada operación (para la tabla)
    const results = useMemo<ComparisonResult[]>(() => {
        return operations.map(op => {
            const result = runSimulation(op.input);
            return {
                ...op,
                result
            };
        });
    }, [operations]);

    // Generar datos para el gráfico comparativo
    const chartData = useMemo<ChartDataPoint[]>(() => {
        const data: ChartDataPoint[] = [];

        if (xAxisType === 'rate') {
            // Rango de tipos: 1% a 7%
            for (let rate = 1; rate <= 7; rate += 0.25) {
                const point: ChartDataPoint = { xPoints: rate, label: `${rate}%` };
                operations.forEach(op => {
                    const input = JSON.parse(JSON.stringify(op.input));
                    input.market.simulatedRate = rate;
                    const res = runSimulation(input);
                    point[op.id] = chartType === 'roi' ? res.adjustedPnL.profitLossPercent :
                        chartType === 'pnl' ? res.adjustedPnL.profitLoss :
                            res.greeks.delta;
                });
                data.push(point);
            }
        } else if (xAxisType === 'time') {
            // Rango de tiempo: Hoy (0) a 365 días (o menos si vence antes)
            // Simulamos paso de días manteniendo el tipo constante
            for (let days = 0; days <= 365; days += 15) {
                const point: ChartDataPoint = { xPoints: days, label: `+${days}d` };
                operations.forEach(op => {
                    const input = JSON.parse(JSON.stringify(op.input));
                    // Sumar días simulados a los ya transcurridos
                    input.time.elapsedDays += days;
                    const res = runSimulation(input);
                    // Si ha vencido, el valor podría ser constante (0 o intrínseco)
                    point[op.id] = chartType === 'roi' ? res.adjustedPnL.profitLossPercent :
                        chartType === 'pnl' ? res.adjustedPnL.profitLoss :
                            res.greeks.delta;
                });
                data.push(point);
            }
        } else if (xAxisType === 'vol') {
            // Rango de volatilidad: 10% a 100%
            for (let vol = 10; vol <= 100; vol += 5) {
                const point: ChartDataPoint = { xPoints: vol, label: `${vol}%` };
                operations.forEach(op => {
                    const input = JSON.parse(JSON.stringify(op.input));
                    input.warrant.volatility = vol;
                    const res = runSimulation(input);
                    point[op.id] = chartType === 'roi' ? res.adjustedPnL.profitLossPercent :
                        chartType === 'pnl' ? res.adjustedPnL.profitLoss :
                            res.greeks.delta;
                });
                data.push(point);
            }
        }

        return data;
    }, [operations, chartType, xAxisType]);

    return (
        <div className="flex-1 w-full h-full flex flex-col p-6 overflow-hidden">
            <ComparisonHeader
                operationsCount={operations.length}
                onClose={onClose}
            />

            <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-thin scrollbar-thumb-slate-700">
                <ComparisonChart
                    data={chartData}
                    operations={operations}
                    chartType={chartType}
                    setChartType={setChartType}
                    xAxisType={xAxisType}
                    setXAxisType={setXAxisType}
                />

                <ComparisonTable results={results} />
            </div>
        </div>
    );
};
