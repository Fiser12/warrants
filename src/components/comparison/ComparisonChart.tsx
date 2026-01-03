import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart, ReferenceLine, Legend,
} from 'recharts';
import { formatCurrency } from '../../lib/formatters';
import type { SavedOperation } from '../../lib/types';
import { ChartType, AxisType, ChartDataPoint } from './types';

// Generate distinct colors for lines
export const COLORS = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#22c55e', // green
    '#f59e0b', // amber
    '#a855f7', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
];

interface ComparisonChartProps {
    data: ChartDataPoint[];
    operations: SavedOperation[];
    chartType: ChartType;
    setChartType: (type: ChartType) => void;
    xAxisType: AxisType;
    setXAxisType: (type: AxisType) => void;
}

export const ComparisonChart = ({
    data,
    operations,
    chartType,
    setChartType,
    xAxisType,
    setXAxisType
}: ComparisonChartProps) => {

    const getChartTitle = () => {
        const metric = chartType === 'roi' ? 'Rentabilidad (%)' : chartType === 'pnl' ? 'P&L (€)' : 'Delta';
        const axis = xAxisType === 'rate' ? 'Tipo de Interés' : xAxisType === 'time' ? 'Tiempo Transcurrido' : 'Volatilidad';
        return `${metric} vs ${axis}`;
    };

    const getXAxisLabel = () => {
        switch (xAxisType) {
            case 'rate': return 'Tipo de Interés Simulado';
            case 'time': return 'Días Transcurridos (Time Decay)';
            case 'vol': return 'Volatilidad Implícita';
        }
    };

    const formatYAxis = (val: number) => {
        switch (chartType) {
            case 'roi': return `${val.toFixed(0)}%`;
            case 'pnl': return `${(val / 1000).toFixed(0)}k€`;
            case 'delta': return val.toFixed(2);
        }
    };

    return (
        <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50 shadow-xl">
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-300">{getChartTitle()}</h3>
                    <div className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
                        Eje X: {getXAxisLabel()}
                    </div>
                </div>

                {/* Controls Toolbar */}
                <div className="flex flex-wrap gap-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                    {/* Y-Axis Selector */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold ml-1">Métrica (Eje Y)</span>
                        <div className="flex bg-slate-900/80 rounded-lg p-1">
                            <button onClick={() => setChartType('roi')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${chartType === 'roi' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Rentabilidad %</button>
                            <button onClick={() => setChartType('pnl')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${chartType === 'pnl' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>P&L (€)</button>
                            <button onClick={() => setChartType('delta')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${chartType === 'delta' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Delta (Δ)</button>
                        </div>
                    </div>

                    <div className="w-px bg-slate-700/50 mx-2" />

                    {/* X-Axis Selector */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold ml-1">Dimensión (Eje X)</span>
                        <div className="flex bg-slate-900/80 rounded-lg p-1">
                            <button onClick={() => setXAxisType('rate')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${xAxisType === 'rate' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Tipo Interés</button>
                            <button onClick={() => setXAxisType('time')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${xAxisType === 'time' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Tiempo (+Días)</button>
                            <button onClick={() => setXAxisType('vol')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${xAxisType === 'vol' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Volatilidad</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
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
                            dataKey="label" // Use common label field
                            stroke="#64748b"
                            tick={{ fontSize: 12 }}
                            dy={10}
                            interval={xAxisType === 'time' ? 4 : 2} // Skip ticks for dense time data
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
                            labelFormatter={(label) => `${getXAxisLabel()}: ${label}`}
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
    );
};
