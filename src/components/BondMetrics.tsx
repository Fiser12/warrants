interface BondMetricsProps {
    currentBondPrice: number;
    simulatedBondPrice: number;
}

export const BondMetrics = ({ currentBondPrice, simulatedBondPrice }: BondMetricsProps) => {
    const priceDropped = simulatedBondPrice < currentBondPrice;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="metric-card">
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                    PRECIO BONO ACTUAL
                </div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#60a5fa' }}>
                    {currentBondPrice.toFixed(2)}€
                </div>
            </div>
            <div className="metric-card">
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                    PRECIO BONO SIMULADO
                </div>
                <div style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    color: priceDropped ? '#ef4444' : '#22c55e'
                }}>
                    {simulatedBondPrice.toFixed(2)}€
                </div>
            </div>
        </div>
    );
};
