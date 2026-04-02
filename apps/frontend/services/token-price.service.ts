/**
 * Service pour récupérer les prix et changements des fan tokens depuis CoinGecko
 */

export interface TokenPriceData {
    symbol: string;
    price: number;
    priceChange24h: number;
    priceChangePercent24h: number;
}

const priceCache: { [key: string]: { data: TokenPriceData; timestamp: number } } = {};
const CACHE_DURATION = 60000;

export interface CoinGeckoToken {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    price_change_24h: number;
    price_change_percentage_24h: number;
}

/**
 * Mapping des symboles de tokens vers leurs IDs CoinGecko
 * Liste complète des fan tokens disponibles sur CoinGecko
 */
const COINGECKO_TOKEN_IDS: { [symbol: string]: string } = {
    // Football (Soccer) - Europe
    PSG: "paris-saint-germain-fan-token",
    BAR: "fc-barcelona-fan-token",
    JUV: "juventus-fan-token",
    INTER: "internazionale-milan-fan-token",
    ACM: "ac-milan-fan-token",
    ATM: "atletico-madrid",
    CITY: "manchester-city-fan-token",
    AFC: "arsenal-fan-token",
    ASR: "as-roma-fan-token",
    POR: "fc-porto",
    GAL: "galatasaray-fan-token",
    TRA: "trabzonspor-fan-token",
    NAP: "napoli-fan-token",
    VCF: "valencia-cf-fan-token",
    SPURS: "tottenham-hotspur-fan-token",
    EFC: "everton-fan-token",
    ASM: "as-monaco-fan-token",
    LUFC: "leeds-united-fan-token",
    AVL: "aston-villa-fan-token",
    // Football (Soccer) - Brazil
    MENGO: "flamengo-fan-token",
    VERDAO: "palmeiras",
    SPFC: "sao-paulo-fc-fan-token",
    SCCP: "corinthians-fan-token",
    // Other sports
    OG: "og-fan-token",
    UFC: "ufc-fan-token",
    // Native token
    CHZ: "chiliz",
};

/**
 * Récupère les prix et changements de plusieurs tokens depuis CoinGecko
 * @param symbols - Tableau des symboles de tokens à récupérer (ex: ["PSG", "BAR"])
 * @returns Promise avec les données de prix pour chaque token
 */
export async function fetchTokenPrices(symbols: string[]): Promise<{ [symbol: string]: TokenPriceData }> {
    try {
        const cacheKey = symbols.sort().join(",");
        const cached = priceCache[cacheKey];
        const now = Date.now();

        if (cached && (now - cached.timestamp) < CACHE_DURATION) {
            console.log("📦 Using cached token prices");
            return cached.data as any;
        }

        const tokenIds = symbols
            .map(symbol => COINGECKO_TOKEN_IDS[symbol.toUpperCase()])
            .filter(id => id !== undefined);

        if (tokenIds.length === 0) {
            console.warn("⚠️ No valid token IDs found for symbols:", symbols);
            return {};
        }

        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${tokenIds.join(",")}&vs_currencies=usd&include_24hr_change=true`
        );

        if (!response.ok) {
            if (response.status === 429) {
                console.warn("⚠️ CoinGecko rate limit reached, using cache if available");
                if (cached) {
                    return cached.data as any;
                }
            }
            throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        const prices: { [symbol: string]: TokenPriceData } = {};

        symbols.forEach(symbol => {
            const tokenId = COINGECKO_TOKEN_IDS[symbol.toUpperCase()];
            if (tokenId && data[tokenId]) {
                const tokenData = data[tokenId];
                prices[symbol.toUpperCase()] = {
                    symbol: symbol.toUpperCase(),
                    price: tokenData.usd || 0,
                    priceChange24h: tokenData.usd_24h_change || 0,
                    priceChangePercent24h: tokenData.usd_24h_change || 0,
                };
            }
        });

        priceCache[cacheKey] = {
            data: prices as any,
            timestamp: now
        };

        return prices;
    } catch (error) {
        console.error("❌ Error fetching token prices from CoinGecko:", error);
        const cacheKey = symbols.sort().join(",");
        const cached = priceCache[cacheKey];
        if (cached) {
            console.log("📦 Using expired cache due to error");
            return cached.data as any;
        }
        return {};
    }
}

/**
 * Récupère les prix et changements d'un seul token depuis CoinGecko
 * @param symbol - Symbole du token (ex: "PSG", "BAR")
 * @returns Promise avec les données de prix du token
 */
export async function fetchTokenPrice(symbol: string): Promise<TokenPriceData | null> {
    const prices = await fetchTokenPrices([symbol]);
    return prices[symbol.toUpperCase()] || null;
}

/**
 * Récupère les prix de tous les tokens supportés depuis CoinGecko
 * @returns Promise avec les données de prix pour tous les tokens
 */
export async function fetchAllTokenPrices(): Promise<{ [symbol: string]: TokenPriceData }> {
    const allSymbols = Object.keys(COINGECKO_TOKEN_IDS);
    return fetchTokenPrices(allSymbols);
}

/**
 * Récupère le prix de CHZ depuis CoinGecko
 * @returns Promise avec le prix de CHZ en USD
 */
export async function fetchCHZPrice(): Promise<number> {
    try {
        const prices = await fetchTokenPrices(["CHZ"]);
        return prices["CHZ"]?.price || 0;
    } catch (error) {
        console.error("❌ Error fetching CHZ price:", error);
        return 0;
    }
}

