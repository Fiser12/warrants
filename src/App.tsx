import { useState } from 'react';
import './styles/global.css';

import type { WarrantType } from './lib/types';
import { useWarrantCalculations, usePayoffData } from './hooks';
import {
    Header,
    WarrantTypeSelector,
    WarrantParamsCard,
    BondParamsCard,
    ScenarioSimulator,
    BondMetrics,
    PnLResult,
    PayoffChart,
    BrokersFooter,
} from './components';

export default function App() {
    // Estado del warrant
    const [warrantType, setWarrantType] = useState<WarrantType>('PUT');
    const [strike, setStrike] = useState(100);
    const [premium, setPremium] = useState(2.5);
    const [ratio, setRatio] = useState(0.1);
    const [expiry, setExpiry] = useState(1);
    const [volatility] = useState(0.15);
    const [quantity, setQuantity] = useState(1000);

    // Estado del mercado
    const [currentRate, setCurrentRate] = useState(3.5);
    const [bondCoupon, setBondCoupon] = useState(3.0);
    const [bondMaturity, setBondMaturity] = useState(10);

    // Escenario simulado
    const [simulatedRate, setSimulatedRate] = useState(4.0);

    // Cálculos
    const calculations = useWarrantCalculations({
        warrantType,
        strike,
        premium,
        ratio,
        expiry,
        volatility,
        quantity,
        currentRate,
        bondCoupon,
        bondMaturity,
        simulatedRate,
    });

    // Datos del gráfico
    const payoffData = usePayoffData({
        warrantType,
        strike,
        premium,
        ratio,
        expiry,
        volatility,
        quantity,
        bondCoupon,
        bondMaturity,
    });

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

            <Header warrantType={warrantType} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', position: 'relative' }}>
                {/* Panel Izquierdo - Configuración */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <WarrantTypeSelector value={warrantType} onChange={setWarrantType} />

                    <WarrantParamsCard
                        strike={strike}
                        premium={premium}
                        ratio={ratio}
                        expiry={expiry}
                        quantity={quantity}
                        onStrikeChange={setStrike}
                        onPremiumChange={setPremium}
                        onRatioChange={setRatio}
                        onExpiryChange={setExpiry}
                        onQuantityChange={setQuantity}
                    />

                    <BondParamsCard
                        currentRate={currentRate}
                        bondCoupon={bondCoupon}
                        bondMaturity={bondMaturity}
                        onCurrentRateChange={setCurrentRate}
                        onBondCouponChange={setBondCoupon}
                        onBondMaturityChange={setBondMaturity}
                    />
                </div>

                {/* Panel Derecho - Resultados */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <ScenarioSimulator
                        simulatedRate={simulatedRate}
                        currentRate={currentRate}
                        onChange={setSimulatedRate}
                    />

                    <BondMetrics
                        currentBondPrice={calculations.currentBondPrice}
                        simulatedBondPrice={calculations.simulatedBondPrice}
                    />

                    <PnLResult
                        totalInvestment={calculations.totalInvestment}
                        simulatedPosition={calculations.simulatedPosition}
                        profitLoss={calculations.profitLoss}
                        profitLossPercent={calculations.profitLossPercent}
                    />

                    <PayoffChart data={payoffData} currentRate={currentRate} />
                </div>
            </div>

            <BrokersFooter />
        </div>
    );
}