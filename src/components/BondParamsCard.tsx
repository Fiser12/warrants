import { SliderInput } from './SliderInput';

interface BondParamsCardProps {
    currentRate: number;
    bondCoupon: number;
    bondMaturity: number;
    faceValue: number;
    onCurrentRateChange: (value: number) => void;
    onBondCouponChange: (value: number) => void;
    onBondMaturityChange: (value: number) => void;
    onFaceValueChange: (value: number) => void;
}

export const BondParamsCard = ({
    currentRate, bondCoupon, bondMaturity, faceValue,
    onCurrentRateChange, onBondCouponChange, onBondMaturityChange, onFaceValueChange,
}: BondParamsCardProps) => {
    return (
        <div className="rounded-xl p-5 backdrop-blur-sm transition-all duration-300 bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-blue-500/15 hover:border-blue-500/30 hover:shadow-[0_8px_32px_rgba(59,130,246,0.1)]">
            <h3 className="m-0 mb-5 text-sm text-slate-400 tracking-wide">BONO SUBYACENTE · ESPAÑA</h3>
            <div className="grid gap-5">
                <SliderInput label="Tipo actual (TIR)" value={currentRate} min={1} max={7} step={0.1} onChange={onCurrentRateChange} formatValue={(v) => `${v.toFixed(2)}%`} colorClass="text-amber-500" />
                <SliderInput label="Cupón del bono" value={bondCoupon} min={0} max={6} step={0.25} onChange={onBondCouponChange} formatValue={(v) => `${v.toFixed(2)}%`} colorClass="text-amber-500" />
                <SliderInput label="Vencimiento del bono" value={bondMaturity} min={2} max={30} step={1} onChange={onBondMaturityChange} formatValue={(v) => `${v} años`} colorClass="text-amber-500" />
                <SliderInput label="Valor nominal" value={faceValue} min={100} max={10000} step={100} onChange={onFaceValueChange} formatValue={(v) => `${v.toLocaleString()}€`} colorClass="text-amber-500" />
            </div>
        </div>
    );
};
