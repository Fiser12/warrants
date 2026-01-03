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
 * Punto de datos para el gráfico de payoff
 */
export interface PayoffDataPoint {
    rate: string;
    bondPrice: string;
    pnl: number;
    warrantValue: string;
}
