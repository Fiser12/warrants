import { SliderInput } from './SliderInput';

interface MarketParamsCardProps {
    riskFreeRate: number;
    onRiskFreeRateChange: (value: number) => void;
}

export const MarketParamsCard = ({
    riskFreeRate,
    onRiskFreeRateChange,
}: MarketParamsCardProps) => {
    return (
        <div className="rounded-xl p-5 backdrop-blur-sm transition-all duration-300 bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-emerald-500/15 hover:border-emerald-500/30 hover:shadow-[0_8px_32px_rgba(16,185,129,0.1)]">
            <h3 className="m-0 mb-5 text-sm text-emerald-400 tracking-wide">PARÁMETROS DE MERCADO</h3>
            <div className="grid gap-5">
                <SliderInput
                    label="Tasa libre de riesgo (BCE)"
                    value={riskFreeRate}
                    min={0}
                    max={6}
                    step={0.25}
                    onChange={onRiskFreeRateChange}
                    formatValue={(v) => `${v.toFixed(2)}%`}
                    colorClass="text-emerald-400"
                />
            </div>
            <p className="mt-3 text-xs text-slate-500">
                💡 Tasa de depósito del BCE. Usada para el descuento en Black-Scholes.
            </p>
        </div>
    );
};
