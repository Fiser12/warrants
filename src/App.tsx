import { useState, useMemo, useCallback } from 'react';

import type { WarrantType, SimulatorInput, SimulatorOutput, SavedOperation } from './lib/types';
import { runSimulation } from './lib/simulator';
import {
    useWarrantCalculations,
    usePayoffData,
    useTimeDecayData,
    useCosts,
    useTheta,
    useBreakEven,
    useSavedOperations,
} from './hooks';
import {
    Header,
    WarrantTypeSelector,
    WarrantPropsCard,
    MarketPropsCard,
    BondParamsCard,
    ScenarioSimulator,
    BondMetrics,
    PnLResult,
    PayoffChart,

    TimeSimulatorCard,
    TimeDecayChart,
    CostsCard,
    BreakEvenDisplay,
    Sidebar,
    ComparisonView,
} from './components';

export default function App() {
    // Saved operations
    const {
        operations,
        saveOperation,
        updateOperation,
        duplicateOperation,
        deleteOperation,
        renameOperation,
    } = useSavedOperations();

    const [currentOperationId, setCurrentOperationId] = useState<string | null>(null);
    const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showComparison, setShowComparison] = useState(false);

    // Warrant params
    const [warrantType, setWarrantType] = useState<WarrantType>('PUT');
    const [strike, setStrike] = useState(100);
    const [premium, setPremium] = useState(2.5);
    const [ratio, setRatio] = useState(0.1);
    const [expiry, setExpiry] = useState(1);
    const [volatility, setVolatility] = useState(0.15);
    const [quantity, setQuantity] = useState(1000);

    // Bond params
    const [currentRate, setCurrentRate] = useState(3.5);
    const [bondCoupon, setBondCoupon] = useState(3.0);
    const [bondMaturity, setBondMaturity] = useState(10);
    const [faceValue, setFaceValue] = useState(100);

    // Market params
    const [riskFreeRate, setRiskFreeRate] = useState(3.0);
    const [creditSpread, setCreditSpread] = useState(50); // bps

    // Derived simulation value
    const simulatedRate = riskFreeRate + (creditSpread / 100);

    // Time simulation
    const [elapsedDays, setElapsedDays] = useState(0);

    // Costs
    const [spreadPercent, setSpreadPercent] = useState(2.0);
    const [commissionPercent, setCommissionPercent] = useState(0.15);
    const [commissionFixed, setCommissionFixed] = useState(5);

    // Derived values
    const totalDays = Math.round(expiry * 365);
    const remainingYears = Math.max(0, (totalDays - elapsedDays) / 365);

    // Build input for export
    const currentInput: SimulatorInput = useMemo(() => ({
        warrant: { type: warrantType, strike, premium, ratio, expiry, volatility, quantity },
        bond: { coupon: bondCoupon, maturity: bondMaturity, currentRate, faceValue },
        market: { riskFreeRate, simulatedRate }, // simulatedRate is now calculated above
        costs: { spreadPercent, commissionPercent, commissionFixed },
        time: { elapsedDays },
    }), [warrantType, strike, premium, ratio, expiry, volatility, quantity, bondCoupon, bondMaturity, currentRate, faceValue, riskFreeRate, simulatedRate, spreadPercent, commissionPercent, commissionFixed, elapsedDays]);

    // Run simulation for export
    const currentOutput: SimulatorOutput = useMemo(() => runSimulation(currentInput), [currentInput]);

    // Load operation into state
    const loadOperation = useCallback((operation: SavedOperation) => {
        const input = operation.input;
        setWarrantType(input.warrant.type);
        setStrike(input.warrant.strike);
        setPremium(input.warrant.premium);
        setRatio(input.warrant.ratio);
        setExpiry(input.warrant.expiry);
        setVolatility(input.warrant.volatility);
        setQuantity(input.warrant.quantity);
        setBondCoupon(input.bond.coupon);
        setBondMaturity(input.bond.maturity);
        setCurrentRate(input.bond.currentRate);
        setFaceValue(input.bond.faceValue);
        setRiskFreeRate(input.market.riskFreeRate);
        // We need to infer credit spread if loading old operation or just set default
        // Old operations might not have credit spread concept stored separately if we rely on simulatedRate difference
        // For now, let's derive it or default it. 
        // If simulatedRate is stored, we can try: CreditSpread = (Simulated - RiskFree) * 100
        const derivedSpread = Math.max(0, Math.round((input.market.simulatedRate - input.market.riskFreeRate) * 100));
        setCreditSpread(derivedSpread);

        setSpreadPercent(input.costs.spreadPercent);
        setCommissionPercent(input.costs.commissionPercent);
        setCommissionFixed(input.costs.commissionFixed);
        setElapsedDays(input.time.elapsedDays);
        setCurrentOperationId(operation.id);
        setShowComparison(false); // Close comparison if loading single operation
    }, []);

    // Import handler (for header menu)
    const handleImport = useCallback((input: SimulatorInput) => {
        setWarrantType(input.warrant.type);
        setStrike(input.warrant.strike);
        setPremium(input.warrant.premium);
        setRatio(input.warrant.ratio);
        setExpiry(input.warrant.expiry);
        setVolatility(input.warrant.volatility);
        setQuantity(input.warrant.quantity);
        setBondCoupon(input.bond.coupon);
        setBondMaturity(input.bond.maturity);
        setCurrentRate(input.bond.currentRate);
        setFaceValue(input.bond.faceValue);
        setRiskFreeRate(input.market.riskFreeRate);

        const derivedSpread = Math.max(0, Math.round((input.market.simulatedRate - input.market.riskFreeRate) * 100));
        setCreditSpread(derivedSpread);

        setSpreadPercent(input.costs.spreadPercent);
        setCommissionPercent(input.costs.commissionPercent);
        setCommissionFixed(input.costs.commissionFixed);
        setElapsedDays(input.time.elapsedDays);
        setCurrentOperationId(null);
    }, []);

    // Save as new operation
    const handleSaveNew = useCallback((name?: string) => {
        const operation = saveOperation(currentInput, name);
        setCurrentOperationId(operation.id);
    }, [currentInput, saveOperation]);

    // Update existing operation
    const handleUpdate = useCallback(() => {
        if (currentOperationId) {
            updateOperation(currentOperationId, currentInput);
            // Optional: Show toast feedback
        }
    }, [currentOperationId, currentInput, updateOperation]);

    // Toggle compare selection
    const handleToggleCompare = useCallback((id: string) => {
        setSelectedForCompare(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    }, []);

    // Compare handler
    const handleCompare = useCallback(() => {
        setShowComparison(true);
    }, []);

    // Hooks (for UI reactivity)
    const costs = useCosts({
        premium, quantity, ratio, spreadPercent, commissionPercent, commissionFixed,
    });

    const theta = useTheta({
        warrantType, faceValue, bondCoupon, currentRate, bondMaturity,
        strike, volatility, remainingYears, riskFreeRate, quantity, ratio,
    });

    const breakEvenRate = useBreakEven({
        warrantType, premium, quantity, ratio, totalCosts: costs.totalCosts,
        faceValue, bondCoupon, bondMaturity, strike, volatility, remainingYears, riskFreeRate,
    });

    const calculations = useWarrantCalculations({
        warrantType, strike, premium, ratio, expiry: remainingYears, volatility, quantity,
        currentRate, bondCoupon, bondMaturity, simulatedRate, riskFreeRate, faceValue,
    });

    const payoffData = usePayoffData({
        warrantType, strike, premium, ratio, expiry: remainingYears, volatility, quantity,
        bondCoupon, bondMaturity, faceValue,
    });

    const timeDecayData = useTimeDecayData({
        warrantType, strike, volatility, expiryYears: expiry, riskFreeRate,
        currentRate, bondCoupon, bondMaturity, faceValue,
    });

    // Adjusted P&L with costs
    const adjustedPnL = useMemo(() => ({
        totalInvestment: costs.netInvestment,
        simulatedPosition: calculations.simulatedPosition,
        profitLoss: calculations.simulatedPosition - costs.netInvestment,
        profitLossPercent: ((calculations.simulatedPosition - costs.netInvestment) / costs.netInvestment) * 100,
    }), [calculations.simulatedPosition, costs.netInvestment]);

    // Get selected operations for comparison
    const selectedOperations = useMemo(
        () => operations.filter(op => selectedForCompare.includes(op.id)),
        [operations, selectedForCompare]
    );

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-[#0a0e17] via-[#121a2d] to-[#0d1321]">
            {/* Sidebar - fixed */}
            {sidebarOpen && (
                <Sidebar
                    operations={operations}
                    currentOperationId={currentOperationId}
                    onSelect={loadOperation}
                    onSaveNew={handleSaveNew}
                    onUpdate={handleUpdate}
                    onDuplicate={duplicateOperation}
                    onDelete={deleteOperation}
                    onRename={renameOperation}
                    selectedForCompare={selectedForCompare}
                    onToggleCompare={handleToggleCompare}
                    onCompare={handleCompare}
                />
            )}

            {/* Main content */}
            <div className={`flex-1 min-h-screen relative overflow-hidden font-mono text-slate-200 transition-all duration-300 ${sidebarOpen ? 'ml-64' : ''}`}>
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

                {/* Toggle sidebar button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className={`fixed top-0 z-40 p-2 bg-slate-800 hover:bg-slate-700 border-r border-b border-slate-600/50 rounded-br-lg text-slate-400 hover:text-white text-sm transition-all duration-300 ${sidebarOpen ? 'left-64' : 'left-0'}`}
                    title={sidebarOpen ? 'Ocultar panel' : 'Mostrar panel'}
                >
                    {sidebarOpen ? '◀' : '▶'}
                </button>

                {showComparison && selectedOperations.length > 0 ? (
                    <ComparisonView
                        operations={selectedOperations}
                        onClose={() => setShowComparison(false)}
                    />
                ) : (
                    <div className="p-3 sm:p-6 relative max-w-7xl mx-auto">
                        <Header
                            warrantType={warrantType}
                            currentInput={currentInput}
                            currentOutput={currentOutput}
                            onImport={handleImport}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                            {/* Columna 1: CONTRATO (Estático) */}
                            <div className="flex flex-col gap-4 sm:gap-5">
                                <WarrantTypeSelector value={warrantType} onChange={setWarrantType} />
                                <BondParamsCard
                                    currentRate={currentRate} bondCoupon={bondCoupon} bondMaturity={bondMaturity}
                                    faceValue={faceValue}
                                    onCurrentRateChange={setCurrentRate} onBondCouponChange={setBondCoupon}
                                    onBondMaturityChange={setBondMaturity} onFaceValueChange={setFaceValue}
                                />
                                <WarrantPropsCard
                                    strike={strike} premium={premium} ratio={ratio} expiry={expiry} quantity={quantity}
                                    onStrikeChange={setStrike} onPremiumChange={setPremium} onRatioChange={setRatio}
                                    onExpiryChange={setExpiry} onQuantityChange={setQuantity}
                                />
                                <CostsCard
                                    spreadPercent={spreadPercent} commissionPercent={commissionPercent} commissionFixed={commissionFixed}
                                    onSpreadChange={setSpreadPercent} onCommissionPercentChange={setCommissionPercent}
                                    onCommissionFixedChange={setCommissionFixed}
                                />
                            </div>

                            {/* Columna 2: MERCADO (Simulación) */}
                            <div className="flex flex-col gap-4 sm:gap-5">
                                <ScenarioSimulator
                                    simulatedRate={riskFreeRate}
                                    currentRate={3.0} // Base reference or just hardcode? Or maybe current RiskFree which we don't fetch... for now show just rate.
                                    onChange={setRiskFreeRate}
                                    creditSpread={creditSpread} // Pass spread to show total yield context?
                                />
                                <MarketPropsCard
                                    volatility={volatility} creditSpread={creditSpread} riskFreeRate={riskFreeRate}
                                    onVolatilityChange={setVolatility} onCreditSpreadChange={setCreditSpread}
                                />
                                <TimeSimulatorCard expiryYears={expiry} elapsedDays={elapsedDays} theta={theta} onElapsedDaysChange={setElapsedDays} />
                            </div>

                            {/* Columna 3: RESULTADOS */}
                            <div className="flex flex-col gap-4 sm:gap-5">
                                <BondMetrics currentBondPrice={calculations.currentBondPrice} simulatedBondPrice={calculations.simulatedBondPrice} />
                                <BreakEvenDisplay breakEvenRate={breakEvenRate} currentRate={currentRate} warrantType={warrantType} />
                                <PnLResult
                                    totalInvestment={adjustedPnL.totalInvestment}
                                    simulatedPosition={adjustedPnL.simulatedPosition}
                                    profitLoss={adjustedPnL.profitLoss}
                                    profitLossPercent={adjustedPnL.profitLossPercent}
                                />
                                <PayoffChart data={payoffData} currentRate={currentRate} />
                                <TimeDecayChart data={timeDecayData} currentDay={elapsedDays} totalDays={totalDays} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}