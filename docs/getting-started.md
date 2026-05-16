# New to ChilizTV? Start Here.

> **Newcomer's Guide** — Bet on live sports, stream matches yourself, and earn from the liquidity pool. Here's how it works in under five minutes.

---

## Table of Contents

1. [Welcome](#welcome)
2. [Get Started in 3 Steps](#get-started-in-3-steps)
3. [How Betting Works](#how-betting-works)
4. [Provide Liquidity, Earn Fees](#provide-liquidity-earn-fees)
5. [Stream a Match with OBS](#stream-a-match-with-obs)
6. [Content Rules — Read This](#content-rules--read-this)
7. [Earn & Rank Up](#earn--rank-up)
8. [Need Help?](#need-help)

---

## Welcome

ChilizTV is a fan-first SocialFi platform where sports meet on-chain economics. Anyone can:

- **Watch** live matches streamed by the community.
- **Bet** on outcomes through on-chain prediction markets.
- **Stream** their own feed and earn from viewers and bets.
- **Provide liquidity** to markets and collect a share of the fees.

---

## Get Started in 3 Steps

1. **Connect a wallet** — Click `Connect Wallet` in the top-right. We support most major wallets via Dynamic: MetaMask, Rabby, WalletConnect, and embedded socials.
2. **Fund with CHZ, USDC or any Fan Tokens** — ChilizTV runs on the **Chiliz Chain**. Bridge or buy CHZ, the native gas + collateral token, then deposit it into your wallet.
3. **Pick a match** — Head to **Discover** and open any live or upcoming match. From there you can watch, bet, stream, or supply liquidity.

---

## How Betting Works

Every match has an on-chain prediction market — usually **Home win / Draw / Away win**. Odds are derived from the pool itself: the more CHZ is staked on one side, the lower its payout multiplier.

1. **Choose your side** — Open a match page and select the outcome you want to back.
2. **Enter your stake** — Type the amount of CHZ you want to wager. The interface shows your **potential payout** and the current odds in real time.
3. **Confirm on-chain** — Sign the transaction in your wallet. Your position is now locked in until the match settles.
4. **Settlement** — Once the match ends, the result is posted on-chain. Winners can claim their payout directly from the match page — no middleman, no manual approval.

> 💡 **Tip:** Odds shift live as more bets come in. If you like a side at a good price, locking it in early usually pays better.

---

## Provide Liquidity, Earn from Losing Bets

Don't want to pick a winner? You can deposit CHZ into a match pool as a **liquidity provider (LP)**. The pool takes the other side of every bet: when bettors lose, the pool keeps their stake; when bettors win, the pool pays them out.

Bettors **don't pay a trading fee** — the LP edge comes from being the counterparty, not from a cut on each bet.

1. **Open a match → Liquidity tab** — Each market has a dedicated LP section showing pool size and current exposure.
2. **Deposit CHZ** — Pick an amount and confirm. You receive LP shares that represent your slice of the pool.
3. **Earn from losing bets** — Every stake that ends up on the losing side flows into the pool, pro-rata to LP shares.
4. **Withdraw after settlement** — Once the match settles you can redeem your LP shares for CHZ + your share of the pool's net P&L.

### Loss split

If the pool ends up net-losing on a match (winners are owed more than the pool collected), losses are **socialized between LPs and the house**:

| Party | Share of losses |
| ----- | --------------- |
| Liquidity Providers | **60%** |
| House (protocol reserve) | **40%** |

This means LPs only carry **60%** of the downside while keeping the upside of being the counterparty.

> ⚠️ **Heads up:** Providing liquidity is **not risk-free** — your LP shares can be worth less than you deposited if too many bets land correctly. Diversify across matches.

---

## Stream a Match with OBS

Anyone can broadcast. Open a match page, hit **"Go Live"**, and ChilizTV will generate a private **stream key** just for you. Then point OBS at our ingest server.

### Step-by-step

1. **Install OBS Studio** — Free and open-source. Grab it from [obsproject.com](https://obsproject.com) (Windows, macOS, Linux).
2. **Open Settings → Stream** — In OBS, click `Settings`, then the `Stream` tab in the sidebar.
3. **Service: `Custom…`** — From the Service dropdown, choose `Custom…` so you can paste your own URL and key.
4. **Paste the Server URL** — Use the RTMP ingest URL shown on your stream page:
   ```
   rtmp://stream.chiliztv.com/live
   ```
5. **Paste your Stream Key** — Copy the unique **Stream Key** from your match's streaming panel into OBS's Stream Key field. Treat it like a password — never share it.
6. **Apply → Start Streaming** — Click `Apply`, close Settings, then press `Start Streaming` in the main OBS window. Within ~4 seconds the match page should flip to **LIVE**.

### Recommended encoder settings

| Setting           | Value                       |
| ----------------- | --------------------------- |
| Encoder           | x264 / NVENC                |
| Output resolution | 1280×720 or 1920×1080       |
| Frame rate        | 30 or 60 fps                |
| Video bitrate     | 3500–6000 kbps              |

> 💡 **Tip:** If the LIVE badge doesn't light up, double-check the Server URL and Stream Key, and make sure your firewall allows outbound port 1935 (RTMP).

---

## Content Rules — Read This

ChilizTV is a community streaming platform. To keep the protocol and our streamers safe, there are a few hard rules:

| Status | Rule |
| ------ | ---- |
| ❌ | **No re-broadcasting licensed feeds** — Do not rebroadcast official TV channels, paid streaming services, or any feed you don't own the rights to. Licensed matches (Premier League, Champions League, etc.) cannot be retransmitted here. |
| ✅ | **Your own football content is welcome** — Amateur matches, local league games, training sessions, watch-along commentary, analysis, fan reactions, futsal, street football — if you own or have permission for the footage, you can stream it. |
| ✅ | **More sports coming soon** — Football is live first. Basketball, MMA, tennis, motorsport and esports markets are on the roadmap — same rules will apply. |
| ❌ | **No illegal, hateful or NSFW content** — Standard stuff: nothing illegal, no harassment, no hate speech, no sexual content. Violations get the stream cut and the streamer slashed. |

> ⚠️ **Heads up:** Streams may be reviewed at any time. Repeated or serious violations can result in a permanent ban and loss of staked rewards.

---

## Earn & Rank Up

Activity is rewarded. Betting, streaming and providing liquidity all contribute to your on-chain reputation and your position on the **Leaderboard**.

- ★ **Winning bets** grow your P&L and visible track record.
- ★ **Streamers** earn from viewers, tips, and a share of pool fees for hosted matches.
- ★ **LPs** stack fees every time a bet is placed in their pool.

→ [View Leaderboard](/leaderboard)

---

## Need Help?

Still stuck? Two good next steps:

- **Deep dive** → [Read the Whitepaper](/whitepaper) — Protocol mechanics, tokenomics, governance.
- **Jump in** → [Browse Live Matches](/browse) — The fastest way to learn is to try one.
