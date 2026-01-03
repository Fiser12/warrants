import { formatCurrency } from '../../lib/formatters';
import { ComparisonResult } from './types';
import { COLORS } from './ComparisonChart';

interface ComparisonTableProps {
    results: ComparisonResult[];
}

export const ComparisonTable = ({ results }: ComparisonTableProps) => {
    return (
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
    );
};
