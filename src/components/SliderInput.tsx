import type { CSSProperties } from 'react';

interface SliderInputProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    formatValue?: (value: number) => string;
    color?: string;
    style?: CSSProperties;
}

export const SliderInput = ({
    label,
    value,
    min,
    max,
    step,
    onChange,
    formatValue,
    color = '#60a5fa',
    style,
}: SliderInputProps) => {
    const displayValue = formatValue ? formatValue(value) : String(value);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', color: '#64748b' }}>{label}</label>
                <span style={{ fontSize: '14px', color, fontWeight: '600' }}>{displayValue}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                style={style}
            />
        </div>
    );
};
