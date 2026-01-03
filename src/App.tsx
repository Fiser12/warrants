import { useState, useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';

// Utilidades financieras
const calcBondPrice = (faceValue: number, coupon: number, ytm: number, years: number): number => {
    let price = 0;
    for (let t = 1; t <= years; t++) {
        price += (coupon * faceValue) / Math.pow(1 + ytm, t);
    }
    price += faceValue / Math.pow(1 + ytm, years);
    return price;
};

const calcWarrantValue = (bondPrice: number, strike: number, volatility: number, timeToExpiry: number, riskFreeRate: number, isPut: boolean): number => {
    if (timeToExpiry <= 0) {
        return isPut ? Math.max(0, strike - bondPrice) : Math.max(0, bondPrice - strike);
    }

    const d1 = (Math.log(bondPrice / strike) + (riskFreeRate + 0.5 * volatility * volatility) * timeToExpiry) / (volatility * Math.sqrt(timeToExpiry));
    const d2 = d1 - volatility * Math.sqrt(timeToExpiry);

    const normCDF = (x: number): number => {
        const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
        const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
        const sign = x < 0 ? -1 : 1;
        const absX = Math.abs(x) / Math.sqrt(2);
        const t = 1.0 / (1.0 + p * absX);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
        return 0.5 * (1.0 + sign * y);
    };

    if (isPut) {
        return strike * Math.exp(-riskFreeRate * timeToExpiry) * normCDF(-d2) - bondPrice * normCDF(-d1);
    }
    return bondPrice * normCDF(d1) - strike * Math.exp(-riskFreeRate * timeToExpiry) * normCDF(d2);
};

interface PayoffDataPoint {
    rate: string;
    bondPrice: string;
    pnl: number;
    warrantValue: string;
}

export default function WarrantSimulator() {
    // Estado del warrant
    const [warrantType, setWarrantType] = useState<'PUT' | 'CALL'>('PUT');
    const [strike, setStrike] = useState(100);
    const [premium, setPremium] = useState(2.5);
    const [ratio, setRatio] = useState(0.1);
    const [expiry, setExpiry] = useState(1);
    const [volatility, setVolatility] = useState(0.15);
    const [quantity, setQuantity] = useState(1000);

    // Estado del mercado
    const [currentRate, setCurrentRate] = useState(3.5);
    const [bondCoupon, setBondCoupon] = useState(3.0);
    const [bondMaturity, setBondMaturity] = useState(10);

    // Escenario simulado
    const [simulatedRate, setSimulatedRate] = useState(4.0);

    // Suprimir warning de volatility no usado en el setter
    void setVolatility;

    // Cálculos
    const calculations = useMemo(() => {
        const faceValue = 100;
        const currentBondPrice = calcBondPrice(faceValue, bondCoupon / 100, currentRate / 100, bondMaturity);
        const simulatedBondPrice = calcBondPrice(faceValue, bondCoupon / 100, simulatedRate / 100, bondMaturity);

        const isPut = warrantType === 'PUT';
        const currentWarrantValue = calcWarrantValue(currentBondPrice, strike, volatility, expiry, currentRate / 100, isPut);
        const simulatedWarrantValue = calcWarrantValue(simulatedBondPrice, strike, volatility, expiry * 0.8, simulatedRate / 100, isPut);

        const intrinsicValue = isPut
            ? Math.max(0, strike - simulatedBondPrice)
            : Math.max(0, simulatedBondPrice - strike);

        const totalInvestment = premium * quantity * ratio;
        const currentPosition = currentWarrantValue * quantity * ratio;
        const simulatedPosition = simulatedWarrantValue * quantity * ratio;
        const profitLoss = simulatedPosition - totalInvestment;
        const profitLossPercent = (profitLoss / totalInvestment) * 100;

        // Duration aproximada
        const duration = bondMaturity * 0.85;
        const priceChange = -duration * (simulatedRate - currentRate) / 100 * currentBondPrice;

        return {
            currentBondPrice,
            simulatedBondPrice,
            currentWarrantValue,
            simulatedWarrantValue,
            intrinsicValue,
            totalInvestment,
            currentPosition,
            simulatedPosition,
            profitLoss,
            profitLossPercent,
            duration,
            priceChange
        };
    }, [warrantType, strike, premium, ratio, expiry, volatility, quantity, currentRate, bondCoupon, bondMaturity, simulatedRate]);

    // Datos para gráfico de payoff
    const payoffData = useMemo((): PayoffDataPoint[] => {
        const data: PayoffDataPoint[] = [];
        for (let rate = 1; rate <= 7; rate += 0.25) {
            const bondPrice = calcBondPrice(100, bondCoupon / 100, rate / 100, bondMaturity);
            const isPut = warrantType === 'PUT';
            const warrantValue = calcWarrantValue(bondPrice, strike, volatility, expiry * 0.5, rate / 100, isPut);
            const position = warrantValue * quantity * ratio;
            const investment = premium * quantity * ratio;
            const pnl = position - investment;

            data.push({
                rate: rate.toFixed(2),
                bondPrice: bondPrice.toFixed(2),
                pnl: pnl,
                warrantValue: warrantValue.toFixed(3)
            });
        }
        return data;
    }, [warrantType, strike, premium, ratio, expiry, volatility, quantity, bondCoupon, bondMaturity]);

    const formatCurrency = (value: number): string => new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    }).format(value);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a0e17 0%, #121a2d 50%, #0d1321 100%)',
            color: '#e4e8ef',
            fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Grid pattern overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
        `,
                backgroundSize: '50px 50px',
                pointerEvents: 'none'
            }} />

            {/* Header */}
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
                    <span style={{ color: '#64748b', fontSize: '12px', letterSpacing: '2px' }}>LIVE SIMULATION</span>
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

            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        input[type="range"] {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          background: linear-gradient(90deg, #1e3a5f 0%, #3b82f6 100%);
          border-radius: 3px;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
          transition: transform 0.2s;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        .card {
          background: linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
          border: 1px solid rgba(59, 130, 246, 0.15);
          border-radius: 12px;
          padding: 20px;
          backdrop-filter: blur(10px);
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .card:hover {
          border-color: rgba(59, 130, 246, 0.3);
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1);
        }
        .metric-card {
          background: linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.7) 100%);
          border: 1px solid rgba(100, 116, 139, 0.2);
          border-radius: 10px;
          padding: 16px;
        }
        .btn-group button {
          padding: 10px 24px;
          border: 1px solid rgba(59, 130, 246, 0.3);
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.3s;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
        }
        .btn-group button:first-child {
          border-radius: 6px 0 0 6px;
        }
        .btn-group button:last-child {
          border-radius: 0 6px 6px 0;
        }
        .btn-group button.active {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border-color: #3b82f6;
        }
        .btn-group button:hover:not(.active) {
          background: rgba(59, 130, 246, 0.1);
        }
      `}</style>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', position: 'relative' }}>
                {/* Panel Izquierdo - Configuración */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Tipo de Warrant */}
                    <div className="card">
                        <h3 style={{ margin: '0 0 16px', fontSize: '14px', color: '#94a3b8', letterSpacing: '1px' }}>
                            TIPO DE OPERACIÓN
                        </h3>
                        <div className="btn-group" style={{ display: 'flex' }}>
                            <button
                                className={warrantType === 'PUT' ? 'active' : ''}
                                onClick={() => setWarrantType('PUT')}
                            >
                                🔻 PUT (Ganar si suben tipos)
                            </button>
                            <button
                                className={warrantType === 'CALL' ? 'active' : ''}
                                onClick={() => setWarrantType('CALL')}
                            >
                                🔺 CALL (Ganar si bajan tipos)
                            </button>
                        </div>
                        <p style={{ margin: '12px 0 0', fontSize: '12px', color: '#64748b' }}>
                            {warrantType === 'PUT'
                                ? '💡 Con un PUT, ganas cuando el precio del bono BAJA (tipos suben)'
                                : '💡 Con un CALL, ganas cuando el precio del bono SUBE (tipos bajan)'}
                        </p>
                    </div>

                    {/* Parámetros del Warrant */}
                    <div className="card">
                        <h3 style={{ margin: '0 0 20px', fontSize: '14px', color: '#94a3b8', letterSpacing: '1px' }}>
                            PARÁMETROS DEL WARRANT
                        </h3>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <label style={{ fontSize: '12px', color: '#64748b' }}>Strike (Precio ejercicio)</label>
                                    <span style={{ fontSize: '14px', color: '#60a5fa', fontWeight: '600' }}>{strike}€</span>
                                </div>
                                <input type="range" min="80" max="120" step="1" value={strike} onChange={(e) => setStrike(Number(e.target.value))} />
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <label style={{ fontSize: '12px', color: '#64748b' }}>Prima del Warrant</label>
                                    <span style={{ fontSize: '14px', color: '#60a5fa', fontWeight: '600' }}>{premium.toFixed(2)}€</span>
                                </div>
                                <input type="range" min="0.5" max="10" step="0.1" value={premium} onChange={(e) => setPremium(Number(e.target.value))} />
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <label style={{ fontSize: '12px', color: '#64748b' }}>Ratio (warrants por bono)</label>
                                    <span style={{ fontSize: '14px', color: '#60a5fa', fontWeight: '600' }}>{ratio}</span>
                                </div>
                                <input type="range" min="0.01" max="1" step="0.01" value={ratio} onChange={(e) => setRatio(Number(e.target.value))} />
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <label style={{ fontSize: '12px', color: '#64748b' }}>Vencimiento (años)</label>
                                    <span style={{ fontSize: '14px', color: '#60a5fa', fontWeight: '600' }}>{expiry} año{expiry !== 1 ? 's' : ''}</span>
                                </div>
                                <input type="range" min="0.25" max="3" step="0.25" value={expiry} onChange={(e) => setExpiry(Number(e.target.value))} />
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <label style={{ fontSize: '12px', color: '#64748b' }}>Cantidad de Warrants</label>
                                    <span style={{ fontSize: '14px', color: '#60a5fa', fontWeight: '600' }}>{quantity.toLocaleString()}</span>
                                </div>
                                <input type="range" min="100" max="10000" step="100" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                            </div>
                        </div>
                    </div>

                    {/* Parámetros del Bono */}
                    <div className="card">
                        <h3 style={{ margin: '0 0 20px', fontSize: '14px', color: '#94a3b8', letterSpacing: '1px' }}>
                            BONO SUBYACENTE · ESPAÑA
                        </h3>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <label style={{ fontSize: '12px', color: '#64748b' }}>Tipo actual (TIR)</label>
                                    <span style={{ fontSize: '14px', color: '#f59e0b', fontWeight: '600' }}>{currentRate.toFixed(2)}%</span>
                                </div>
                                <input type="range" min="1" max="7" step="0.1" value={currentRate} onChange={(e) => setCurrentRate(Number(e.target.value))} />
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <label style={{ fontSize: '12px', color: '#64748b' }}>Cupón del bono</label>
                                    <span style={{ fontSize: '14px', color: '#f59e0b', fontWeight: '600' }}>{bondCoupon.toFixed(2)}%</span>
                                </div>
                                <input type="range" min="0" max="6" step="0.25" value={bondCoupon} onChange={(e) => setBondCoupon(Number(e.target.value))} />
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <label style={{ fontSize: '12px', color: '#64748b' }}>Vencimiento del bono</label>
                                    <span style={{ fontSize: '14px', color: '#f59e0b', fontWeight: '600' }}>{bondMaturity} años</span>
                                </div>
                                <input type="range" min="2" max="30" step="1" value={bondMaturity} onChange={(e) => setBondMaturity(Number(e.target.value))} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel Derecho - Resultados */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Simulador de Escenario */}
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
                            <input
                                type="range"
                                min="1"
                                max="7"
                                step="0.1"
                                value={simulatedRate}
                                onChange={(e) => setSimulatedRate(Number(e.target.value))}
                                style={{
                                    background: `linear-gradient(90deg, #22c55e 0%, #eab308 50%, #ef4444 100%)`
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: '#64748b' }}>
                                <span>1%</span>
                                <span>Tipos {simulatedRate > currentRate ? '▲ SUBEN' : simulatedRate < currentRate ? '▼ BAJAN' : '= IGUAL'}</span>
                                <span>7%</span>
                            </div>
                        </div>
                    </div>

                    {/* Métricas del Bono */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="metric-card">
                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>PRECIO BONO ACTUAL</div>
                            <div style={{ fontSize: '22px', fontWeight: '700', color: '#60a5fa' }}>
                                {calculations.currentBondPrice.toFixed(2)}€
                            </div>
                        </div>
                        <div className="metric-card">
                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>PRECIO BONO SIMULADO</div>
                            <div style={{
                                fontSize: '22px',
                                fontWeight: '700',
                                color: calculations.simulatedBondPrice < calculations.currentBondPrice ? '#ef4444' : '#22c55e'
                            }}>
                                {calculations.simulatedBondPrice.toFixed(2)}€
                            </div>
                        </div>
                    </div>

                    {/* Resultado P&L */}
                    <div className="card" style={{
                        borderColor: calculations.profitLoss >= 0 ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                        background: calculations.profitLoss >= 0
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
                                    {formatCurrency(calculations.totalInvestment)}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>VALOR POSICIÓN</div>
                                <div style={{ fontSize: '18px', fontWeight: '600', color: '#60a5fa' }}>
                                    {formatCurrency(calculations.simulatedPosition)}
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
                                color: calculations.profitLoss >= 0 ? '#22c55e' : '#ef4444',
                                textShadow: calculations.profitLoss >= 0 ? '0 0 20px rgba(34, 197, 94, 0.5)' : '0 0 20px rgba(239, 68, 68, 0.5)'
                            }}>
                                {calculations.profitLoss >= 0 ? '+' : ''}{formatCurrency(calculations.profitLoss)}
                            </div>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: calculations.profitLoss >= 0 ? '#22c55e' : '#ef4444',
                                marginTop: '4px'
                            }}>
                                ({calculations.profitLossPercent >= 0 ? '+' : ''}{calculations.profitLossPercent.toFixed(1)}%)
                            </div>
                        </div>
                    </div>

                    {/* Gráfico de Payoff */}
                    <div className="card">
                        <h3 style={{ margin: '0 0 16px', fontSize: '14px', color: '#94a3b8', letterSpacing: '1px' }}>
                            📈 CURVA DE PAYOFF
                        </h3>
                        <div style={{ height: '220px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={payoffData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
                                    <XAxis
                                        dataKey="rate"
                                        stroke="#64748b"
                                        fontSize={11}
                                        tickFormatter={(v: string) => `${v}%`}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        fontSize={11}
                                        tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(15, 23, 42, 0.95)',
                                            border: '1px solid rgba(59, 130, 246, 0.3)',
                                            borderRadius: '8px',
                                            fontSize: '12px'
                                        }}
                                        formatter={(value: number) => [formatCurrency(value), 'P&L']}
                                        labelFormatter={(label: string) => `Tipo: ${label}%`}
                                    />
                                    <ReferenceLine y={0} stroke="#64748b" strokeDasharray="5 5" />
                                    <ReferenceLine
                                        x={currentRate.toFixed(2)}
                                        stroke="#f59e0b"
                                        strokeDasharray="3 3"
                                        label={{ value: 'Actual', fill: '#f59e0b', fontSize: 10 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="pnl"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        fill="url(#positiveGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <p style={{ fontSize: '11px', color: '#64748b', marginTop: '12px', textAlign: 'center' }}>
                            Eje X: Tipo de interés (%) · Eje Y: Beneficio/Pérdida (€)
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer con info de brokers */}
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
        </div>
    );
}