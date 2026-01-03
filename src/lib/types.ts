/**
 * Tipo de warrant
 */
export type WarrantType = 'PUT' | 'CALL';

/**
 * Parámetros del warrant
 */
export interface WarrantParams {
    type: WarrantType;
    strike: number;
    premium: number;
    ratio: number;
    expiry: number;
    volatility: number;
    quantity: number;
}

/**
 * Parámetros del bono subyacente
 */
export interface BondParams {
    coupon: number;
    maturity: number;
    currentRate: number;
    faceValue: number;
}

/**
 * Parámetros de mercado
 */
export interface MarketParams {
    riskFreeRate: number;
    simulatedRate: number;
}

/**
 * Parámetros de costes
 */
export interface CostParams {
    spreadPercent: number;
    commissionPercent: number;
    commissionFixed: number;
}

/**
 * Parámetros de tiempo
 */
export interface TimeParams {
    elapsedDays: number;
}

/**
 * Entrada completa del simulador (para provisioning JSON)
 */
export interface SimulatorInput {
    warrant: WarrantParams;
    bond: BondParams;
    market: MarketParams;
    costs: CostParams;
    time: TimeParams;
}

/**
 * Resultado de los cálculos financieros
 */
export interface Calculations {
    currentBondPrice: number;
    simulatedBondPrice: number;
    currentWarrantValue: number;
    simulatedWarrantValue: number;
    intrinsicValue: number;
    totalInvestment: number;
    currentPosition: number;
    simulatedPosition: number;
    profitLoss: number;
    profitLossPercent: number;
    duration: number;
    priceChange: number;
}

/**
 * Resultado de costes
 */
export interface CostsResult {
    spreadCost: number;
    commission: number;
    totalCosts: number;
    grossInvestment: number;
    netInvestment: number;
}

export interface Greeks {
    delta: number;
    gamma: number;
    vega: number;
    theta: number;
    rho: number;
}

/**
 * Salida completa del simulador (para export JSON)
 */
export interface SimulatorOutput {
    input: SimulatorInput;
    calculations: Calculations;
    costs: CostsResult;
    theta: number;
    greeks: Greeks;
    breakEvenRate: number | null;
    adjustedPnL: {
        totalInvestment: number;
        simulatedPosition: number;
        profitLoss: number;
        profitLossPercent: number;
    };
    remainingDays: number;
    remainingYears: number;
    timestamp: string;
}

/**
 * Punto de datos para el gráfico de payoff
 */
export interface PayoffDataPoint {
    rate: string;
    bondPrice: string;
    pnl: number;
    warrantValue: string;
}

/**
 * Operación guardada
 */
export interface SavedOperation {
    id: string;
    name: string;
    input: SimulatorInput;
    createdAt: string;
    updatedAt: string;
}
