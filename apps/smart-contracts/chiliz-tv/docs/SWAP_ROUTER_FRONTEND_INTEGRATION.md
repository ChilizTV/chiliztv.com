# ChilizSwapRouter — Frontend Integration (2026-06-11 redeploy)

## TL;DR for the frontend

1. **New router address** (mainnet): `0x72befD1186f24Cba64266995cD627B79C799292a`
2. **Fan tokens (PSG, BAR, …) now work** through the same `placeBetWithToken` /
   `donateWithToken` / `subscribeWithToken` calls — no new function to integrate.
3. **⚠ DECIMALS BUG TO FIX:** fan tokens on Chiliz have **0 decimals**, not 18.
   If the UI multiplies user input by `1e18`, a "bet 100 PSG" becomes
   `100000000000000000000` PSG units — that's a 100-quintillion-token bet that
   reverts (or drains the wallet allowance prompt looks absurd). **Always read
   `decimals()` from the token contract and scale with `parseUnits(amount, decimals)`.**
4. **Quote `amountOutMin` via the router itself** (`quoteTokenToUSDC`), never by
   hand-building a path. Pools are shallow; skipping slippage protection = sandwiched users.

## Live addresses (Chiliz mainnet, chain 88888)

| Contract | Address |
|---|---|
| ChilizSwapRouter (current) | `0x72befD1186f24Cba64266995cD627B79C799292a` |
| PariMatchFactory | `0x1e7F73d14D3E87205A766A14eC5847C12FEBfFd7` |
| StreamWalletFactory | `0x0Ffa30b48ADc0b2B773DC01422D249aEE135a4Bb` |
| USDC (Bridged, ChainPort) — 6 dec | `0xa37936F56249965d407E39347528a1A91eB1cbef` |
| WCHZ — 18 dec | `0x677F7e16C7Dd57be1D4C8aD1244883214953DC47` |
| Kayen V2 router (internal) | `0x1918EbB39492C8b98865c5E53219c3f1AE79e76F` |
| Kayen wrapper factory (internal) | `0xAEdcF2bf41891777c5F638A098bbdE1eDBa7B264` |
| PSG fan token — **0 dec** | `0xc2661815C69c2B3924D3dd0c2C1358A1E38A3105` |

Retired routers (do NOT use): `0x9c27c4…185E` (broken Kayen master-router
wiring), `0xF767C3…3A88` (no fan-token support).

## What happens under the hood

All bets settle in USDC inside the match contract. The router converts whatever
the user pays with, then calls `placeBetUSDCFor(user, …)` on the match
(the router holds `SWAP_ROUTER_ROLE`; the match address is validated against
the PariMatchFactory registry before any USDC moves).

### Native CHZ — `placeBetWithCHZ{value: chzWei}(match, marketId, outcome, amountOutMin, deadline)`
```
CHZ --[Kayen V2: WCHZ → USDC]--> USDC --> match escrow --> position recorded
```
One transaction, no approval needed.

### USDC — `placeBetWithUSDC(match, marketId, outcome, amount)`
Two txs: `USDC.approve(router, amount)` then the bet. No swap, no slippage params.

### Any ERC20 / fan token — `placeBetWithToken(token, amount, match, marketId, outcome, amountOutMin, deadline)`
Two txs: `token.approve(router, amount)` then the bet. Internally the router:
1. Pulls `amount` of `token` (measures actual received, fee-on-transfer safe).
2. **If `token` is a fan token** (a Kayen wrapped version exists AND
   `decimals() < 18`): approves the wrapper factory, wraps
   (1 unit → `10^(18-decimals)` wrapped units), and swaps
   `[wrappedToken, WCHZ, USDC]`. Emits `FanTokenWrapped`.
3. **Otherwise**: swaps `[token, WCHZ, USDC]` (or `[WCHZ, USDC]` if the token is WCHZ).
4. Forwards USDC to the match and records the position for the user.

`donateWithToken` / `subscribeWithToken` use the exact same swap pipeline, then
split fee → treasury / rest → StreamWallet escrow.

## Frontend checklist

### 1. Decimals (the big one)
| Asset | Decimals | "100" as on-chain amount |
|---|---|---|
| CHZ / WCHZ | 18 | `100000000000000000000` |
| USDC | 6 | `100000000` |
| **PSG and all CAP-20 fan tokens** | **0** | `100` |

Never hardcode `1e18`. Do `const d = await token.decimals()` and
`parseUnits(userInput, d)` everywhere (amounts, allowances, balance display).

### 2. Quoting & slippage
```ts
// Read the expected output through the SAME route the swap will take:
const usdcOut = await router.quoteTokenToUSDC(tokenAddr, amountInTokenUnits);
const amountOutMin = usdcOut * 99n / 100n;   // e.g. 1% tolerance
const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);
```
For CHZ bets quote with `router.quoteTokenToUSDC(WCHZ, chzWei)` (CHZ swaps
through WCHZ 1:1).

Optional route introspection: `router.swapRouteFor(token)` returns
`(swapToken, unitsPerToken, path)` — handy for showing "via wPSG → WCHZ" in the UI.

Price impact is real: at current depth 10 PSG ≈ 9.33 USDC but 100 PSG ≈ 63.4 USDC.
Consider showing impact % and warning above ~2-3%.

### 3. Events for indexing
- `BetPlacedViaCHZ(match, user, chzSpent, usdcReceived, marketId, outcome)`
- `BetPlacedViaToken(match, user, token, tokenSpent, usdcReceived, marketId, outcome)`
- `BetPlacedWithUSDC(match, user, amount, marketId, outcome)`
- `FanTokenWrapped(token, wrapped, amountIn, wrappedAmount)` — fires inside fan-token swaps
- Streaming: `DonationWith{CHZ,Token,USDCEvent}`, `SubscriptionWith{CHZ,Token,USDCEvent}`

### 4. Misc
- Update the router address everywhere (env, ABIs — the ABI gained
  `quoteTokenToUSDC`, `swapRouteFor`, `wrapperFactory`, `setWrapperFactory`,
  `FanTokenWrapped`).
- Never `transfer` tokens directly to the router — funds sent that way are lost.
  Only `approve` + call.
- Chiliz RPC: prefer `https://chiliz-rpc.publicnode.com`; the official
  `https://rpc.chiliz.com` load-balances onto stale nodes (reads can be
  ~70k blocks behind).
- Gas: legacy txs only, floor ≈ 2,500 gwei (use ~3,500 gwei).
