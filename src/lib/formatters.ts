/**
 * Formatea un número como moneda EUR
 */
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(value);
};

/**
 * Formatea un número como porcentaje
 */
export const formatPercent = (value: number, decimals = 2): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

/**
 * Formatea un número con separador de miles
 */
export const formatNumber = (value: number): string => {
    return value.toLocaleString('es-ES');
};
