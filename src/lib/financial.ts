/**
 * Función de distribución normal acumulada (CDF)
 * Aproximación de Abramowitz and Stegun
 */
export const normCDF = (x: number): number => {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x) / Math.sqrt(2);
    const t = 1.0 / (1.0 + p * absX);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

    return 0.5 * (1.0 + sign * y);
};

/**
 * Calcula el precio teórico de un bono
 * @param faceValue - Valor nominal del bono
 * @param coupon - Tasa cupón anual (decimal)
 * @param ytm - Yield to maturity (decimal)
 * @param years - Años hasta vencimiento
 */
export const calcBondPrice = (
    faceValue: number,
    coupon: number,
    ytm: number,
    years: number
): number => {
    let price = 0;

    // Valor presente de los cupones
    for (let t = 1; t <= years; t++) {
        price += (coupon * faceValue) / Math.pow(1 + ytm, t);
    }

    // Valor presente del principal
    price += faceValue / Math.pow(1 + ytm, years);

    return price;
};

/**
 * Calcula el valor teórico de un warrant usando Black-Scholes
 * @param bondPrice - Precio actual del bono
 * @param strike - Precio de ejercicio
 * @param volatility - Volatilidad implícita (decimal)
 * @param timeToExpiry - Tiempo hasta vencimiento (años)
 * @param riskFreeRate - Tasa libre de riesgo (decimal)
 * @param isPut - true para PUT, false para CALL
 */
export const calcWarrantValue = (
    bondPrice: number,
    strike: number,
    volatility: number,
    timeToExpiry: number,
    riskFreeRate: number,
    isPut: boolean
): number => {
    // Valor intrínseco al vencimiento
    if (timeToExpiry <= 0) {
        return isPut
            ? Math.max(0, strike - bondPrice)
            : Math.max(0, bondPrice - strike);
    }

    const d1 = (
        Math.log(bondPrice / strike) +
        (riskFreeRate + 0.5 * volatility * volatility) * timeToExpiry
    ) / (volatility * Math.sqrt(timeToExpiry));

    const d2 = d1 - volatility * Math.sqrt(timeToExpiry);

    if (isPut) {
        return (
            strike * Math.exp(-riskFreeRate * timeToExpiry) * normCDF(-d2) -
            bondPrice * normCDF(-d1)
        );
    }

    return (
        bondPrice * normCDF(d1) -
        strike * Math.exp(-riskFreeRate * timeToExpiry) * normCDF(d2)
    );
};

/**
 * Calcula la duración aproximada de un bono
 */
export const calcDuration = (maturity: number): number => {
    return maturity * 0.85;
};
