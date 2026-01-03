export interface MarketDataResult {
    value: number;
    timestamp: string;
}

export class MarketDataService {
    private apiKey: string;
    private baseUrl = 'https://www.alphavantage.co/query';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async fetchBondYield(maturity: '3month' | '2year' | '5year' | '10year' | '30year' = '10year'): Promise<MarketDataResult> {
        if (!this.apiKey) {
            throw new Error('API Key no configurada');
        }

        const url = `${this.baseUrl}?function=TREASURY_YIELD&interval=daily&maturity=${maturity}&apikey=${this.apiKey}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data['Error Message']) {
                throw new Error('Error en la API: Verifique su API Key');
            }

            if (data['Note']) {
                throw new Error('Límite de API excedido (25 peticiones/día)');
            }

            const timeSeries = data['data'];
            if (!timeSeries || timeSeries.length === 0) {
                throw new Error('No hay datos disponibles');
            }

            // Alpha Vantage Treasury Yield response format:
            // { "data": [ { "date": "2023-10-27", "value": "4.83" }, ... ] }
            // Note: The specific format might vary slightly depending on the exact endpoint documentation updates, 
            // but standard AV time series usually have a 'Time Series' object.
            // However, the TREASURY_YIELD endpoint often returns a simplified structure or CSV.
            // Let's handle the JSON 'data' array standard for AV economics data.

            const latest = timeSeries[0];
            const value = parseFloat(latest.value);

            if (isNaN(value)) {
                throw new Error('Dato inválido recibido');
            }

            return {
                value: value,
                timestamp: latest.date
            };

        } catch (error) {
            console.error('Error fetching bond yield:', error);
            throw error;
        }
    }
}
