# Fan tokens tradeable via ChilizSwapRouter (Chiliz mainnet)

Generated 2026-06-11 by enumerating all 439 Kayen pairs on factory
`0xE2918AA38088878546c1A18F2F9b1BC83297fdD3`, keeping WCHZ pairs whose other
side is a Kayen-wrapped fan token (wrapper factory
`0xAEdcF2bf41891777c5F638A098bbdE1eDBa7B264`). 81 tokens qualify.

Use the **underlying** address in `placeBetWithToken` / `quoteTokenToUSDC` —
the router wraps automatically. All are **0 decimals** unless noted.

**⚠ Pool depth = WCHZ reserve at generation time (CHZ ≈ $0.027). Most pools
are dust. Anything under ~500 CHZ (≈$15) cannot absorb a real bet — quote
`quoteTokenToUSDC` live and show price impact before enabling a token in the UI.
Recommended: whitelist tokens above a minimum-depth threshold rather than
listing all 81.**

| Symbol | Underlying address | Pool depth (CHZ) | Name |
|---|---|---:|---|
| SCCP | `0x20bfeab58f8be903753d037ba7e307fc77c97388` | 515,920 | Corinthians |
| PSG | `0xc2661815c69c2b3924d3dd0c2c1358a1e38a3105` | 6,181 | Paris Saint-Germain |
| SAUBER | `0xcf6d626203011e5554c82babe17dd7cdc4ee86bf` | 2,693 | Alfa Romeo Racing ORLEN |
| BAR | `0xfd3c73b3b09d418841dd6aff341b2d6e3aba433b` | 1,251 | FC Barcelona |
| LUFC | `0xf67a8a4299f7ebf0c58dbfb38941d0867f300c30` | 834 | Leeds United FC |
| CITY | `0x6401b29f40a02578ae44241560625232a01b3f79` | 543 | Manchester City FC |
| ACM | `0xf9c0f80a6c67b1b39bddf00ecd57f2533ef5b688` | 354 | AC Milan |
| PFL | `0xde05490b7ac4b86e54eff43f4f809c3a7bb16564` | 351 | Professional Fighters League |
| ALL | `0xc5c0d1e98d9b1398a37c82ed81086674baef2a72` | 339 | Alliance |
| SEVILLA | `0x60a5e1f5f0071c5d870bb0a80b411bde908ad51e` | 334 | Sevilla FC |
| OG | `0x19ca0f4adb29e2130a56b9c9422150b5dc07f294` | 304 | OG |
| DAVIS | `0xf50b3db1d498b69b0dc8ccc0b03643009a6bda78` | 291 | Davis Cup |
| IBFK | `0xd5febd04badd83e7ed56ca093fd57655b737cd3e` | 243 | İstanbul Başakşehir FK |
| FLU | `0x86930777d43605c40ba786f7802778ff5413efab` | 221 | Fluminense FC |
| ASR | `0xa6610b3361c4c0d206aa3364cd985016c2d89386` | 203 | AS Roma |
| AFC | `0x1d4343d35f0e0e14c14115876d01deaa4792550b` | 192 | Arsenal FC |
| AM | `0x3757951792edfc2ce196e4c06cffd04027e87403` | 191 | Aston Martin Cognizant |
| UCH | `0xa082ec45af038100d4989636a4a5e52fd7e5c636` | 177 | Universidad de Chile |
| STV | `0xe446d966ba9a36e518cf450abbd22f45688107da` | 173 | Sint-Truidense VV |
| ARG | `0xd34625c1c812439229ef53e06f22053249d011f5` | 173 | Argentina |
| ASM | `0x371863096cf5685cd37ae00c28de10b6edbab3fe` | 164 | AS Monaco |
| VERDAO | `0x971364ec452958d4d65ba8d508faa226d7117279` | 145 | Palmeiras |
| INTER | `0xc727c9c0f2647cb90b0fca64d8ddb14878716bed` | 135 | Inter Milan |
| VCF | `0xba0c26485b1909f80476067272d74a99cc0e1d57` | 121 | Valencia CF |
| SPURS | `0x93d84ff2c5f5a5a3d7291b11af97679e75eeac92` | 108 | Tottenham Hotspur |
| ATM | `0xe9506f70be469d2369803ccf41823713bafe8154` | 104 | Atlético de Madrid |
| VIT | `0x1754bbc90f8c004edbacc59e41aa4be7a36b5d5b` | 100 | Vitality |
| TH | `0x06b4213774dd069cf603ad11770b52f1e98160a7` | 97 | Team Heretics |
| $CHVS | `0xf66288961a3495ea9140fbd7c69e70a59db08b16` | 95 | Chivas |
| GAL | `0x6dab8fe8e5d425f2eb063aae58540aa04e273e0d` | 94 | Galatasaray S.K. |
| BAHIA | `0xe92e152fc0ff1368739670a5175175154ceeef42` | 93 | EC Bahia |
| CPFC | `0xa70bd29bef2936765fe33b0f4b0cf8e947d75581` | 84 | Crystal Palace |
| NAVI | `0x05765a792a04ecc6d45102b45874bc44a95a2d7e` | 83 | Natus Vincere |
| NAP | `0xbe7f1ebb1fd6246844e093b04991ae0e66d12c77` | 82 | Napoli |
| MENGO | `0xd1723eb9e7c6ee7c7e2d421b2758dc0f2166eddc` | 77 | Flamengo |
| JUV | `0x454038003a93cf44766af352f74bad6b745616d0` | 75 | Juventus |
| SAM | `0xfc21c38f4802ab29aed8cc7367542a0955cfa9d7` | 74 | Samsunspor |
| BFC | `0x319067e6253fdbf183c27abcaf31d45ad50e98ff` | 73 | Bologna FC |
| TIGERS | `0x0b39ff3de07e8b6d2b97357d6f2a658ed7de52cf` | 72 | Tigers |
| LEG | `0x3ce3946a68eb044c59afe77dfdfdc71f19eb4328` | 59 | Legia Warsaw |
| DZG | `0x6412afdfdf2a465b2e2464a5f9d1743a9cffd6ff` | 57 | Dinamo Zagreb |
| YBO | `0x0dc1776c56ffd3a046134be6fdc23a3214359329` | 56 | BSC Young Boys |
| GALO | `0xe5274eb169e0e3a60b9dc343f02ba940958e8683` | 54 | Clube Atlético Mineiro |
| VASCO | `0x6d72034d7508d16988bf84638d51592a8c02887b` | 51 | Vasco da Gama |
| GOZ | `0x0e469d1c78421c7952e4d9626800dad22f45361d` | 51 | Goztepe S.K. |
| ROUSH | `0xba20ef1670393150d1c1b135f45043740ec3a729` | 49 | Roush Fenway Racing |
| APL | `0xb407a167fe99eb97970e41b2608d0d9484c489c8` | 47 | Apollon Limassol FC |
| MIBR | `0xa8206af1e6a0289156d45b9d60e5bbd5d1fcf68d` | 44 | MIBR |
| TIGRES | `0xf17b1e028537aba705433f7cebdca881b5c5b79e` | 43 | Tigres |
| ALA | `0x863f7537b38130f01a42e9e9406573b1f1e309f7` | 43 | Alanyaspor |
| FOR | `0x4b56f121f769bbdee3faba6e8b9163e7cffdd59a` | 42 | Fortuna Sittard |
| SACI | `0x3175e779b42d35e2c9eeafadcf5b6e6ec6e4f910` | 39 | Internacional |
| ITA | `0x7483263ca24bfcff716a21f4a9bbf2610bdd9ec9` | 39 | FIGC (Italy) |
| POR | `0xffad7930b474d45933c93b83a2802204b8787129` | 37 | Portugal National Team |
| NOV | `0xe6bd000d6608e1e5d1476a96e7cb63c335c595a9` | 35 | Novara Calcio |
| MFC | `0xdeb5a271a67652a84decb6278d70a6d6a18d7c3b` | 31 | Millonarios |
| SAN | `0x44941a2d2049be0acb00baf0a5dee8931c33712e` | 29 | Club Santos Laguna |
| QUINS | `0x539e00d2487a06f3f08cdaf7bf7a8b4a32c3a14e` | 27 | Harlequins |
| UFC | `0x0ffa63502f957b66e61f87761cc240e51c74cee5` | 27 | UFC |
| GFK | `0x2a5dbf10a9eb8d948aef256fde8e62f811624c4f` | 26 | Gaziantep FK |
| LEV | `0x69d65e72266b15c2b2abcd69561399d9bd1843ef` | 25 | Levante |
| UDI | `0xd2571bb5e84f1a3ac643b6be1dd94fc9fb97041d` | 20 | Udinese |
| AVL | `0x095726841dc9bf395114ac83f8fd42b176cfad10` | 19 | Aston Villa |
| RSO | `0xdd03a533d6a309afff3053fe9fc6c197324597bb` | 17 | Real Sociedad |
| SFP | `0x2a89f8af25b01b837d67be3b1a162a663f77b26e` | 17 | Stade Français |
| SHARKS | `0x1f5ed1182b673338ecff0eeab13ed79ceaf775f5` | 16 | Sharks |
| ATLAS | `0x936ae5911f49634fd7f4f7385db1613c5e350ede` | 16 | Atlas FC |
| BUFC | `0xe87cb1546d50f523057d3f94b07381dce3f85ef9` | 15 | Bali United |
| ENDCEX | `0x3f521d391e2ad0093d3bfabb2516f1c57d73b4d1` | 14 | Endpoint CeX |
| EFC | `0xabee61f8ff0eadd8d4ee87092792aaf2d9b2ca8e` | 14 | Everton FC |
| RACING | `0x06ed14a885d0710118fc20d51efdc151a48005b3` | 10 | Racing |
| SPFC | `0x540165b9dfdde31658f9ba0ca5504eda448bffd0` | 8 | São Paulo FC |
| CAI | `0x8a48ad8279318757ea7905b460816c4b92de447e` | 5 | Club Atletico Independiente |
| SARRIES | `0x753dda10c7b3069f0c90837dc3755c7c40a81b8c` | 5 | Saracens |
| JDT | `0x12129ad866906ab5aa456ae1ebaea9e8a13e8197` | 3 | Johor Darul Ta'zim F.C |
| HASHTAG | `0x7be4aebc9900d2c1b628530ffc59416a98420b15` | 3 | Hashtag United F.C. |
| PERSIB | `0xc34bfba5db50152ef3312348a814d24f85748d64` | 2 | PERSIB |
| BENFICA | `0xad7c869f357b57bb03050183d1ba8ec465cd69dc` | 0 | SL Benfica |
| TRA | `0x304193f18f3b34647ae1f549fc825a7e50267c51` | 0 | Trabzonspor |
| ChzInu | `0xf3928e7871eb136dd6648ad08aeef6b6ea893001` | 0 | ChilizInu (4 decimals) |
| CHZWIF | `0x5380ec26851c8109bbb1bfcb78aa138724c6ec4c` | 0 | CHZWIF (meme) |
