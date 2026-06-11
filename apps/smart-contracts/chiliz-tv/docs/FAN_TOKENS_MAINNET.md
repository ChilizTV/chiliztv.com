# Fan tokens tradeable via ChilizSwapRouter (Chiliz mainnet)

Generated 2026-06-11 from on-chain Kayen factory data
(`0xE2918AA38088878546c1A18F2F9b1BC83297fdD3`).

## ⚠ Two generations of fan tokens exist — use the NEW ones

Chiliz is running its **2026 "decimal fan token" migration**: every club got a
new **18-decimals** token (BeaconProxy, shared beacon
`0x5fe3fb0794acf750806b8cbce2d30402ae193a5b`), and DEX liquidity has moved to
them. The legacy 0-decimals CAP-20 tokens (and their Kayen-wrapped versions)
still exist but their pools are dust by comparison — e.g. PSG: **2,324,990 CHZ**
of depth on the new token vs **6,181 CHZ** via the legacy wrapped route.

**Frontend: list the NEW addresses below.** They work through the existing
`placeBetWithToken` / `quoteTokenToUSDC` with no wrapping (the router's plain
`[token, WCHZ, USDC]` route — verified live: 1,000 new-PSG quotes ≈ 547 USDC at
~1.5% impact). They are standard 18-decimals ERC20s: `parseUnits(amount, 18)`,
but still read `decimals()` on-chain as a rule.

The router's auto-wrap path remains useful only for users still holding legacy
0-decimals tokens — it works, just against thin pools.

## New-generation fan tokens (85, sorted by WCHZ pool depth)

