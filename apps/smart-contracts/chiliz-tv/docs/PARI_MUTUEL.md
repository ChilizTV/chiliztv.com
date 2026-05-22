# Pari-Mutuel Match Markets

Sport-event prediction markets built on a single shared escrow per match, with
oracle-driven on-chain resolution.

The system is **pari-mutuel**, not order-book or CPMM. There are no shares,
no continuous prices, and no secondary market. Users place a USDC stake on an
outcome; when the market resolves, winners share the net pool proportionally
to their stake on the winning outcome.

```
                     ┌───────────────────────────────────┐
                     │  PariMatchFactory                 │
                     │   - one match = one UUPS proxy    │
                     │   - isMatch[]  → router allowlist │
                     └────────────┬──────────────────────┘
                                  │ creates (proxy)
              ┌───────────────────┴──────────────────────┐
              ▼                                          ▼
     FootballPariMatch                         BasketballPariMatch
              │                                          │
              └────────────── inherits ──────────────────┘
                              ▼
                      PariMatchBase
                      (escrow + state machine
                       + pari-mutuel math)
```

`ChilizSwapRouter` calls `placeBetUSDCFor` after swapping the user's CHZ /
fan-token / arbitrary ERC20 → USDC. The router holds `SWAP_ROUTER_ROLE` on
each proxy.

---

## 1. Markets, not matches

A match is an event in the real world (a football game, a basketball game).
A **market** is one specific question about that event:

| Market type        | Sport      | Outcomes                          | Notes                                           |
|--------------------|------------|-----------------------------------|-------------------------------------------------|
| `WINNER`           | Football   | Home / Draw / Away                |                                                 |
| `GOALS_TOTAL`      | Football   | Under / Over                      | `line` in 1/10-goal units, e.g. 25 = 2.5        |
| `BOTH_SCORE`       | Football   | No / Yes                          |                                                 |
| `HALFTIME`         | Football   | Home / Draw / Away                |                                                 |
| `CORRECT_SCORE`    | Football   | `home*10 + away`, 0..99           | each side clamped to 9 at resolution            |
| `FIRST_SCORER`     | Football   | player ID 1..255                  | 0 reserved for "no scorer"                      |
| `GOALS_EXACT`      | Football   | `0..line` bucketed                | scalar / bucket market — see § 3                |
| `WINNER`           | Basketball | Home / Away                       | no draw                                         |
| `TOTAL_POINTS`     | Basketball | Under / Over                      | `line` in 1/10-point units                      |
| `SPREAD`           | Basketball | Home covers / Away covers         | `line` = home handicap in 1/10-pt units         |
| `QUARTER_WINNER`   | Basketball | Home / Away                       | `extra` selects Q1..Q4                          |
| `FIRST_TO_SCORE`   | Basketball | Home / Away                       | not derivable from final score                  |
| `HIGHEST_QUARTER`  | Basketball | Q1 / Q2 / Q3 / Q4                 |                                                 |
| `POINTS_EXACT`     | Basketball | `0..line` bucketed                | `extra` = step size; see § 3                    |

A single match proxy can carry any number of markets. Liquidity stays in one
escrow; one fee stream; one set of admin keys. Multiple lines of the same
market type (Over 1.5, Over 2.5, Over 3.5) are just multiple markets — each
with its own pool.

---

## 2. Lifecycle

```
Inactive ──open──▶ Open ──suspend──▶ Suspended ──open──▶ Open
                     │  │                   │
                     │  │                   └─close──▶ Closed ─resolve──▶ Resolved
                     │  │                                    │             │  └ claim
                     │  └close──▶ Closed                     │             │
                     │                                       │             ▼
                     └──── cancel ─────────────────▶ Cancelled ◀── void on resolve
                                                       │
                                                       └ refund (whole stake)
```

