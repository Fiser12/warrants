import { useMemo, useState } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart, ReferenceLine, Legend,
} from 'recharts';
import { formatCurrency } from '../lib/formatters';
import type { SavedOperation } from '../lib/types';
import { runSimulation } from '../lib/simulator';
// import { calcGreeks } from '../lib/financial'; // Not needed if runSimulation returns greeks

// Generate distinct colors for lines
const COLORS = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#22c55e', // green
    '#f59e0b', // amber
    '#a855f7', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
];

type ChartType = 'roi' | 'pnl' | 'delta';

interface ComparisonViewProps {
    operations: SavedOperation[];
    onClose: () => void;
}

export const ComparisonView = ({ operations, onClose }: ComparisonViewProps) => {
    const [chartType, setChartType] = useState<ChartType>('roi');

    // Calcular resultados para cada operación (para la tabla)
    const results = useMemo(() => {
        return operations.map(op => {
            const result = runSimulation(op.input);
            return {
                ...op,
                result
            };
        });
    }, [operations]);

    // Generar datos para el gráfico comparativo
    const chartData = useMemo(() => {
        const data: any[] = [];

        // Crear rango de tipos de interés (de 1% a 7% con paso 0.25%)
        for (let rate = 1; rate <= 7; rate += 0.25) {
            const point: any = { rate };

            operations.forEach(op => {
                // Clonar input para evitar mutaciones
                const input = JSON.parse(JSON.stringify(op.input));
                input.market.simulatedRate = rate;

                // Calcular simulación para este punto
                const res = runSimulation(input);

                if (chartType === 'delta') {
                    // Usar Delta calculada por el simulador
                    point[op.id] = res.greeks.delta;
                } else if (chartType === 'pnl') {
                    point[op.id] = res.adjustedPnL.profitLoss;
                } else {
                    // roi (default)
                    point[op.id] = res.adjustedPnL.profitLossPercent;
                }
            });

            data.push(point);
        }

        return data;
    }, [operations, chartType]);

    const getChartTitle = () => {
        switch (chartType) {
            case 'roi': return 'Rentabilidad (%) vs Tipo de Interés';
            case 'pnl': return 'Beneficio/Pérdida (€) vs Tipo de Interés';
            case 'delta': return 'Sensibilidad (Delta) vs Tipo de Interés';
        }
    };

    const formatYAxis = (val: number) => {
        switch (chartType) {
            case 'roi': return `${val.toFixed(0)}%`;
            case 'pnl': return `${(val / 1000).toFixed(0)}k€`; // Simplificado para ejes
            case 'delta': return val.toFixed(2);
        }
    };

    return (
        <div className="flex-1 w-full h-full flex flex-col p-6 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        COMPARADOR DE ESTRATEGIAS
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Comparando {operations.length} escenarios</p>
                </div>
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold transition-colors"
                >
                    ✕ Cerrar
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-thin scrollbar-thumb-slate-700">

                {/* Gráfico Comparativo */}
                <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-slate-300">{getChartTitle()}</h3>

                        {/* Chart Selector */}
                        <div className="flex bg-slate-800 rounded-lg p-1">
                            <button
                                onClick={() => setChartType('roi')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${chartType === 'roi' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                Rentabilidad %
                            </button>
                            <button
                                onClick={() => setChartType('pnl')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${chartType === 'pnl' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                P&L (€)
                            </button>
                            <button
                                onClick={() => setChartType('delta')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${chartType === 'delta' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                Delta (Δ)
                            </button>
                        </div>
                    </div>

                    <div className="h-[450px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                                <defs>
                                    {operations.map((op, i) => (
                                        <linearGradient key={`gradient-${op.id}`} id={`color-${op.id}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" vertical={false} />
                                <XAxis
                                    dataKey="rate"
                                    stroke="#64748b"
                                    tickFormatter={(v) => `${v}%`}
                                    tick={{ fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    tickFormatter={formatYAxis}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                                    itemStyle={{ fontSize: '13px', paddingTop: '2px', paddingBottom: '2px' }}
                                    formatter={(value: number, name: string, props: any) => {
                                        const opName = operations.find(op => op.id === props.dataKey)?.name || name;
                                        let formattedValue = '';
                                        if (chartType === 'roi') formattedValue = `${value.toFixed(1)}%`;
                                        else if (chartType === 'pnl') formattedValue = formatCurrency(value);
                                        else formattedValue = value.toFixed(4);

                                        return [formattedValue, opName];
                                    }}
                                    labelFormatter={(value) => `Tipo Simulado: ${value}%`}
                                />
                                <Legend
                                    verticalAlign="top"
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ paddingBottom: '20px' }}
                                />
                                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" opacity={0.5} />

                                {operations.map((op, i) => (
                                    <Area
                                        key={op.id}
                                        type="monotone"
                                        dataKey={op.id}
                                        name={op.name}
                                        stroke={COLORS[i % COLORS.length]}
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill={`url(#color-${op.id})`}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                ))}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tabla Comparativa (Sin cambios) */}
                <div className="bg-slate-900/50 rounded-xl overflow-hidden border border-slate-700/50 shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-300">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-800/80">
                                <tr>
                                    <th className="px-6 py-4">Métrica</th>
                                    {results.map((item, i) => (
                                        <th key={item.id} className="px-6 py-4 min-w-[180px]">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                                />
                                                <span className="text-white font-bold">{item.name}</span>
                                            </div>
                                            <div className="mt-1 normal-case text-slate-500 font-normal">
                                                {item.input.warrant.type} · Strike {item.input.warrant.strike}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {/* Inputs */}
                                <tr className="bg-slate-800/20">
                                    <td className="px-6 py-3 font-semibold text-slate-400" colSpan={results.length + 1}>Parámetros</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-3 font-medium">Inversión Total</td>
                                    {results.map(item => (
                                        <td key={item.id} className="px-6 py-3 font-mono text-slate-300">
                                            {formatCurrency(item.result.adjustedPnL.totalInvestment)}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="px-6 py-3 font-medium">Tipo Break-Even</td>
                                    {results.map(item => (
                                        <td key={item.id} className="px-6 py-3 font-mono text-slate-300">
                                            {item.result.breakEvenRate ? `${item.result.breakEvenRate.toFixed(2)}%` : 'N/A'}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="px-6 py-3 font-medium">Theta (diario)</td>
                                    {results.map(item => (
                                        <td key={item.id} className="px-6 py-3 font-mono text-red-400">
                                            {formatCurrency(item.result.theta)}
                                        </td>
                                    ))}
                                </tr>

                                {/* Resultados Simulados */}
                                <tr className="bg-slate-800/20">
                                    <td className="px-6 py-3 font-semibold text-slate-400" colSpan={results.length + 1}>
                                        Escenario Simulado
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-3 font-medium">Tipo Simulado</td>
                                    {results.map(item => (
                                        <td key={item.id} className="px-6 py-3 font-mono">
                                            <span className={item.input.market.simulatedRate !== item.input.bond.currentRate ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                                                {item.input.market.simulatedRate.toFixed(2)}%
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="px-6 py-3 font-medium">Beneficio / Pérdida (€)</td>
                                    {results.map(item => {
                                        const pnl = item.result.adjustedPnL.profitLoss;
                                        return (
                                            <td key={item.id} className={`px-6 py-3 font-mono font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                                            </td>
                                        );
                                    })}
                                </tr>
                                <tr>
                                    <td className="px-6 py-3 font-medium">Rentabilidad (%)</td>
                                    {results.map(item => {
                                        const pnlPercent = item.result.adjustedPnL.profitLossPercent;
                                        return (
                                            <td key={item.id} className={`px-6 py-3 font-mono font-bold ${pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%
                                            </td>
                                        );
                                    })}
                                </tr>
                                {/* Riesgo y Sensibilidad */}
                                <tr className="bg-slate-800/20">
                                    <td className="px-6 py-3 font-semibold text-slate-400" colSpan={results.length + 1}>
                                        Riesgo (Griegas) y Sensibilidad
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-3 font-medium">Delta (Δ)</td>
                                    {results.map(item => (
                                        <td key={item.id} className="px-6 py-3 font-mono text-slate-300">
                                            {item.result.greeks.delta.toFixed(4)}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="px-6 py-3 font-medium">Gamma (Γ)</td>
                                    {results.map(item => (
                                        <td key={item.id} className="px-6 py-3 font-mono text-slate-300">
                                            {item.result.greeks.gamma.toFixed(4)}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="px-6 py-3 font-medium">Vega (ν)</td>
                                    {results.map(item => (
                                        <td key={item.id} className="px-6 py-3 font-mono text-slate-300">
                                            {item.result.greeks.vega.toFixed(4)} <span className="text-xs text-slate-500">(por 1% vol)</span>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="px-6 py-3 font-medium">Rho (ρ)</td>
                                    {results.map(item => (
                                        <td key={item.id} className="px-6 py-3 font-mono text-slate-300">
                                            {item.result.greeks.rho.toFixed(4)} <span className="text-xs text-slate-500">(por 1% tipo)</span>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