| Symbol | Address (18 dec) | Pool depth (CHZ) |
|---|---|---:|
| SAFA | `0xf81aa505df80278fc4cf2b050086f678d48bddce` | 7,900,317 |
| BELG | `0x6c4c9dfe8c940b51b68d00c6d76de756b252f328` | 4,313,984 |
| SFA | `0xfab24366503eb0fa8cb8fb7d1311159fd4283657` | 3,730,726 |
| PSG | `0xfe1d4a935df7a4a52f835f6104c97af9d72217f2` | 2,324,990 |
| $DOJO | `0xb66d72efc5fd77a8f9dc2e7c0f14304828956644` | 2,068,834 |
| BAR | `0x1589248b4b61ed472cc21ca1f2114d93ab6910d5` | 1,766,432 |
| GALO | `0x558cc7ac99793b10c1c142a1c7e5adf6657dea9c` | 1,718,289 |
| ARG | `0x4394886b1eec08fe88681462914702dc99d97eb7` | 1,658,261 |
| MENGO | `0xbff8fabb04f6494fe393eb7416a698869569a310` | 1,642,439 |
| GAL | `0x770da1e5ddb22f3ccc2482493bd9b10a7a8a38ae` | 1,095,488 |
| POR | `0x013f2407c6ef765f1199f8818b805121f269f5b8` | 1,047,301 |
| PFL | `0x3444f5436a3c02f3a3db8f2436b02bc1eea950d6` | 1,043,953 |
| LEG | `0xfd8a11532c5ca9bec64ec86e4e5ed78089cd443f` | 1,025,858 |
| TIGERS | `0xc430ffb62961ff910181edcae34ae9fc418a15ce` | 857,111 |
| SARRIES | `0x72b1fca1008be96c4fde2539379c1778a76c4fca` | 847,473 |
| PERSIJA | `0xdc061856766d4991724307b9b0ea217ff8f3bbee` | 844,975 |
| LEV | `0x084ba7f44cd799decde593a4045170f014c29845` | 741,494 |
| TRA | `0xeff432433dd57adfa37004af00db148f9407e7bd` | 723,706 |
| BFC | `0xd77de9fce56f371e347217d57394f1fa07f02d64` | 674,207 |
| UFC | `0xc9f723625e80a81cba2cad3e6871d3bdf2a7ecc7` | 673,742 |
| SAN | `0x3ba1eb0ff58537d8b77e8446273295fc432439a9` | 648,560 |
| MFC | `0x580eda966a8129c3c01d149871b47fefcc599d28` | 639,374 |
| BUFC | `0xafb78165c62744bd21b4ddef48c11a93d395daa2` | 635,246 |
| DZG | `0x03be2ea82839fbd8b6ab16addeba3fe4c88bb43f` | 634,678 |
| VIT | `0x94a54b796744f07cfb499e2b6050f8b71a012c2c` | 599,168 |
| NAVI | `0x02728748392f1875682940681f4c936fc683a68e` | 594,118 |
| UCH | `0xfe050a08699a2557bcc0a8e6c2805eba55d61065` | 590,703 |
| FOR | `0x078b3c0ad7ea92efd14af146bf4171e80ce41e1c` | 578,673 |
| AVL | `0x4f3a607bb2717683108865fc785badfa90094431` | 575,999 |
| SPFC | `0x6345c0ecca1b9007a9043cb5da8150ae07add498` | 544,275 |
| AM | `0xf0d5de46729f4e2f28c27a98e15ef18df951ec44` | 518,667 |
| ROUSH | `0xae0e559cfb64191e376317895f1d643df22d8dd7` | 516,911 |
| DAVIS | `0x97b79dd60a1211a9612f98194591f4483ff83ce3` | 491,432 |
| ASM | `0x57f3d2382025cf5d6c3b126dce0360d9cf3aff49` | 486,637 |
| ENDCEX | `0x4cf8426c1d90a505dcb8d96c4f295494a548f4a2` | 481,976 |
| RACING | `0x02300475d1edd5b2e88efdebd3ffb549110d8aa6` | 477,999 |
| GFK | `0x72b30f41d5163a5082f9461f0b8346789639e063` | 474,961 |
| ATLAS | `0xc1a2b6950786383114828fcf816199b6d5f4960a` | 474,344 |
| ALA | `0x3b60f483fe311fc063b50a67bf327f96b76696e6` | 455,318 |
| VCF | `0x83d7d1df01c698b4379077af4bceb2d4af113bff` | 448,901 |
| LUFC | `0xe3ecd48f7653e6da693b544d50cab0bcdcd35c13` | 440,190 |
| HASHTAG | `0x3c1487c5036105338396055d74eee505a9f6a2f3` | 428,823 |
| YBO | `0x8c4d631a673be24f244e4f0645be6928d0083d4e` | 421,233 |
| BENFICA | `0xf4c653b74929953b29b966aba99b681fb5ab69cf` | 419,293 |
| CPFC | `0x58613484d9683d52899e13d42bb3fb9eeb0749da` | 369,799 |
| SCCP | `0x25fb4ff916fafb88d78918c54c1d14b57586046b` | 358,396 |
| AFC | `0x76088f3ed5dc655de9295d93868ec1eec654a615` | 358,338 |
| SAM | `0xf78e9ce916a7d6b3d4facba95b9e9b8bba5df609` | 355,383 |
| PERSIB | `0xdd15623d107c639af0c5127affa26d3f20327ec8` | 331,638 |
| VERDAO | `0xb46357d8ed050d35d3a24154c39d7236dae86187` | 310,474 |
| IBFK | `0x7b69003c404b0579f257c16e2664b4eb4c7b2acf` | 309,513 |
| ASR | `0x0ac7bf9783ca1dcd86a39b5a2607160d29256eb0` | 306,137 |
| INTER | `0x1b3385a26214057bb7e27c173ee2d14201752e73` | 302,254 |
| BAHIA | `0xc75037b67ade9364f451d49bfae776619a292181` | 301,896 |
| CITY | `0x7bd6242d775faef1d50b2aa18c2fbf329bddf295` | 288,649 |
| QUINS | `0x110a0fc65a0f78840f4b4a04a42e8c285e424553` | 287,317 |
| OG | `0xb3f2e39acc68f98229b2587361a8ce30acdf0442` | 284,179 |
| MIBR | `0x8caf9018aa56f7db55bb353005c7aa0fbfb1736b` | 283,935 |
| APL | `0x0b00e360bee5557d0d9a548030aa8f7182daf56f` | 279,250 |
| CAI | `0x99f7b1f8d445b6cbd231017820de372e2c5f9a27` | 276,110 |
| JDT | `0x9af2bd7003f043124aa13a21a2460996f7ba9a3b` | 257,489 |
| STV | `0x71bc882c60b9efdf85d0e1a28fc86f0bd822132f` | 253,998 |
| VASCO | `0xd5f1b2454db115967bfac73bfea21da5e2543c8e` | 247,053 |
| TIGRES | `0x7308f4c7b4a9a0e180fd08c003255762dd139d54` | 243,642 |
| RSO | `0x53838837f258f8ef337c8b4ceb60a89190ecba8b` | 236,494 |
| JUV | `0xeaf368dadc22524def47e8a1c26bfc17ac16e6f5` | 226,945 |
| ATM | `0x7da0eb973d982ffca095e80437f5e37459a95c67` | 220,967 |
| UDI | `0x94772c3381a83308376d65e100d06c2bc5a86ed9` | 219,865 |
| SPURS | `0xd699acd21011c20381e5138a430bb0d7b6e9bc7f` | 216,628 |
| CHVS | `0x3624ba092480fb0bdb5ec50ebac699bdfa561416` | 216,260 |
| ACM | `0x062f6004fd0bf204d272ff115e5b84f7a01489d1` | 215,711 |
| SFP | `0x04aa2d5c46691f05d30b9e65a9e09c8ea383c7b0` | 214,725 |
| EFC | `0xa84e55c2464563441cb4114372df8d5aca49fc83` | 213,167 |
| FLU | `0x9840dc03032f4f35d7dbdc8db832acfaf6ff3e77` | 182,250 |
| SHARKS | `0x0cb13408921f87e3a3d011b03935a81a1542bdfa` | 167,346 |
| SEVILLA | `0xa584cca6a5c46ead6ff8ef3beb8fac76364c36cb` | 153,936 |
| SACI | `0x4c360be766dd95c973be30c4130e7b4b762113e0` | 103,202 |
| GOZ | `0x6ba1fb0dadaeb34ea24eb31d416805abe8921448` | 92,124 |
| TH | `0x0b5de9e1303f3fb4f67d1aca1503ddb28bf59834` | 51,989 |
| NOV | `0x8ac4144247a17515a065fbe4c8ad21b16ad866c7` | 46,850 |
| ALL | `0x109b738569a04ea31ca06b47af06cfdda87adf48` | 45,496 |
| SAUBER | `0xe64c9d1471cfb5e7b03c998ac8137b441c60af6d` | 24,949 |
| NAP | `0x90593e9602b38a0d5b63d9f34ac3560798cee7d4` | 6,587 |
| ITA | `0x90111a53d94efe28f34562b53f04f471522d57b3` | 6,175 |
| CHARA4 | `0xb97885c9a26389acd5f17943002031052815cd36` | 100 |

Detection rule for new-generation tokens: EIP-1967 beacon slot
(`0xa3f0ad74…3d50`) equals `0x5fe3fb0794acf750806b8cbce2d30402ae193a5b`.

## Legacy 0-decimals tokens (wrap path — thin pools, avoid in UI)

The router still supports these via auto-wrap (wrapper factory
`0xAEdcF2bf41891777c5F638A098bbdE1eDBa7B264`), e.g. legacy PSG
`0xc2661815c69c2b3924d3dd0c2c1358a1e38a3105` (6,181 CHZ pool), legacy SCCP
`0x20bfeab58f8be903753d037ba7e307fc77c97388` (515,920 CHZ — the one legacy
exception still deep). Full legacy table: see this file's git history
(2026-06-11 initial version).
