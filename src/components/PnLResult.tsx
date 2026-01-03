import { formatCurrency } from '../lib/formatters';

interface PnLResultProps {
    totalInvestment: number;
    simulatedPosition: number;
    profitLoss: number;
    profitLossPercent: number;
}

export const PnLResult = ({
    totalInvestment,
    simulatedPosition,
    profitLoss,
    profitLossPercent,
}: PnLResultProps) => {
    const isProfit = profitLoss >= 0;

    return (
        <div className="card" style={{
            borderColor: isProfit ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
            background: isProfit
                ? 'linear-gradient(145deg, rgba(34, 197, 94, 0.1) 0%, rgba(15, 23, 42, 0.9) 100%)'
                : 'linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(15, 23, 42, 0.9) 100%)'
        }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '14px', color: '#94a3b8', letterSpacing: '1px' }}>
                📊 RESULTADO DE LA OPERACIÓN
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>INVERSIÓN TOTAL</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#94a3b8' }}>
                        {formatCurrency(totalInvestment)}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>VALOR POSICIÓN</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#60a5fa' }}>
                        {formatCurrency(simulatedPosition)}
                    </div>
                </div>
            </div>

            <div style={{
                marginTop: '20px',
                padding: '20px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>BENEFICIO / PÉRDIDA</div>
                <div style={{
                    fontSize: '36px',
                    fontWeight: '700',
                    color: isProfit ? '#22c55e' : '#ef4444',
                    textShadow: isProfit ? '0 0 20px rgba(34, 197, 94, 0.5)' : '0 0 20px rgba(239, 68, 68, 0.5)'
                }}>
                    {isProfit ? '+' : ''}{formatCurrency(profitLoss)}
                </div>
                <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: isProfit ? '#22c55e' : '#ef4444',
                    marginTop: '4px'
                }}>
                    ({profitLossPercent >= 0 ? '+' : ''}{profitLossPercent.toFixed(1)}%)
                </div>
            </div>
        </div>
    );
};