* **Inactive → Open**: `openMarket` (ADMIN_ROLE). Stakes accepted.
* **Open ↔ Suspended**: `suspendMarket` / `openMarket` (ADMIN_ROLE). Live-game timeouts.
* **Open → Closed**: `closeMarket` (ADMIN_ROLE). No more stakes.
* **Closed → Resolved**: `resolveMarket(id, outcome)` (RESOLVER_ROLE) or
  `resolveByScore(score)` (RESOLVER_ROLE) — see § 4.
* **Closed → Cancelled (void)**: automatically if no one bet on the winning
  outcome. All stakers refund their full position. No fee.
* **Anything but Resolved/Cancelled → Cancelled**: `cancelMarket(id, reason)`
  (ADMIN_ROLE). Refunds for all.

---

## 3. Scalar / bucket markets (`GOALS_EXACT`, `POINTS_EXACT`)

Sometimes you want richer questions than Over/Under at one line. `GOALS_EXACT`
buckets the total goal count into multiple outcomes:

```
GOALS_EXACT, line = 5
  outcomes: 0  1  2  3  4  5(+)
            └─ each integer goal count ─┘
```

* `line` ∈ [1, 255]. Final outcome = `min(homeGoals + awayGoals, line)`.
* `maxOutcome == line`, so `outcomeCount == line + 1`.
* The cap bucket absorbs every count ≥ `line`. Pick `line` so the cap is rare.

`POINTS_EXACT` (basketball) adds a **step** so totals don't blow up:

```
POINTS_EXACT, line = 11, step = 20
  outcomes: 0       1       2       3      ...   10      11(+)
            [0-19]  [20-39] [40-59] [60-79] ...  [200-219] [≥220]
```

`extra` carries the step size; 0 falls back to step = 1. Bucket index is
`min(total / step, line)`.

These markets are pari-mutuel like every other market: stake on a bucket,
winners share the net pool proportionally to their bucket-bet.

---

## 4. Oracle resolution

Two paths, both gated by `RESOLVER_ROLE`:

### a. Per-market explicit outcome

```solidity
resolveMarket(uint256 marketId, uint64 outcome);
resolveMarketsBatch(uint256[] ids, uint64[] outcomes);
```

No assumptions about input format. The oracle decides each outcome and the
contract just checks the outcome is in range. Used when the off-chain
resolution logic is complex or sport-specific data is not available on chain.

### b. Resolve-by-score (typed, atomic, gas-efficient)

```solidity
// Football
struct FootballScore { uint8 homeGoals; uint8 awayGoals; uint8 htHomeGoals; uint8 htAwayGoals; uint8 firstScorerId; }
resolveByScore(FootballScore s);
resolveBatchByScore(uint256[] marketIds, FootballScore s);
computeOutcome(uint256 marketId, FootballScore s) returns (uint64 outcome, bool resolvable);

// Basketball
struct BasketballScore {
    uint8 homeQ1; uint8 awayQ1; uint8 homeQ2; uint8 awayQ2;
    uint8 homeQ3; uint8 awayQ3; uint8 homeQ4; uint8 awayQ4;
    uint8 firstToScore;
}
resolveByScore(BasketballScore s);
resolveBatchByScore(uint256[] marketIds, BasketballScore s);
computeOutcome(uint256 marketId, BasketballScore s) returns (uint64 outcome, bool resolvable);
```

One signed result blob, one transaction, every market on the match settles.

The contract walks every market in `Closed` state and derives the outcome
from `s` per the market-type rules in § 1. Markets whose outcome cannot be
derived from `s` are **skipped, not failed** — they stay in `Closed`. Skips
happen for:

* `FIRST_SCORER` when `firstScorerId == 0` (unknown).
* `FIRST_TO_SCORE` when `firstToScore == 0` (unknown).
* `QUARTER_WINNER` when the chosen quarter is a tie.
* `WINNER` (basketball) when the game is tied.
* `SPREAD` when `home - away == line` (push).
* `HIGHEST_QUARTER` when two or more quarters tie at the top.

After `resolveByScore`, the oracle can settle skipped markets with explicit
outcomes via `resolveMarket`, or the admin can `cancelMarket` them.

