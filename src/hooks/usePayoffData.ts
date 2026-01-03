import { useMemo } from 'react';
import { calcBondPrice, calcWarrantValue } from '../lib/financial';
import type { WarrantType, PayoffDataPoint } from '../lib/types';

interface UsePayoffDataParams {
    warrantType: WarrantType;
    strike: number;
    premium: number;
    ratio: number;
    expiry: number;
    volatility: number;
    quantity: number;
    bondCoupon: number;
    bondMaturity: number;
}

export const usePayoffData = ({
    warrantType,
    strike,
    premium,
    ratio,
    expiry,
    volatility,
    quantity,
    bondCoupon,
    bondMaturity,
}: UsePayoffDataParams): PayoffDataPoint[] => {
    return useMemo(() => {
        const data: PayoffDataPoint[] = [];
        const isPut = warrantType === 'PUT';
        const investment = premium * quantity * ratio;

        for (let rate = 1; rate <= 7; rate += 0.25) {
            const bondPrice = calcBondPrice(
                100,
                bondCoupon / 100,
                rate / 100,
                bondMaturity
            );

            const warrantValue = calcWarrantValue(
                bondPrice,
                strike,
                volatility,
                expiry * 0.5,
                rate / 100,
                isPut
            );

            const position = warrantValue * quantity * ratio;
            const pnl = position - investment;

            data.push({
                rate: rate.toFixed(2),
                bondPrice: bondPrice.toFixed(2),
                pnl,
                warrantValue: warrantValue.toFixed(3),
            });
        }

        return data;
    }, [
        warrantType,
        strike,
        premium,
        ratio,
        expiry,
        volatility,
        quantity,
        bondCoupon,
        bondMaturity,
    ]);
};
