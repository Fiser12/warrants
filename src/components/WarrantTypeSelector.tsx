import type { WarrantType } from '../lib/types';

interface WarrantTypeSelectorProps {
    value: WarrantType;
    onChange: (type: WarrantType) => void;
}

export const WarrantTypeSelector = ({ value, onChange }: WarrantTypeSelectorProps) => {
    return (
        <div className="card">
            <h3 style={{ margin: '0 0 16px', fontSize: '14px', color: '#94a3b8', letterSpacing: '1px' }}>
                TIPO DE OPERACIÓN
            </h3>
            <div className="btn-group" style={{ display: 'flex' }}>
                <button
                    className={value === 'PUT' ? 'active' : ''}
                    onClick={() => onChange('PUT')}
                >
                    🔻 PUT (Ganar si suben tipos)
                </button>
                <button
                    className={value === 'CALL' ? 'active' : ''}
                    onClick={() => onChange('CALL')}
                >
                    🔺 CALL (Ganar si bajan tipos)
                </button>
            </div>
            <p style={{ margin: '12px 0 0', fontSize: '12px', color: '#64748b' }}>
                {value === 'PUT'
                    ? '💡 Con un PUT, ganas cuando el precio del bono BAJA (tipos suben)'
                    : '💡 Con un CALL, ganas cuando el precio del bono SUBE (tipos bajan)'}
            </p>
        </div>
    );
};
