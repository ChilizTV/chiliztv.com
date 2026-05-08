/**
 * UI presentation data for fan tokens — local logo path + brand gradient.
 *
 * Distinct from `chiliz.config.ts` (on-chain addresses) and `utils/FanTokens.ts`
 * (Socios links + remote images). This file is the single source of truth for
 * how fan tokens are rendered visually across the app (marquees, walls, cards).
 */

export interface FanTokenAsset {
  symbol: string;
  name: string;
  logo: string;
  gradient: { from: string; via: string; to: string };
}

export const FAN_TOKEN_ASSETS: FanTokenAsset[] = [
  {
    symbol: "PSG",
    name: "Paris Saint-Germain",
    logo: "/psg.png",
    gradient: { from: "#004170", via: "#002b50", to: "#001a2e" },
  },
  {
    symbol: "BAR",
    name: "FC Barcelona",
    logo: "/bar.png",
    gradient: { from: "#a50044", via: "#6a002e", to: "#4a001f" },
  },
  {
    symbol: "ACM",
    name: "AC Milan",
    logo: "/acm.png",
    gradient: { from: "#8B0000", via: "#5a0000", to: "#2a0000" },
  },
  {
    symbol: "JUV",
    name: "Juventus",
    logo: "/juv.png",
    gradient: { from: "#1f1f1f", via: "#0e0e0e", to: "#000000" },
  },
  {
    symbol: "CITY",
    name: "Manchester City",
    logo: "/city.png",
    gradient: { from: "#6CABDD", via: "#3f7caa", to: "#1c4a78" },
  },
  {
    symbol: "AFC",
    name: "Arsenal",
    logo: "/afc.png",
    gradient: { from: "#EF0107", via: "#b00005", to: "#7a0004" },
  },
  {
    symbol: "NAP",
    name: "Napoli",
    logo: "/nap.png",
    gradient: { from: "#1FB3E5", via: "#1380a8", to: "#0a4d65" },
  },
  {
    symbol: "ATM",
    name: "Atlético Madrid",
    logo: "/atm.png",
    gradient: { from: "#CB3524", via: "#8a241a", to: "#5a1810" },
  },
  {
    symbol: "MENGO",
    name: "Flamengo",
    logo: "/mengo.png",
    gradient: { from: "#E0162B", via: "#9b0e1f", to: "#700a14" },
  },
  {
    symbol: "OG",
    name: "OG",
    logo: "/og.png",
    gradient: { from: "#152a82", via: "#0d1c54", to: "#070d29" },
  },
  {
    symbol: "SPURS",
    name: "Tottenham Hotspur",
    logo: "/spurs.png",
    gradient: { from: "#132257", via: "#0a1740", to: "#070f29" },
  },
  {
    symbol: "INTER",
    name: "Inter Milan",
    logo: "/inter.png",
    gradient: { from: "#00204e", via: "#00163a", to: "#000c1f" },
  },
  {
    symbol: "ASR",
    name: "AS Roma",
    logo: "/asr.png",
    gradient: { from: "#8e1f2f", via: "#5e1520", to: "#2e0a10" },
  },
  {
    symbol: "POR",
    name: "Portugal National Team",
    logo: "/por.png",
    gradient: { from: "#CC2229", via: "#8a161a", to: "#4d0c0e" },
  },
  {
    symbol: "GAL",
    name: "Galatasaray",
    logo: "/gal.png",
    gradient: { from: "#A70028", via: "#6e001b", to: "#3a000e" },
  },
  {
    symbol: "TRA",
    name: "Trabzonspor",
    logo: "/tra.png",
    gradient: { from: "#6E0014", via: "#4a000d", to: "#260006" },
  },
  {
    symbol: "VCF",
    name: "Valencia",
    logo: "/vcf.png",
    gradient: { from: "#F47B20", via: "#b35817", to: "#6e3409" },
  },
  {
    symbol: "VERDAO",
    name: "Palmeiras",
    logo: "/verdao.png",
    gradient: { from: "#006437", via: "#003e22", to: "#001f11" },
  },
  {
    symbol: "SPFC",
    name: "São Paulo FC",
    logo: "/spfc.png",
    gradient: { from: "#ED1C24", via: "#a01316", to: "#530a0c" },
  },
  {
    symbol: "SCCP",
    name: "Corinthians",
    logo: "/sccp.png",
    gradient: { from: "#0a0a0a", via: "#1a1a1a", to: "#2a2a2a" },
  },
  {
    symbol: "EFC",
    name: "Everton",
    logo: "/efc.png",
    gradient: { from: "#003399", via: "#002266", to: "#001133" },
  },
  {
    symbol: "ASM",
    name: "AS Monaco",
    logo: "/asm.png",
    gradient: { from: "#C8102E", via: "#8a0b1f", to: "#4d0610" },
  },
  {
    symbol: "LUFC",
    name: "Leeds United",
    logo: "/lufc.png",
    gradient: { from: "#FFCD00", via: "#b38f00", to: "#6e5800" },
  },
  {
    symbol: "AVL",
    name: "Aston Villa",
    logo: "/avl.png",
    gradient: { from: "#6F0028", via: "#4a001a", to: "#26000e" },
  },
  {
    symbol: "BFC",
    name: "Benfica",
    logo: "/benfica.png",
    gradient: { from: "#A50000", via: "#6e0000", to: "#3a0000" },
  },
  {
    symbol: "SEV",
    name: "Sevilla",
    logo: "/sevilla.png",
    gradient: { from: "#D00027", via: "#8a001a", to: "#4d000e" },
  },
  {
    symbol: "GALO",
    name: "Atlético Mineiro",
    logo: "/galo.png",
    gradient: { from: "#0a0a0a", via: "#1a1a1a", to: "#2a2a2a" },
  },
  {
    symbol: "VASCO",
    name: "Vasco da Gama",
    logo: "/vasco.png",
    gradient: { from: "#0a0a0a", via: "#161616", to: "#1f1f1f" },
  },
  {
    symbol: "FLU",
    name: "Fluminense",
    logo: "/flu.png",
    gradient: { from: "#7a0026", via: "#4a0017", to: "#21000a" },
  },
  {
    symbol: "UDI",
    name: "Udinese",
    logo: "/udi.png",
    gradient: { from: "#0a0a0a", via: "#171717", to: "#262626" },
  },
  {
    symbol: "CPFC",
    name: "Crystal Palace",
    logo: "/cpfc.webp",
    gradient: { from: "#1B458F", via: "#13315e", to: "#0a1a30" },
  },
];

export const getFanTokenAsset = (symbol: string): FanTokenAsset | undefined =>
  FAN_TOKEN_ASSETS.find((t) => t.symbol.toUpperCase() === symbol.toUpperCase());
