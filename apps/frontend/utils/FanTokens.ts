export interface FanTokenData {
    link: string;
    image: string;
    name: string;
    symbol: string;
    tokenAddress?: string;
    testnetTokenAddress?: string;
}

export type FanTokenMap = {
    [teamName: string]: FanTokenData;
};

export const FAN_TOKENS: FanTokenMap[] = [
{
    PSG: {
        link: "https://www.socios.com/psg",
        image: "https://actufinance.fr/wp-content/uploads/2022/02/PSG.png",
        name: "Paris Saint-Germain Fan Token",
        symbol: "PSG",
        tokenAddress: "0x0b8f3c1d2e6a4b5c7f8e9d1a2b3c4d5e6f7g8h9i",
    },
    },
    {
        JUV: {
            link: "https://www.socios.com/juventus",
            image:
            "https://coin-images.coingecko.com/coins/images/10060/large/JUV.png?1741579269",
            name: "Juventus Fan Token",
            symbol: "JUV",
        },
    },
    {
        BAR: {
            link: "https://www.socios.com/fcbarcelona",
            image: "https://www.fantokens.com/_next/image?url=https%3A%2F%2Ffirebasestorage.googleapis.com%2Fv0%2Fb%2Ffmc-27374.appspot.com%2Fo%2Ftokens%252F2eb02bcb-52c0-480e-9f18-5dc046a5dc04%3Falt%3Dmedia%26token%3Dfe0f8094-7530-450b-8f54-74ef73c4d845&w=48&q=75",
            name: "FC Barcelona Fan Token",
            symbol: "BAR",
        },
        },
    {
        INTER: {
            link: "https://www.socios.com/inter",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/langfr-250px-FC_Internazionale_Milano_2021.svg.png",
            name: "Inter Milan Fan Token",
            symbol: "INTER",
        },
    },
];

// Flatten FAN_TOKENS for easy lookup
const flatFanTokenMap: FanTokenMap = FAN_TOKENS.reduce((acc, obj) => {
    const key = Object.keys(obj)[0];
    acc[key] = obj[key];
    return acc;
}, {} as FanTokenMap);

export interface TokenWithBalance extends FanTokenData {
    id: number;
    quantity: number;
    currentPrice: number;
    change: number;
}

// Helper function to get all fan tokens as a flat array
export const getAllFanTokens = (): (FanTokenData & { teamKey: string })[] => {
    return FAN_TOKENS.flatMap(tokenMap => 
        Object.entries(tokenMap).map(([teamKey, tokenData]) => ({
            ...tokenData,
            teamKey
        }))
    );
};

// Helper: Match team name to known token symbol
export const getFanToken = (team: string): FanTokenData | undefined => {
    if (team.includes("Barcelona")) return flatFanTokenMap["BAR"];
    if (team.includes("Juventus")) return flatFanTokenMap["JUV"];
    if (team.includes("PSG")) return flatFanTokenMap["PSG"];
    if (team.includes("INTER")) return flatFanTokenMap["INTER"];
    return undefined;
};