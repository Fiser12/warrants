import { useState, useEffect } from 'react';

interface SliderInputProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    formatValue?: (value: number) => string;
    parseValue?: (formatted: string) => number;
    colorClass?: string;
    sliderClass?: string;
    unit?: string;
}

export const SliderInput = ({
    label,
    value,
    min,
    max,
    step,
    onChange,
    formatValue,
    parseValue,
    colorClass = 'text-blue-400',
    sliderClass = '',
    unit = '',
}: SliderInputProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(String(value));

    useEffect(() => {
        if (!isEditing) {
            setInputValue(String(value));
        }
    }, [value, isEditing]);

    const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputBlur = () => {
        setIsEditing(false);
        let parsed: number;

        if (parseValue) {
            parsed = parseValue(inputValue);
        } else {
            parsed = parseFloat(inputValue.replace(/[^0-9.-]/g, ''));
        }

        if (!isNaN(parsed)) {
            // Redondear al step más cercano pero SIN limitar al min/max
            const stepped = Math.round(parsed / step) * step;
            onChange(stepped);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleInputBlur();
        }
        if (e.key === 'Escape') {
            setIsEditing(false);
            setInputValue(String(value));
        }
    };

    // El slider se limita a su rango, pero el valor mostrado puede estar fuera
    const sliderValue = Math.min(max, Math.max(min, value));
    const isOutOfRange = value < min || value > max;

    return (
        <div>
            {label && (
                <div className="flex justify-between mb-2">
                    <label className="text-xs text-slate-500">{label}</label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className={`text-sm font-semibold bg-transparent border-b border-blue-500 outline-none w-20 text-right ${colorClass}`}
                        />
                    ) : (
                        <span
                            className={`text-sm font-semibold cursor-pointer hover:underline ${colorClass} ${isOutOfRange ? 'text-orange-400' : ''}`}
                            onClick={() => setIsEditing(true)}
                            title={isOutOfRange ? `Fuera del rango del slider (${min}-${max})` : 'Click para editar'}
                        >
                            {displayValue}
                        </span>
                    )}
                </div>
            )}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={sliderValue}
                onChange={(e) => onChange(Number(e.target.value))}
                className={`w-full h-1.5 rounded cursor-pointer appearance-none bg-gradient-to-r from-slate-700 to-blue-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-blue-400 [&::-webkit-slider-thumb]:to-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(59,130,246,0.5)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:scale-110 ${sliderClass}`}
            />
        </div>
    );
};
