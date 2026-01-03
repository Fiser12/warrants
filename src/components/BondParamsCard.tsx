import { SliderInput } from './SliderInput';

interface BondParamsCardProps {
    currentRate: number;
    bondCoupon: number;
    bondMaturity: number;
    onCurrentRateChange: (value: number) => void;
    onBondCouponChange: (value: number) => void;
    onBondMaturityChange: (value: number) => void;
}

export const BondParamsCard = ({
    currentRate,
    bondCoupon,
    bondMaturity,
    onCurrentRateChange,
    onBondCouponChange,
    onBondMaturityChange,
}: BondParamsCardProps) => {
    return (
        <div className="card">
            <h3 style={{ margin: '0 0 20px', fontSize: '14px', color: '#94a3b8', letterSpacing: '1px' }}>
                BONO SUBYACENTE · ESPAÑA
            </h3>

            <div style={{ display: 'grid', gap: '20px' }}>
                <SliderInput
                    label="Tipo actual (TIR)"
                    value={currentRate}
                    min={1}
                    max={7}
                    step={0.1}
                    onChange={onCurrentRateChange}
                    formatValue={(v) => `${v.toFixed(2)}%`}
                    color="#f59e0b"
                />

                <SliderInput
                    label="Cupón del bono"
                    value={bondCoupon}
                    min={0}
                    max={6}
                    step={0.25}
                    onChange={onBondCouponChange}
                    formatValue={(v) => `${v.toFixed(2)}%`}
                    color="#f59e0b"
                />

                <SliderInput
                    label="Vencimiento del bono"
                    value={bondMaturity}
                    min={2}
                    max={30}
                    step={1}
                    onChange={onBondMaturityChange}
                    formatValue={(v) => `${v} años`}
                    color="#f59e0b"
                />
            </div>
        </div>
    );
};
