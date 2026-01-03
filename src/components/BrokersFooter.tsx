export const BrokersFooter = () => {
    return (
        <footer style={{
            marginTop: '32px',
            padding: '20px',
            background: 'rgba(30, 41, 59, 0.5)',
            borderRadius: '12px',
            border: '1px solid rgba(100, 116, 139, 0.2)'
        }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '13px', color: '#94a3b8' }}>
                🏦 BROKERS CON WARRANTS SOBRE DEUDA ESPAÑOLA
            </h4>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '12px', color: '#64748b' }}>
                <div><strong style={{ color: '#60a5fa' }}>Andbank</strong> · Warrants Société Générale</div>
                <div><strong style={{ color: '#60a5fa' }}>Renta 4</strong> · Amplio catálogo warrants</div>
                <div><strong style={{ color: '#60a5fa' }}>BBVA Trader</strong> · Warrants BBVA</div>
                <div><strong style={{ color: '#60a5fa' }}>Bankinter</strong> · Derivados y warrants</div>
                <div><strong style={{ color: '#60a5fa' }}>Interactive Brokers</strong> · Opciones sobre futuros de bonos</div>
            </div>
            <p style={{ margin: '16px 0 0', fontSize: '11px', color: '#475569', lineHeight: '1.6' }}>
                ⚠️ <strong>Aviso:</strong> Los warrants son productos complejos de alto riesgo. Puedes perder toda tu inversión.
                Este simulador es solo educativo y no constituye asesoramiento financiero. Consulta con un profesional antes de invertir.
            </p>
        </footer>
    );
};
