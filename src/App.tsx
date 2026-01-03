import { useState } from 'react';

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
    MarketParamsCard,
} from './components';

export default function App() {
    const [warrantType, setWarrantType] = useState<WarrantType>('PUT');
    const [strike, setStrike] = useState(100);
    const [premium, setPremium] = useState(2.5);
    const [ratio, setRatio] = useState(0.1);
    const [expiry, setExpiry] = useState(1);
    const [volatility, setVolatility] = useState(0.15);
    const [quantity, setQuantity] = useState(1000);
    const [currentRate, setCurrentRate] = useState(3.5);
    const [bondCoupon, setBondCoupon] = useState(3.0);
    const [bondMaturity, setBondMaturity] = useState(10);
    const [simulatedRate, setSimulatedRate] = useState(4.0);
    const [riskFreeRate, setRiskFreeRate] = useState(3.0);
    const [faceValue, setFaceValue] = useState(100);

    const calculations = useWarrantCalculations({
        warrantType, strike, premium, ratio, expiry, volatility, quantity,
        currentRate, bondCoupon, bondMaturity, simulatedRate, riskFreeRate, faceValue,
    });

    const payoffData = usePayoffData({
        warrantType, strike, premium, ratio, expiry, volatility, quantity,
        bondCoupon, bondMaturity, faceValue,
    });

    return (
        <div className="min-h-screen p-6 relative overflow-hidden font-mono text-slate-200 bg-gradient-to-br from-[#0a0e17] via-[#121a2d] to-[#0d1321]">
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

            <div className="relative">
                <Header warrantType={warrantType} />

                <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-5">
                        <WarrantTypeSelector value={warrantType} onChange={setWarrantType} />
                        <WarrantParamsCard
                            strike={strike} premium={premium} ratio={ratio} expiry={expiry} quantity={quantity}
                            volatility={volatility}
                            onStrikeChange={setStrike} onPremiumChange={setPremium} onRatioChange={setRatio}
                            onExpiryChange={setExpiry} onQuantityChange={setQuantity} onVolatilityChange={setVolatility}
                        />
                        <BondParamsCard
                            currentRate={currentRate} bondCoupon={bondCoupon} bondMaturity={bondMaturity}
                            faceValue={faceValue}
                            onCurrentRateChange={setCurrentRate} onBondCouponChange={setBondCoupon}
                            onBondMaturityChange={setBondMaturity} onFaceValueChange={setFaceValue}
                        />
                        <MarketParamsCard
                            riskFreeRate={riskFreeRate}
                            onRiskFreeRateChange={setRiskFreeRate}
                        />
                    </div>

                    <div className="flex flex-col gap-5">
                        <ScenarioSimulator simulatedRate={simulatedRate} currentRate={currentRate} onChange={setSimulatedRate} />
                        <BondMetrics currentBondPrice={calculations.currentBondPrice} simulatedBondPrice={calculations.simulatedBondPrice} />
                        <PnLResult
                            totalInvestment={calculations.totalInvestment} simulatedPosition={calculations.simulatedPosition}
                            profitLoss={calculations.profitLoss} profitLossPercent={calculations.profitLossPercent}
                        />
                        <PayoffChart data={payoffData} currentRate={currentRate} />
                    </div>
                </div>

                <BrokersFooter />
            </div>
        </div>
    );
}