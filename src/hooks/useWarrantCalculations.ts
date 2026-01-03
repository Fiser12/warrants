import { useMemo } from 'react';
import { calcBondPrice, calcWarrantValue, calcDuration } from '../lib/financial';
import type { WarrantType, Calculations } from '../lib/types';

interface UseWarrantCalculationsParams {
    warrantType: WarrantType;
    strike: number;
    premium: number;
    ratio: number;
    expiry: number;
    volatility: number;
    quantity: number;
    currentRate: number;
    bondCoupon: number;
    bondMaturity: number;
    simulatedRate: number;
}

export const useWarrantCalculations = ({
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
}: UseWarrantCalculationsParams): Calculations => {
    return useMemo(() => {
        const faceValue = 100;
        const isPut = warrantType === 'PUT';

        // Precios del bono
        const currentBondPrice = calcBondPrice(
            faceValue,
            bondCoupon / 100,
            currentRate / 100,
            bondMaturity
        );
        const simulatedBondPrice = calcBondPrice(
            faceValue,
            bondCoupon / 100,
            simulatedRate / 100,
            bondMaturity
        );

        // Valores del warrant
        const currentWarrantValue = calcWarrantValue(
            currentBondPrice,
            strike,
            volatility,
            expiry,
            currentRate / 100,
            isPut
        );
        const simulatedWarrantValue = calcWarrantValue(
            simulatedBondPrice,
            strike,
            volatility,
            expiry * 0.8, // Decay del tiempo
            simulatedRate / 100,
            isPut
        );

        // Valor intrínseco
        const intrinsicValue = isPut
            ? Math.max(0, strike - simulatedBondPrice)
            : Math.max(0, simulatedBondPrice - strike);

        // P&L
        const totalInvestment = premium * quantity * ratio;
        const currentPosition = currentWarrantValue * quantity * ratio;
        const simulatedPosition = simulatedWarrantValue * quantity * ratio;
        const profitLoss = simulatedPosition - totalInvestment;
        const profitLossPercent = (profitLoss / totalInvestment) * 100;

        // Duration
        const duration = calcDuration(bondMaturity);
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
            priceChange,
        };
    }, [
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
    ]);
};
