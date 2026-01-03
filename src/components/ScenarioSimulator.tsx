import { SliderInput } from './SliderInput';

interface ScenarioSimulatorProps {
    simulatedRate: number;
    currentRate: number;
    onChange: (value: number) => void;
}

export const ScenarioSimulator = ({
    simulatedRate,
    currentRate,
    onChange,
}: ScenarioSimulatorProps) => {
    const rateDirection = simulatedRate > currentRate
        ? '▲ SUBEN'
        : simulatedRate < currentRate
            ? '▼ BAJAN'
            : '= IGUAL';

    return (
        <div className="card" style={{ borderColor: 'rgba(234, 179, 8, 0.3)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '14px', color: '#fbbf24', letterSpacing: '1px' }}>
                ⚡ SIMULADOR DE ESCENARIO
            </h3>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ fontSize: '12px', color: '#64748b' }}>Tipo de interés simulado</label>
                    <span style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: simulatedRate > currentRate ? '#ef4444' : '#22c55e'
                    }}>
                        {simulatedRate.toFixed(2)}%
                    </span>
                </div>
                <SliderInput
                    label=""
                    value={simulatedRate}
                    min={1}
                    max={7}
                    step={0.1}
                    onChange={onChange}
                    style={{
                        background: 'linear-gradient(90deg, #22c55e 0%, #eab308 50%, #ef4444 100%)'
                    }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: '#64748b' }}>
                    <span>1%</span>
                    <span>Tipos {rateDirection}</span>
                    <span>7%</span>
                </div>
            </div>
        </div>
    );
};