`computeOutcome` is a view-only sibling — useful for off-chain dry-runs
before submitting the resolution tx.

---

## 5. Pari-mutuel payout math

```
fee     = totalPool * feeBps / BPS_DENOM        // capped at MAX_FEE_BPS = 5%
netPool = totalPool - fee                       // snapshotted at resolve time
payout(user) = userStake[winningOutcome]
             * netPool
             / outcomePool[winningOutcome]
```

* Multiplication before division to keep precision.
* Floor division can leave at most `(numWinners)` wei of dust in the
  contract. The system never overpays.
* `netPool` is frozen at resolution: changing `feeBps` afterwards does not
  affect in-flight claims.
* Losing-outcome stakes stay in the contract (they're already inside
  `totalPool`); only winners on the resolved outcome receive payouts.

---

## 6. Storage layout (upgrade-safe)

```
PariMatchBase slots
──────────────────────────────────────────────
 0  matchName            (string)
 1  sportType            (string)
 2  marketCount          (uint256)
 3  _marketCores         (mapping)
 4  _totalPool           (mapping)
 5  _outcomePool         (mapping)
 6  _userStake           (mapping)
 7  _userTotalStake      (mapping)
 8  _claimed             (mapping)
 9  usdcToken            (IERC20)
10  feeRecipient (20) + feeBps (2)              ── packed
11  _marketSpec          (mapping)                ── NEW (consumes 1 gap slot)
12..49  __gap[38]
50..  sport-specific contract storage (always begins with __gap[50])
```

Adding a new field after deployment: take from `__gap`, document the slot,
keep order.

---

## 7. Roles

| Role                  | Holder                | Powers                                              |
|-----------------------|-----------------------|-----------------------------------------------------|
| `DEFAULT_ADMIN_ROLE`  | Owner (multisig)      | UUPS upgrades, role management                      |
| `ADMIN_ROLE`          | Owner (multisig)      | Create / open / close / cancel markets, fee setters |
| `RESOLVER_ROLE`       | Oracle EOA            | `resolveMarket`, `resolveByScore`                   |
| `PAUSER_ROLE`         | Owner / ops EOA       | `emergencyPause`                                    |
| `SWAP_ROUTER_ROLE`    | `ChilizSwapRouter`    | `placeBetUSDCFor`                                   |

`PariMatchFactory` is granted all roles temporarily during deployment and
renounces them inside the same transaction. After `createFootballMatch` /
`createBasketballMatch` returns, the factory holds no role on the proxy.

---

## 8. Frontend integration

Reading market state:

```solidity
PariMatchBase.MarketSpec memory spec = match.getMarketSpec(marketId);
// spec.marketType / spec.line / spec.maxOutcome / spec.extra / spec.groupId

(bytes32 type_, MarketState state, uint64 result, uint256 totalPool, uint256 outcomeCount)
    = match.getMarketInfo(marketId);

uint256 prob = match.getImpliedProbabilityBps(marketId, outcome);   // off-chain only
```

`groupId` on `MarketSpec` is a free 16-bit field for the UI: set it
identically on related markets (e.g. all O/U lines for the same match) so the
frontend can render them under one heading.

Placing a bet directly with USDC:

```solidity
usdc.approve(matchAddr, amount);
match.placeBetUSDC(marketId, outcome, amount);
```

Or via the swap router (CHZ → USDC → bet):

```solidity
router.placeBetWithCHZ{value: chzAmount}(matchAddr, marketId, outcome, minUsdcOut, deadline);
```

---

## 9. Adding a new sport

1. Extend `PariMatchBase`.
2. Define your market-type constants and your `XScore` struct.
3. Implement `_isValidMarketType(bytes32)` and `_getMaxOutcome(bytes32, int16)`.
4. Implement a typed `resolveByScore(XScore)` (and optional batch variant).
5. Add your sport to `PariMatchFactory`.

Nothing else: stake recording, pari-mutuel math, lifecycle, refunds, claims,
fee handling, and access control are inherited.
