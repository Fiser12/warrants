import { SliderInput } from './SliderInput';

interface WarrantParamsCardProps {
    strike: number;
    premium: number;
    ratio: number;
    expiry: number;
    quantity: number;
    volatility: number;
    onStrikeChange: (value: number) => void;
    onPremiumChange: (value: number) => void;
    onRatioChange: (value: number) => void;
    onExpiryChange: (value: number) => void;
    onQuantityChange: (value: number) => void;
    onVolatilityChange: (value: number) => void;
}

export const WarrantParamsCard = ({
    strike, premium, ratio, expiry, quantity, volatility,
    onStrikeChange, onPremiumChange, onRatioChange, onExpiryChange, onQuantityChange, onVolatilityChange,
}: WarrantParamsCardProps) => {
    return (
        <div className="rounded-xl p-5 backdrop-blur-sm transition-all duration-300 bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-blue-500/15 hover:border-blue-500/30 hover:shadow-[0_8px_32px_rgba(59,130,246,0.1)]">
            <h3 className="m-0 mb-5 text-sm text-slate-400 tracking-wide">PARÁMETROS DEL WARRANT</h3>
            <div className="grid gap-5">
                <SliderInput label="Strike (Precio ejercicio)" value={strike} min={80} max={120} step={1} onChange={onStrikeChange} formatValue={(v) => `${v}€`} />
                <SliderInput label="Prima del Warrant" value={premium} min={0.5} max={10} step={0.1} onChange={onPremiumChange} formatValue={(v) => `${v.toFixed(2)}€`} />
                <SliderInput label="Ratio (warrants por bono)" value={ratio} min={0.01} max={1} step={0.01} onChange={onRatioChange} />
                <SliderInput label="Vencimiento (años)" value={expiry} min={0.25} max={3} step={0.25} onChange={onExpiryChange} formatValue={(v) => `${v} año${v !== 1 ? 's' : ''}`} />
                <SliderInput label="Cantidad de Warrants" value={quantity} min={100} max={10000} step={100} onChange={onQuantityChange} formatValue={(v) => v.toLocaleString()} />
                <SliderInput
                    label="Volatilidad implícita"
                    value={volatility * 100}
                    min={5}
                    max={50}
                    step={1}
                    onChange={(v) => onVolatilityChange(v / 100)}
                    formatValue={(v) => `${v.toFixed(0)}%`}
                    colorClass="text-purple-400"
                />
            </div>
        </div>
    );
};
