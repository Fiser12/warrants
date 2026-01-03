import { useState } from 'react';
import { SliderInput } from './SliderInput';
import { useSettings } from '../context/SettingsContext';
import { MarketDataService } from '../lib/marketData';

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
    const { apiKey, hasApiKey } = useSettings();
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string | null>(() => {
        return localStorage.getItem('av_last_sync_date');
    });

    const handleSync = async () => {
        if (!hasApiKey) {
            alert('Por favor, configura tu API Key en los ajustes (⚙️) primero.');
            return;
        }

        setIsLoading(true);
        const service = new MarketDataService(apiKey);

        try {
            // Mapping rough maturity estimate to API params
            let maturityParam: '2year' | '5year' | '10year' | '30year' = '10year';
            if (bondMaturity <= 2) maturityParam = '2year';
            else if (bondMaturity <= 5) maturityParam = '5year';
            else if (bondMaturity <= 15) maturityParam = '10year';
            else maturityParam = '30year';

            const result = await service.fetchBondYield(maturityParam);

            onCurrentRateChange(result.value);

            const dateStr = new Date().toLocaleString();
            setLastUpdated(dateStr);
            localStorage.setItem('av_last_sync_date', dateStr);
        } catch (error: any) {
            alert(`Error al sincronizar: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="rounded-xl p-5 backdrop-blur-sm transition-all duration-300 bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-blue-500/15 hover:border-blue-500/30 hover:shadow-[0_8px_32px_rgba(59,130,246,0.1)]">
            <div className="flex justify-between items-center mb-5">
                <h3 className="m-0 text-sm text-slate-400 tracking-wide">BONO SUBYACENTE</h3>
                <div className="flex items-center gap-2">
                    {lastUpdated && (
                        <span className="text-[10px] text-slate-500 hidden sm:inline">
                            Updated: {lastUpdated}
                        </span>
                    )}
                    <button
                        onClick={handleSync}
                        disabled={isLoading}
                        className={`text-[10px] uppercase font-bold px-2 py-1 rounded border transition-colors ${hasApiKey
                                ? 'bg-blue-900/30 border-blue-500/30 text-blue-400 hover:bg-blue-900/50 hover:text-blue-300 cursor-pointer'
                                : 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed'
                            }`}
                        title={hasApiKey ? "Sincronizar Yield con Alpha Vantage" : "Requiere API Key (Configuración)"}
                    >
                        {isLoading ? 'Syncing...' : '↻ Sync'}
                    </button>
                </div>
            </div>

            <div className="grid gap-5">
                <SliderInput
                    label="Tipo actual (TIR)"
                    value={currentRate}
                    min={1}
                    max={7}
                    step={0.01}
                    onChange={onCurrentRateChange}
                    formatValue={(v) => `${v.toFixed(2)}%`}
                    colorClass="text-amber-500"
                    tooltip="Rentabilidad actual del bono en el mercado. Puedes sincronizar este valor con el mercado real usando el botón Sync."
                />
                <SliderInput
                    label="Cupón del bono"
                    value={bondCoupon}
                    min={0}
                    max={6}
                    step={0.25}
                    onChange={onBondCouponChange}
                    formatValue={(v) => `${v.toFixed(2)}%`}
                    colorClass="text-amber-500"
                    tooltip="Interés anual que paga el bono sobre su valor nominal. Un bono con cupón alto es menos sensible a cambios de tipos que uno con cupón bajo."
                />
                <SliderInput
                    label="Vencimiento del bono"
                    value={bondMaturity}
                    min={2}
                    max={30}
                    step={1}
                    onChange={onBondMaturityChange}
                    formatValue={(v) => `${v} años`}
                    colorClass="text-amber-500"
                    tooltip="Años hasta que el bono devuelve el principal. Bonos a largo plazo son más sensibles a cambios de tipos (mayor duración)."
                />
                <SliderInput
                    label="Valor nominal"
                    value={faceValue}
                    min={100}
                    max={10000}
                    step={100}
                    onChange={onFaceValueChange}
                    formatValue={(v) => `${v.toLocaleString()}€`}
                    colorClass="text-amber-500"
                    tooltip="Importe que recibes al vencimiento del bono. El nominal típico suele ser 1.000€."
                />
            </div>
        </div>
    );
};
