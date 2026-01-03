import { calcBondPrice, calcWarrantValue, calcDuration, calcGreeks } from './financial';
import type { SimulatorInput, SimulatorOutput, Calculations, CostsResult } from './types';

/**
 * Función pura de simulación - sin dependencias de React
 * Puede usarse directamente en tests
 */
export function runSimulation(input: SimulatorInput): SimulatorOutput {
    const { warrant, bond, market, costs, time } = input;

    // Calcular tiempo restante
    const totalDays = Math.round(warrant.expiry * 365);
    const remainingDays = Math.max(0, totalDays - time.elapsedDays);
    const remainingYears = remainingDays / 365;

    const isPut = warrant.type === 'PUT';

    // Precios del bono
    const currentBondPrice = calcBondPrice(
        bond.faceValue, bond.coupon / 100, bond.currentRate / 100, bond.maturity
    );
    const simulatedBondPrice = calcBondPrice(
        bond.faceValue, bond.coupon / 100, market.simulatedRate / 100, bond.maturity
    );

    // Valores del warrant
    const currentWarrantValue = calcWarrantValue(
        currentBondPrice, warrant.strike, warrant.volatility, remainingYears, market.riskFreeRate / 100, isPut
    );
    const simulatedWarrantValue = calcWarrantValue(
        simulatedBondPrice, warrant.strike, warrant.volatility, remainingYears * 0.8, market.riskFreeRate / 100, isPut
    );

    // Valor intrínseco
    const intrinsicValue = isPut
        ? Math.max(0, warrant.strike - simulatedBondPrice)
        : Math.max(0, simulatedBondPrice - warrant.strike);

    // Inversión y posiciones
    const grossInvestment = warrant.premium * warrant.quantity * warrant.ratio;
    const currentPosition = currentWarrantValue * warrant.quantity * warrant.ratio;
    const simulatedPosition = simulatedWarrantValue * warrant.quantity * warrant.ratio;

    // Costes
    const spreadCost = grossInvestment * (costs.spreadPercent / 100);
    const commissionCalc = grossInvestment * (costs.commissionPercent / 100);
    const commission = Math.max(costs.commissionFixed, commissionCalc) * 2;
    const totalCosts = spreadCost + commission;
    const netInvestment = grossInvestment + totalCosts;

    // Duration
    const duration = calcDuration(bond.maturity);
    const priceChange = -duration * (market.simulatedRate - bond.currentRate) / 100 * currentBondPrice;

    // Calculations object
    const calculations: Calculations = {
        currentBondPrice,
        simulatedBondPrice,
        currentWarrantValue,
        simulatedWarrantValue,
        intrinsicValue,
        totalInvestment: grossInvestment,
        currentPosition,
        simulatedPosition,
        profitLoss: simulatedPosition - grossInvestment,
        profitLossPercent: ((simulatedPosition - grossInvestment) / grossInvestment) * 100,
        duration,
        priceChange,
    };

    // Costs result
    const costsResult: CostsResult = {
        spreadCost,
        commission,
        totalCosts,
        grossInvestment,
        netInvestment,
    };

    // Theta (pérdida por día)
    const valueNow = calcWarrantValue(
        currentBondPrice, warrant.strike, warrant.volatility, remainingYears, market.riskFreeRate / 100, isPut
    );
    const valueTomorrow = calcWarrantValue(
        currentBondPrice, warrant.strike, warrant.volatility, Math.max(0, remainingYears - 1 / 365), market.riskFreeRate / 100, isPut
    );
    const theta = (valueTomorrow - valueNow) * warrant.quantity * warrant.ratio;

    // Break-even
    let breakEvenRate: number | null = null;
    const investment = grossInvestment + totalCosts;
    const start = isPut ? 0.5 : 10;
    const end = isPut ? 10 : 0.5;
    const step = isPut ? 0.01 : -0.01;

    for (let rate = start; isPut ? rate <= end : rate >= end; rate += step) {
        const bondPrice = calcBondPrice(bond.faceValue, bond.coupon / 100, rate / 100, bond.maturity);
        const warrantValue = calcWarrantValue(bondPrice, warrant.strike, warrant.volatility, remainingYears, market.riskFreeRate / 100, isPut);
        const position = warrantValue * warrant.quantity * warrant.ratio;

        if (position >= investment) {
            breakEvenRate = rate;
            break;
        }
    }

    // Adjusted P&L
    const adjustedPnL = {
        totalInvestment: netInvestment,
        simulatedPosition,
        profitLoss: simulatedPosition - netInvestment,
        profitLossPercent: ((simulatedPosition - netInvestment) / netInvestment) * 100,
    };

    // Griegas
    const greeks = calcGreeks(
        currentBondPrice,
        warrant.strike,
        warrant.volatility,
        remainingYears,
        market.riskFreeRate / 100,
        isPut
    );

    return {
        input,
        calculations,
        costs: costsResult,
        theta, // Legacy
        greeks,
        breakEvenRate,
        adjustedPnL,
        remainingDays,
        remainingYears,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Crear input por defecto
 */
export function createDefaultInput(): SimulatorInput {
    return {
        warrant: {
            type: 'PUT',
            strike: 100,
            premium: 2.5,
            ratio: 0.1,
            expiry: 1,
            volatility: 0.15,
            quantity: 1000,
        },
        bond: {
            coupon: 3.0,
            maturity: 10,
            currentRate: 3.5,
            faceValue: 100,
        },
        market: {
            riskFreeRate: 3.0,
            simulatedRate: 4.0,
        },
        costs: {
            spreadPercent: 2.0,
            commissionPercent: 0.15,
            commissionFixed: 5,
        },
        time: {
            elapsedDays: 0,
        },
    };
}

/**
 * Validar input
 */
export function validateInput(input: unknown): input is SimulatorInput {
    if (!input || typeof input !== 'object') return false;

    const i = input as Record<string, unknown>;

    return (
        typeof i.warrant === 'object' &&
        typeof i.bond === 'object' &&
        typeof i.market === 'object' &&
        typeof i.costs === 'object' &&
        typeof i.time === 'object'
    );
}
