import type { WarrantType } from '../lib/types';

interface HeaderProps {
    warrantType: WarrantType;
}

export const Header = ({ warrantType }: HeaderProps) => {
    return (
        <header style={{
            position: 'relative',
            marginBottom: '32px',
            borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
            paddingBottom: '20px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                <div style={{
                    width: '12px',
                    height: '12px',
                    background: '#22c55e',
                    borderRadius: '50%',
                    boxShadow: '0 0 12px #22c55e',
                    animation: 'pulse 2s infinite'
                }} />
                <span style={{ color: '#64748b', fontSize: '12px', letterSpacing: '2px' }}>
                    LIVE SIMULATION
                </span>
            </div>
            <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
                letterSpacing: '-0.5px'
            }}>
                WARRANT SIMULATOR
            </h1>
            <p style={{ color: '#64748b', margin: '8px 0 0', fontSize: '13px' }}>
                Deuda Soberana España · Bonos del Estado · {warrantType === 'PUT' ? 'Posición Bajista' : 'Posición Alcista'}
            </p>
        </header>
    );
};
