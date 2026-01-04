import { useState, useEffect } from 'react';

interface ScenarioSimulatorProps {
    simulatedRate: number; // This is now Risk Free Rate (BCE)
    currentRate: number;   // Should be some reference?
    creditSpread: number;  // bps
    onChange: (value: number) => void;
}

export const ScenarioSimulator = ({ simulatedRate, currentRate, creditSpread, onChange }: ScenarioSimulatorProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(String(simulatedRate));

    const totalYield = simulatedRate + (creditSpread / 100);

    const min = 0;
    const max = 8;
    const isOutOfRange = simulatedRate < min || simulatedRate > max;

    useEffect(() => {
        if (!isEditing) {
            setInputValue(String(simulatedRate));
        }
    }, [simulatedRate, isEditing]);

    const handleInputBlur = () => {
        setIsEditing(false);
        const parsed = parseFloat(inputValue.replace(/[^0-9.-]/g, ''));
        if (!isNaN(parsed)) {
            // Sin limitar al rango del slider
            const stepped = Math.round(parsed * 10) / 10;
            onChange(stepped);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleInputBlur();
        if (e.key === 'Escape') {
            setIsEditing(false);
            setInputValue(String(simulatedRate));
        }
    };

    const sliderValue = Math.min(max, Math.max(min, simulatedRate));

    return (
        <div className="rounded-xl p-4 sm:p-5 backdrop-blur-sm transition-all duration-300 bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-amber-500/30 hover:border-amber-500/50 hover:shadow-[0_8px_32px_rgba(234,179,8,0.1)]">
            <h3 className="m-0 mb-3 sm:mb-4 text-xs sm:text-sm text-amber-400 tracking-wide">⚡ ESCENARIO MACRO (BCE)</h3>

            <div>
                {/* Simulador de Tipos de Mercado */}
                <div>
                    <div className="flex justify-between mb-2 items-center">
                        <label className="text-[10px] sm:text-xs text-slate-500">Tasa Libre de Riesgo (BCE)</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onBlur={handleInputBlur}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                className={`text-lg sm:text-xl font-bold bg-transparent border-b border-amber-500 outline-none w-20 text-right text-amber-500`}
                            />
                        ) : (
                            <span
                                className={`text-lg sm:text-xl font-bold cursor-pointer hover:underline text-amber-500 ${isOutOfRange ? '!text-orange-400' : ''}`}
                                onClick={() => setIsEditing(true)}
                                title={isOutOfRange ? `Fuera del rango del slider (${min}%-${max}%)` : 'Click para editar'}
                            >
                                {simulatedRate.toFixed(2)}%
                            </span>
                        )}
                    </div>

                    <input
                        type="range"
                        min={min}
                        max={max}
                        step={0.1}
                        value={sliderValue}
                        onChange={(e) => onChange(Number(e.target.value))}
                        className="w-full h-1.5 rounded cursor-pointer appearance-none bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,0,0,0.5)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:scale-110"
                    />

                    <div className="flex justify-between mt-1 text-[10px] sm:text-[11px] text-slate-500">
                        <span>{min}%</span>
                        <span className="text-emerald-400/80">+ Spread {creditSpread} bps = TIR {totalYield.toFixed(2)}%</span>
                        <span>{max}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
