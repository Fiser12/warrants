import { SliderInput } from './SliderInput';

interface WarrantPropsCardProps {
    strike: number;
    premium: number;
    ratio: number;
    expiry: number;
    onStrikeChange: (value: number) => void;
    onPremiumChange: (value: number) => void;
    onRatioChange: (value: number) => void;
    onExpiryChange: (value: number) => void;
    quantity: number;
    onQuantityChange: (value: number) => void;
}

export const WarrantPropsCard = ({
    strike, premium, ratio, expiry, quantity,
    onStrikeChange, onPremiumChange, onRatioChange, onExpiryChange, onQuantityChange
}: WarrantPropsCardProps) => {
    return (
        <div className="rounded-xl p-5 backdrop-blur-sm transition-all duration-300 bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-blue-500/15 hover:border-blue-500/30 hover:shadow-[0_8px_32px_rgba(59,130,246,0.1)]">
            <h3 className="m-0 mb-5 text-sm text-slate-400 tracking-wide">PARÁMETROS DEL WARRANT</h3>
            <div className="grid gap-5">
                <SliderInput
                    label="Cantidad de Warrants (Cartera)"
                    value={quantity}
                    min={100}
                    max={10000}
                    step={100}
                    onChange={onQuantityChange}
                    formatValue={(v) => v.toLocaleString()}
                    colorClass="text-indigo-300"
                    tooltip="Número de warrants que compras. Tu inversión total = cantidad × prima × ratio."
                />

                {/* Divider */}
                <div className="h-px bg-slate-700/50 my-1" />

                <SliderInput
                    label="Strike (Precio ejercicio)"
                    value={strike}
                    min={80}
                    max={120}
                    step={1}
                    onChange={onStrikeChange}
                    formatValue={(v) => `${v}€`}
                    tooltip="Precio al que puedes comprar (CALL) o vender (PUT) el bono subyacente. Si el bono cotiza a 95€ y tienes un PUT con strike 100€, puedes vender a 100€ algo que vale 95€."
                />
                <SliderInput
                    label="Prima del Warrant"
                    value={premium}
                    min={0.5}
                    max={10}
                    step={0.1}
                    onChange={onPremiumChange}
                    formatValue={(v) => `${v.toFixed(2)}€`}
                    tooltip="Coste de comprar un warrant. Es tu inversión inicial y lo máximo que puedes perder. Cuanto mayor la prima, más caro te sale apostar."
                />
                <SliderInput
                    label="Ratio (warrants por bono)"
                    value={ratio}
                    min={0.01}
                    max={1}
                    step={0.01}
                    onChange={onRatioChange}
                    tooltip="Cuántos warrants necesitas para tener derecho sobre un bono completo. Ratio 0.1 significa que necesitas 10 warrants para equivaler a 1 bono."
                />
                <SliderInput
                    label="Vencimiento (años)"
                    value={expiry}
                    min={0.25}
                    max={3}
                    step={0.25}
                    onChange={onExpiryChange}
                    formatValue={(v) => `${v} año${v !== 1 ? 's' : ''}`}
                    tooltip="Tiempo hasta que expira el warrant. Más tiempo = más valor temporal, pero también más prima. El valor temporal decae aceleradamente cerca del vencimiento."
                />
            </div>
        </div>
    );
};
