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
 * Función de densidad de probabilidad normal (PDF)
 */
export const normPDF = (x: number): number => {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
};

/**
 * Calcula todas las griegas de una opción usando Black-Scholes
 */
export const calcGreeks = (
    bondPrice: number,
    strike: number,
    volatility: number,
    timeToExpiry: number,
    riskFreeRate: number,
    isPut: boolean
) => {
    if (timeToExpiry <= 0) {
        return { delta: 0, gamma: 0, vega: 0, theta: 0, rho: 0 };
    }

    const d1 = (
        Math.log(bondPrice / strike) +
        (riskFreeRate + 0.5 * volatility * volatility) * timeToExpiry
    ) / (volatility * Math.sqrt(timeToExpiry));

    const d2 = d1 - volatility * Math.sqrt(timeToExpiry);

    const nd1 = normCDF(d1);
    const nd2 = normCDF(d2);
    const nPdfD1 = normPDF(d1);

    // DELTA
    const delta = isPut ? nd1 - 1 : nd1;

    // GAMMA (igual para Put y Call)
    const gamma = nPdfD1 / (bondPrice * volatility * Math.sqrt(timeToExpiry));

    // VEGA (igual para Put y Call)
    // Se suele expresar por cambio de 1% en volatilidad (/100)
    const vega = (bondPrice * Math.sqrt(timeToExpiry) * nPdfD1) / 100;

    // THETA
    // Se suele expresar por día (/365)
    let theta = 0;
    const term1 = -(bondPrice * nPdfD1 * volatility) / (2 * Math.sqrt(timeToExpiry));

    if (isPut) {
        theta = term1 + riskFreeRate * strike * Math.exp(-riskFreeRate * timeToExpiry) * normCDF(-d2);
    } else {
        theta = term1 - riskFreeRate * strike * Math.exp(-riskFreeRate * timeToExpiry) * nd2;
    }
    theta = theta / 365;

    // RHO
    // Se suele expresar por cambio de 1% en tipo libre de riesgo (/100)
    let rho = 0;
    if (isPut) {
        rho = -strike * timeToExpiry * Math.exp(-riskFreeRate * timeToExpiry) * normCDF(-d2);
    } else {
        rho = strike * timeToExpiry * Math.exp(-riskFreeRate * timeToExpiry) * nd2;
    }
    rho = rho / 100;

    return { delta, gamma, vega, theta, rho };
};

/**
 * Calcula la duración aproximada de un bono
 */
export const calcDuration = (maturity: number): number => {
    return maturity * 0.85;
};
