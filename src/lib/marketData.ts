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

    async fetchBondYield(
        maturity: '3month' | '2year' | '5year' | '10year' | '30year' = '10year',
        country: 'us' | 'de' | 'es' | 'eu' | 'fr' | 'it' | 'nl' = 'us'
    ): Promise<MarketDataResult> {
        if (country === 'us') {
            return this.fetchAlphaVantage(maturity);
        } else {
            return this.fetchECBData(country, maturity);
        }
    }

    private async fetchAlphaVantage(maturity: string): Promise<MarketDataResult> {
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
            console.error('Error fetching Alpha Vantage:', error);
            throw error;
        }
    }

    private async fetchECBData(
        country: 'de' | 'es' | 'eu' | 'fr' | 'it' | 'nl',
        maturity: '3month' | '2year' | '5year' | '10year' | '30year'
    ): Promise<MarketDataResult> {
        let url = '';

        // Maturity Map for YC dataset (Germany & Euro Area)
        const maturityMap: Record<string, string> = {
            '3month': 'SR_3M',
            '2year': 'SR_2Y',
            '5year': 'SR_5Y',
            '10year': 'SR_10Y',
            '30year': 'SR_30Y'
        };
        const maturityKey = maturityMap[maturity] || 'SR_10Y';

        if (country === 'de') {
            // Germany: Yield Curve AAA (Government bond, nominal, all issuers)
            // Dataset: YC, Freq: B, RefArea: U2 (Euro area changing composition) ?? No, for specific country ? 
            // Actually ECB provides "Euro Area AAA" which is often used as "Bund" proxy or we can check if DE specific exists.
            // The previous URL used U2.EUR.4F.G_N_A.SV_C_YM.SR_10Y was "Euro area (changing composition), AAA-rated central government bonds".
            // This IS the standard "Bund-like" curve monitored by ECB. 
            // Let's stick to this for DE (Proxy) or rename to Euro AAA. 
            // Just for clarity: DE usually tracks AAA curve closely.

            url = `https://data-api.ecb.europa.eu/service/data/YC/B.U2.EUR.4F.G_N_A.SV_C_YM.${maturityKey}?lastNObservations=1&detail=dataonly&format=jsondata`;

        } else if (country === 'eu') {
            // Euro Area - Switching to AAA (4F) as '0C' (All Ratings) is less reliable/available in this dataset
            // This effectively makes 'EU' benchmark identical to 'DE' proxy (Euro AAA), which is standard practice.
            url = `https://data-api.ecb.europa.eu/service/data/YC/B.U2.EUR.4F.G_N_A.SV_C_YM.${maturityKey}?lastNObservations=1&detail=dataonly&format=jsondata`;

        } else if (country === 'es') {
            // Spain: Long Term Interest Rate (Monthly)
            url = 'https://data-api.ecb.europa.eu/service/data/IRS/M.ES.L.L40.CI.0000.EUR.N.Z?lastNObservations=1&detail=dataonly&format=jsondata';
        } else if (country === 'fr') {
            // France: Long Term Interest Rate (Monthly)
            url = 'https://data-api.ecb.europa.eu/service/data/IRS/M.FR.L.L40.CI.0000.EUR.N.Z?lastNObservations=1&detail=dataonly&format=jsondata';
        } else if (country === 'it') {
            // Italy: Long Term Interest Rate (Monthly)
            url = 'https://data-api.ecb.europa.eu/service/data/IRS/M.IT.L.L40.CI.0000.EUR.N.Z?lastNObservations=1&detail=dataonly&format=jsondata';
        } else if (country === 'nl') {
            // Netherlands: Long Term Interest Rate (Monthly)
            url = 'https://data-api.ecb.europa.eu/service/data/IRS/M.NL.L.L40.CI.0000.EUR.N.Z?lastNObservations=1&detail=dataonly&format=jsondata';
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error conectando con ECB (${response.status})`);

            const data = await response.json();

            const series = Object.values(data.dataSets[0].series)[0] as any;
            if (!series) throw new Error(`Datos no disponibles`);

            const obs = Object.values(series.observations)[0] as any;
            const value = parseFloat(obs[0]);

            const date = new Date().toLocaleDateString();
            const isMonthly = ['es', 'fr', 'it', 'nl'].includes(country);

            return {
                value: value,
                timestamp: isMonthly ? `${date} (Mensual Proxy)` : date
            };

        } catch (error) {
            console.error('Error fetching ECB:', error);
            throw new Error('Error obteniendo datos del Banco Central Europeo');
        }
    }
}
