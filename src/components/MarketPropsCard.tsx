import { SliderInput } from './SliderInput';

interface MarketPropsCardProps {
    volatility: number;
    creditSpread: number;
    riskFreeRate: number; // For context calculation
    onVolatilityChange: (value: number) => void;
    onCreditSpreadChange: (value: number) => void;
}

export const MarketPropsCard = ({
    volatility, creditSpread, riskFreeRate,
    onVolatilityChange, onCreditSpreadChange
}: MarketPropsCardProps) => {
    // Derived total yield for display
    const totalYield = riskFreeRate + (creditSpread / 100);

    return (
        <div className="rounded-xl p-5 backdrop-blur-sm transition-all duration-300 bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-purple-500/15 hover:border-purple-500/30 hover:shadow-[0_8px_32px_rgba(168,85,247,0.1)]">
            <h3 className="m-0 mb-5 text-sm text-purple-400 tracking-wide">MERCADO</h3>
            <div className="grid gap-5">
                <SliderInput
                    label="Volatilidad implícita"
                    value={volatility * 100}
                    min={5}
                    max={50}
                    step={1}
                    onChange={(v) => onVolatilityChange(v / 100)}
                    formatValue={(v) => `${v.toFixed(0)}%`}
                    colorClass="text-purple-400"
                    tooltip="Expectativa del mercado sobre cuánto fluctuará el precio del bono. Mayor volatilidad = warrants más caros porque hay más probabilidad de grandes movimientos."
                />

                {/* Divider */}
                <div className="h-px bg-slate-700/50 my-1" />

                <div>
                    <SliderInput
                        label="Prima de Riesgo (Credit Spread)"
                        value={creditSpread}
                        min={0}
                        max={500}
                        step={10}
                        onChange={onCreditSpreadChange}
                        formatValue={(v) => `${v.toFixed(0)} bps`}
                        colorClass="text-pink-400"
                        tooltip="Riesgo adicional del país respecto al libre de riesgo (BCE). 100 bps = 1%. Si sube, la TIR del bono sube (malo para el bono) pero el Risk Free se mantiene."
                    />

                    {/* Context Info */}
                    <div className="flex justify-between mt-2 px-1 text-[10px] sm:text-[11px] font-mono">
                        <span className="text-slate-500">
                            Base (BCE): <span className="text-amber-500">{riskFreeRate.toFixed(2)}%</span>
                        </span>
                        <span className="text-pink-400/80">
                            = TIR Total: <span className="font-bold">{totalYield.toFixed(2)}%</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
