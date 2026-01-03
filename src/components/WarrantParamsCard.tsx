import { SliderInput } from './SliderInput';

interface WarrantParamsCardProps {
    strike: number;
    premium: number;
    ratio: number;
    expiry: number;
    quantity: number;
    onStrikeChange: (value: number) => void;
    onPremiumChange: (value: number) => void;
    onRatioChange: (value: number) => void;
    onExpiryChange: (value: number) => void;
    onQuantityChange: (value: number) => void;
}

export const WarrantParamsCard = ({
    strike,
    premium,
    ratio,
    expiry,
    quantity,
    onStrikeChange,
    onPremiumChange,
    onRatioChange,
    onExpiryChange,
    onQuantityChange,
}: WarrantParamsCardProps) => {
    return (
        <div className="card">
            <h3 style={{ margin: '0 0 20px', fontSize: '14px', color: '#94a3b8', letterSpacing: '1px' }}>
                PARÁMETROS DEL WARRANT
            </h3>

            <div style={{ display: 'grid', gap: '20px' }}>
                <SliderInput
                    label="Strike (Precio ejercicio)"
                    value={strike}
                    min={80}
                    max={120}
                    step={1}
                    onChange={onStrikeChange}
                    formatValue={(v) => `${v}€`}
                />

                <SliderInput
                    label="Prima del Warrant"
                    value={premium}
                    min={0.5}
                    max={10}
                    step={0.1}
                    onChange={onPremiumChange}
                    formatValue={(v) => `${v.toFixed(2)}€`}
                />

                <SliderInput
                    label="Ratio (warrants por bono)"
                    value={ratio}
                    min={0.01}
                    max={1}
                    step={0.01}
                    onChange={onRatioChange}
                />

                <SliderInput
                    label="Vencimiento (años)"
                    value={expiry}
                    min={0.25}
                    max={3}
                    step={0.25}
                    onChange={onExpiryChange}
                    formatValue={(v) => `${v} año${v !== 1 ? 's' : ''}`}
                />

                <SliderInput
                    label="Cantidad de Warrants"
                    value={quantity}
                    min={100}
                    max={10000}
                    step={100}
                    onChange={onQuantityChange}
                    formatValue={(v) => v.toLocaleString()}
                />
            </div>
        </div>
    );
};
