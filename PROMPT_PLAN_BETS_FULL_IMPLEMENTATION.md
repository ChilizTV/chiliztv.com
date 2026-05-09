# Prompt — Plan d'implémentation complète des paris **Football** (markets sous stream + my-bet panel + dashboard)

> À coller à Claude Code en **mode plan** (pas de code). Scope : **football uniquement**. Le but : produire un plan ordonné pour finaliser l'expérience pari de bout en bout — depuis la liste des markets sous le stream, jusqu'à la confirmation post-tx, en passant par le panneau "Mon pari sur ce match" sous le live, et le dashboard `/dashboard` qui liste tous les bets avec claim. Tous les types de markets **football** supportés par les contrats doivent être pris en charge (ils ne le sont que partiellement aujourd'hui).
>
> **Le contrat `BasketballMatch` existe et reste fonctionnel côté on-chain**, mais on **n'expose rien** côté UI/back/indexers spécifiquement basket dans ce lot. Toute mention de "basketball" dans le code front est filtrée ou marquée `// SKIP: out of scope (football-only)`.

---

## 1. Rappel — types de bets supportés par le contrat `FootballMatch`

`apps/smart-contracts/chiliz-tv/src/betting/FootballMatch.sol` :

| Market | Constante `bytes32` | Sélections valides | Line | Notes |
|---|---|---|---|---|
| **WINNER** (1X2) | `keccak256("WINNER")` | `0`=Home, `1`=Draw, `2`=Away | `0` (n/a) | maxSelections=2 |
| **GOALS_TOTAL** (Over/Under) | `keccak256("GOALS_TOTAL")` | `0`=Under, `1`=Over | int16 × 10 (ex. 25 = 2.5 buts) | maxSelections=1 |
| **BOTH_SCORE** (BTTS) | `keccak256("BOTH_SCORE")` | `0`=No, `1`=Yes | `0` | maxSelections=1 |
| **HALFTIME** | `keccak256("HALFTIME")` | `0`=Home, `1`=Draw, `2`=Away | `0` | Identique à WINNER mais à la mi-temps |
| **CORRECT_SCORE** | `keccak256("CORRECT_SCORE")` | `0..99` (score encodé) | encoding au choix admin | maxSelections=99 |
| **FIRST_SCORER** | `keccak256("FIRST_SCORER")` | `0..255` (player ID ou Home/Away/None) | `0` | maxSelections=255 |

> ⚠ Dans le code front actuel (`getOutcomes` dans `MarketBetDialog.tsx`), `firstscorer` est mappé à 3 outcomes (Home / Away / No Goal). C'est une simplification UX — le contrat accepte 0..255. À documenter comme "FIRST_SCORER simplifié = équipe qui marque en premier" dans le plan, ou exposer le vrai mapping admin (player IDs).

### Lifecycle d'un market (commun à BettingMatch)
```
Inactive(0) → Open(1) → Suspended(2) → Closed(3) → Resolved(4)
                                              ↘
                                               Cancelled(5)
```
- `Open` est le seul état où on peut bet (`isMarketOpen`).
- `Resolved` permet `claim` aux gagnants.
- `Cancelled` permet `claimRefund` à tous.
- Les odds sont **lockées au moment du bet** (registry indexé), donc une bet faite à 2.20× reste à 2.20× même si l'admin change l'odds courante.

### Hors scope (à ne pas implémenter dans ce lot)

Le contrat `BasketballMatch.sol` existe et expose : `WINNER`, `TOTAL_POINTS`, `SPREAD`, `QUARTER_WINNER`, `FIRST_TO_SCORE`, `HIGHEST_QUARTER`. Le hook wagmi `useBasketballMatch*` est généré. **Aucun de ces markets n'est intégré côté front dans ce lot.** Le dispatcher UI doit ignorer silencieusement les contracts dont `factory.getSportType() === BASKETBALL` (typeof `1`) — afficher un placeholder "Basketball markets — coming soon" plutôt que de planter.

---

## 2. Audit de l'implémentation actuelle

### Ce qui marche
- **`MatchMarketsList.tsx`** (`components/live/MatchMarketsList.tsx`) : liste correctement les markets via `useBettingMatchReadMarketCount` + `useBettingMatchReadGetMarketInfo` par `marketId`. Mapping `MARKET_TYPE_HASH_TO_KEY` couvre les 6 markets football. État (Inactive/Open/Suspended/Closed/Resolved/Cancelled) bien stylé. Le bouton "Predict" est actif uniquement si `state === 1` ET `key ∈ SUPPORTED_BET_KEYS`.
- **`MarketBetDialog.tsx`** : dialog multi-token (USDC/CHZ/ERC20) via `useChilizSwapRouter.placeBet`, avec quote Kayen, slippage 0.5% par défaut, allowance flow ERC20, vérif liquidité pool (`useBettingMatchReadQuoteNetExposure` vs `useLiquidityPoolReadFreeBalance`), watch event `BetPlaced` filtré sur `(user, marketId)` pour confirmation belt-and-braces, **toast Sonner sur succès**, auto-close 1.2s/4s selon event vu.
- **`AboutLiveSection.tsx`** : 2 tabs sous le stream — `Markets` (liste markets) et `Schedule` (planning streamer, mock).
- **Dashboard `MyBetsSection`** : déjà présent (`components/features/dashboard/sections/MyBetsSection.tsx`), filtres All/Pending/Won/Lost/Claimable/Refundable, avec `BetRow.tsx` qui appelle `useBettingMatchWriteClaim` / `useBettingMatchWriteClaimRefund`, `ClaimAllBanner`, hook `useMyBets` qui hit `GET /bets` (table `bets` indexée Lot 1 du plan d'intégration des contrats).
- **Hooks wagmi** : tous générés (`useBettingMatchWriteClaim/All/Refund`, `useBettingMatchWatchPayout/Refund/MarketResolved`, `useBettingMatchReadGetUserBets/GetMarketInfo`, `useFootballMatch*` aussi disponibles si besoin de typer plus précisément).

### Ce qui manque (priorités)

#### 2.1 — Pas de "My bet on this match" sous le live
La 2ème tab `Schedule` est un mock peu utile (planning du streamer, données figées). L'utilisateur veut **voir ses propres bets sur ce match précis** sans quitter le live. Aujourd'hui il faut aller sur `/dashboard` pour ça.

#### 2.2 — Markets non-binaires non implémentés en UI
`MarketBetDialog.getOutcomes()` ne gère que `winner`, `halftime`, `goalstotal`, `bothscore`, `firstscorer`. Il **ne gère pas** `correctscore` — UX spécifique requise (grille de scores type 0-0, 1-0, 2-1, etc.).

`SUPPORTED_BET_KEYS` dans `MatchMarketsList.tsx` exclut `correctscore` (state-only display, pas bet). L'UI doit le supporter, sinon on perd un market clé du contrat football.

#### 2.3 — `dashboard/components/BetRow.tsx` `fmtSelection` est binaire-only
Le helper `fmtSelection` dans `domain/bets.ts` n'affiche que `home/draw/away` pour selections `0/1/2`. Pour les markets `goalstotal`, `bothscore`, `firstscorer`, `correctscore`, on tombe sur le fallback `"Selection #N"` qui est cryptique. À enrichir avec le contexte `marketType` + `line` (déjà dans la table `bets` côté indexer ? À vérifier — sinon il faut joindre `market_events.MarketCreated` pour récupérer le `marketType` à partir de `(contractAddress, marketId)`).

#### 2.4 — Toast "succès du pari" trop discret
Aujourd'hui, sur succès :
- toast Sonner unique (`toast.success("Prediction placed")`) qui se dissipe en 4s
- dialog se ferme en 1.2-4s

L'utilisateur veut un **feedback plus marqué** (le brief le dit explicitement : "un message de succès comme quoi j'ai bien parié"). Recommandé : panneau de confirmation **inline dans le dialog** avant fermeture (BetPlaced state), avec :
- ✓ icon rouge animé
- "Bet placed — $X.XX USDC on <selection> @ ×Y.YY"
- "Potential payout: $Z.ZZ USDC if it hits"
- Lien explorer + lien "View in dashboard"
- CTA "Place another"

#### 2.5 — Sous le live, "Schedule" doit être remplacé par "My bet on this match"
Au lieu de `[Markets] [Schedule]`, on veut `[Markets] [My Bet]` (singulier, contextualisé au match ouvert). Le tab `My Bet` :
- liste les bets de l'utilisateur **sur ce contrat précis** (`useBettingMatchReadGetUserBets(contractAddress, marketId, user)` itéré sur `marketCount`, OU mieux : query backend filtrée `GET /bets?user=X&contractAddress=Y`)
- Affiche pour chaque bet : market type · selection humanisée · stake · odds locked × × · status pill · action (Claim / Refund / —)
- Compteur dans le label de la tab : `My Bet (3)` si l'utilisateur a 3 bets sur ce match
- Empty state si zéro bet : "You haven't bet on this match yet" + CTA "Open markets"

> Le tab `Schedule` n'est **pas perdu** — il peut migrer dans la `BrowseLivesCollapsible` (existante) à côté du nom du streamer, sous forme de tooltip/popover, si la donnée est jugée utile. Sinon, supprimer purement.

#### 2.6 — Pas de gestion de tous les états résolus dans le dialog d'achat
Aujourd'hui le dialog `MarketBetDialog` désactive le CTA si `state !== 1`. Mais :
- Pas de message clair si `state === Suspended` ("Market paused — odds being repriced, try again in a minute")
- Pas d'info sur la `result` du market `Resolved` ("This market has settled — Home won")
- Pas de path `Refund` depuis le dialog si `Cancelled` (l'utilisateur doit aller sur `/dashboard`)

#### 2.7 — Pas de pré-remplissage selection-as-prop quand on clique "Bet on Home" depuis une carte
Le user expérience actuelle force à ouvrir le dialog vide et choisir l'outcome. Idéalement, on peut cliquer une **odd individuelle** sur le market row (les 3 cells `H/D/A` par exemple) → dialog s'ouvre avec selection pré-sélectionnée.

#### 2.8 — Aucun garde basketball
Si un contrat basket est rendu par la liste (cas test), `MarketBetDialog` plante silencieusement (`getOutcomes` retourne `[]`). Il faut un **garde explicite** : lecture `factory.getSportType()` + branchement précoce avec un placeholder "Basketball markets — coming soon".

---

## 3. Ce que je veux dans ton plan

Tu produis un plan **ordonné par dépendance**, en **lots atomiques < 1 jour chacun**, avec pour chaque lot : objectif business, fichiers exacts (créés/modifiés/supprimés), sous-tâches, hooks wagmi nommés, risques, vérifications, taille S/M/L.

### Lots attendus (à challenger si tu as mieux)

#### Lot 1 — Domain layer : market type catalog **football** (S)
Créer un module pur `apps/frontend/lib/contracts/markets/`:

- `marketTypes.ts` — table `FOOTBALL_MARKETS` indexée par `bytes32` hash → `{ key, label, hint, icon, hasLine, getOutcomes(line, homeTeam, awayTeam) }`. Couvre **tous** les markets football (WINNER, GOALS_TOTAL, BOTH_SCORE, HALFTIME, CORRECT_SCORE, FIRST_SCORER). **Pas de basket**.
- `formatSelection.ts` — fonction pure `fmtSelectionByMarket(selection, marketType, line, homeTeam, awayTeam)` qui produit "Over 2.5 goals", "Both score: Yes", "Score 2-1", etc.
- `marketState.ts` — enum `MarketState` + helpers `isOpen`, `isResolvable`, `isRefundable`, `stateLabel`.
- `correctScoreEncoding.ts` — encodeur/décodeur pour `CORRECT_SCORE` selection (proposition : selection = `home * 10 + away`, donc 0-0=0, 1-0=10, 0-1=1, 2-1=21, etc., capped à 99). À valider avec le contrat — voir si l'admin a une convention.
- `sportType.ts` — enum `SportType { FOOTBALL = 0, BASKETBALL = 1 }` + helper `isFootballMatch(sportType)`. Utilisé pour les gardes au Lot 2.

**Bénéfice** : remplace `MARKET_TYPE_HASH_TO_KEY` + `getOutcomes()` + `MARKET_META` dispersés dans `MatchMarketsList.tsx` et `MarketBetDialog.tsx` + `fmtSelection` dans `domain/bets.ts` par un seul module testable. **Aucun mapping basket** dans ce module — un contrat basket retournera `null` depuis le catalog et déclenchera le placeholder Lot 2.5.

#### Lot 2 — Refactor `MarketBetDialog` pour supporter tous les markets **football** (M)

- Découper `MarketBetDialog.tsx` (752 lignes) en sous-composants par "phase" :
  - `BetSelectionStep` (choisir l'outcome) — variantes par market type via `FOOTBALL_MARKETS[type].renderSelection`
  - `BetAmountStep` (choisir token + montant + slippage)
  - `BetReviewStep` (preview odds locked, payout, slippage, fees)
  - `BetSuccessStep` (le panneau de confirmation §2.4)
- Pour chaque market football, rendre le `renderSelection` adapté :
  - `WINNER`, `HALFTIME` → 3 boutons (Home/Draw/Away) avec logo équipe
  - `GOALS_TOTAL` → 2 boutons Over/Under avec line en gros
  - `BOTH_SCORE` → 2 boutons Yes/No
  - `CORRECT_SCORE` → grille 6×6 (0-0 à 5-5) cliquable, avec scroll si > 36 scores configurés
  - `FIRST_SCORER` → 3 boutons (Home / Away / No goal) — version simplifiée
- `BetSuccessStep` (post-tx) :
  - ✓ animé (framer-motion ou CSS keyframe)
  - "Bet placed" 24px Barlow, sous-titre montant + selection + odds
  - "Potential payout: $X.XX USDC" en vert `#2dd4a4` 28-32px Barlow
  - Détails repliables : tx hash + lien explorer + indexer status (event vu / pas encore vu)
  - 2 CTAs : "Place another" (réinitialise le dialog) + "View my bets" (navigate `/dashboard#bets` ou ferme + scroll)
  - Auto-close désactivé tant que l'utilisateur n'a pas cliqué (vs aujourd'hui 1.2-4s) ; ou option "Auto-close in 5s" avec compte à rebours visible
- Toast Sonner conservé en plus (utile si dialog déjà fermé via auto-close optionnel)

#### Lot 2.5 — Garde "basketball coming soon" (S)
- Avant `BetSelectionStep`, lire `factory.getSportType(contractAddress)` via `useBettingMatchFactoryReadGetSportType`.
- Si `SportType.BASKETBALL` → afficher un placeholder plein dialog : eyebrow rouge "Basketball · Roadmap", titre "Coming soon", texte "Football markets only for now. Basketball matches will go live once the betting UI ships." + CTA "Discover football matches" (navigate `/browse`).
- Aucun crash, aucun rendu de market mal mappé.
- Même garde côté `MatchMarketsList` : si sport ≠ FOOTBALL, masquer la liste des markets et afficher le placeholder.

#### Lot 3 — `MatchMarketsList` : odds cliquables pour pré-remplir (S)
Étendre la `MarketRow` :
- Si market `WINNER`/`HALFTIME` (3 outcomes), afficher 3 cells cliquables `H · X · 2` avec odds chacune (lecture via `useBettingMatchReadGetCurrentOdds(marketId)` — actuellement non lu)
- Si market binaire (`GOALS_TOTAL`, `BOTH_SCORE`), 2 cells
- Click sur une cell → ouvre `MarketBetDialog` avec `defaultSelection` pré-sélectionnée
- Garder un bouton "Predict" générique qui ouvre sans pré-sélection
- **Watch** `useBettingMatchWatchOddsUpdated` pour rafraîchir les odds en temps réel
- Pour `CORRECT_SCORE` → pas d'inline (trop d'outcomes), garder uniquement le bouton "Predict" qui ouvre la grille
- Pour `FIRST_SCORER` → 3 cells (Home / Away / None)

#### Lot 4 — Sous le live : remplacer `Schedule` par `My Bet on this match` (M)

- Supprimer ou déplacer `StreamerSchedule.tsx` (Schedule était mock, peu utile sous le live)
- Créer `components/live/MyBetsOnMatch.tsx` :
  - Props : `contractAddress: Address`, `userAddress?: Address`
  - Source de données : `useMyBetsOnMatch(user, contractAddress)` — nouveau hook wrapper sur `useMyBets({ user })` avec filter client-side `b.contractAddress === contractAddress`. Fallback on-chain si API down : `useBettingMatchReadGetUserBets(contractAddress, marketId, user)` itéré, mais limité (pas de discovery des marketIds → au mieux iterate `0..marketCount-1`).
  - Liste les bets de l'user sur ce match : market type · selection humanisée · stake · odds × × · status · payout estimé (si pending) ou réel (si resolved)
  - Action button par row :
    - `WON` & `!claimedAt` → bouton "Claim $X.XX" rouge → `useBettingMatchWriteClaim(contractAddress, marketId, betIndex)`
    - `REFUNDED` & `!refundedAt` → bouton "Claim refund" → `useBettingMatchWriteClaimRefund(...)`
    - Sinon : status pill (Pending / Lost / Claimed)
  - Header de section : si claimable > 0, mini-banner "X wins ready · $Y.YY" + CTA "Claim all" → `useBettingMatchWriteClaimAll(contractAddress, marketId)` (un par market — le contrat n'a pas de "claim all across markets")
  - Empty state : "You haven't bet on this match yet" + CTA "Pick a market →" qui scrolle vers le tab `Markets`
  - Watch `useBettingMatchWatchPayout` + `useBettingMatchWatchRefund` filtrés sur `(user)` → invalidate la query `my-bets`
- Modifier `AboutLiveSection.tsx` :
  - Remplacer `tabs = [{key:'markets',label:'Markets'}, {key:'schedule',label:'Schedule'}]` par `[{key:'markets',label:'Markets'}, {key:'mybet',label: \`My Bet${count > 1 ? 's' : ''}${count > 0 ? \` (\${count})\` : ''}\`}]`
  - Branchement de `MyBetsOnMatch` quand `activeTab === 'mybet'`
  - Si zéro bet, le label tab reste "My Bets" (sans compteur) et le content render l'empty state

#### Lot 5 — Domain refacto : `fmtSelection` enrichi (S)
- Modifier `dashboard/domain/bets.ts.fmtSelection` pour utiliser le module Lot 1 — déléguer à `fmtSelectionByMarket(selection, marketType, line, homeTeam, awayTeam)`.
- Étendre l'API `GET /bets` pour inclure `marketType` (bytes32 → string), `line` dans la réponse (joindre depuis `market_events.MarketCreated` côté indexer back). Si pas dispo, le front peut faire un fallback `useBettingMatchReadGetMarketInfo(contractAddress, marketId)` — mais c'est N appels supplémentaires côté UI, à éviter.
- Mise à jour cohérente dans `BetRow.tsx` et `MyBetsOnMatch.tsx`.
- Si la réponse `bets` contient un sport-type sport inconnu (basket), ne pas afficher la row dans le dashboard — soit la masquer, soit la marquer `[Basketball — coming soon]`.

#### Lot 6 — Confirmation post-bet : la "success state" (S)
Détaille le `BetSuccessStep` du Lot 2 :
- État local : `phase = 'idle' | 'submitting' | 'confirming' | 'success' | 'error'`
- Sur `isSuccess` ET `eventConfirmed` → phase=`success`, montrer le panneau plein dialog
- Réutiliser le composant pour les claims aussi (`Claim placed — $X.XX USDC will land in your wallet`), mais c'est secondaire
- Toast Sonner devient secondaire, le panneau dialog est primary

#### Lot 7 — Polishing (S)
- `MarketBetDialog` : afficher la `currentOdds` à côté du selectionné en review step + warning "odds may have changed since you opened the dialog" (compare odds at open vs at submit via watch)
- `MarketBetDialog` : surface l'erreur `BetAmountAboveCap` (du pool, cap par bet) avec message clair
- `MyBetsOnMatch` : skeleton landing-style pendant loading (rectangles `bg-[#1E1E1E] animate-pulse`), pas de spinner
- `MyBetsOnMatch` : signal d'erreur soft si l'API back est down ("Showing on-chain data — full history unavailable")

#### Lot 8 — Tests (S)
- Unit : `FOOTBALL_MARKETS`, `fmtSelectionByMarket`, `correctScoreEncoding`, `marketState` helpers, `isFootballMatch`.
- Smoke : poser une bet WINNER USDC → success panel s'affiche → tab `My Bet (1)` apparaît automatiquement → claim après resolveMarket fonctionne.
- Cas limites : market `Suspended` (CTA bloqué + message), market `Cancelled` (claim refund OK), market avec odds mises à jour pendant le dialog, contrat basket rendu (placeholder visible, aucun crash).

---

## 4. Règles d'or pour ton plan

- **Scope strict football.** Aucun composant `Picks/Basketball*`, aucune entrée basket dans les domain catalogs, aucun lot dédié basket. Si tu identifies du code basket à créer, déplace-le dans une section "Hors scope" en fin de plan.
- **Le contrat `BasketballMatch` n'est pas modifié.** Les hooks wagmi générés `useBasketballMatch*` ne sont pas utilisés par ce lot mais ne sont pas supprimés non plus (ils restent dans `lib/contracts/generated.ts`).
- **Ne touche pas aux contrats Solidity.** Si tu identifies un manque côté contrat (ex : "il faudrait un `getAllUserBetsForMatch(user)` agrégé"), signale-le comme "blocker → contract change required" sans le coder. Pour le scope actuel, l'API `useBettingMatchReadGetUserBets(matchAddress, marketId, user)` × `marketCount` itérations est OK (max ~6 markets par match football).
- **Aucune nouvelle dépendance** (`framer-motion`, `sonner`, `recharts`, `lucide-react` déjà installés).
- **Logique pure dans `lib/contracts/markets/`** ou `components/features/*/domain/`. Les composants restent stateless quand possible.
- **TS strict, zéro `any`.** Types depuis `@chiliztv/shared/dto/*` ou créés dans `lib/contracts/markets/types.ts`.
- **Pas de doublons** : `MARKET_TYPE_HASH_TO_KEY`, `MARKET_META`, `getOutcomes`, `fmtSelection` doivent **fusionner** dans un seul module au Lot 1 et être consommés partout.
- **Respect du langage landing** (couleurs, typo, eyebrow rouge, bento) — pas de bleu, pas de Lexend, pas de gradient gris.
- **A11y** : `aria-label` sur les boutons icon-only, `focus-visible:ring-2 focus-visible:ring-[#E8001D]`.
- **Server vs client** : seuls les composants qui consomment des hooks sont `"use client"`.

## 5. Format de livraison

```
# Plan d'implémentation complète des paris (football)

## Synthèse exécutive
3-5 lignes

## Décisions à valider par l'humain
- D1 — encoding `CORRECT_SCORE` (proposition : home*10+away, à valider avec admin)
- D2 — `FIRST_SCORER` simplification (Home/Away/None vs vrai mapping player IDs)
- D3 — fallback on-chain `MyBetsOnMatch` quand API down (iterate or just banner)
- D4 — déplacer ou supprimer le `Schedule` actuel
- D5 — placeholder basket "Coming soon" : composant partagé ou inline ?
- …

## Lots ordonnés
### Lot 1 — Football market catalog (S)
**Objectif** : …
**Fichiers** : créés / modifiés / supprimés
**Sous-tâches** : 1. …
**Hooks utilisés** : …
**Risques** : …
**Vérifications** : …

### Lot 2 — …
…

## Tableau des risques
| Risque | Proba | Impact | Mitigation |

## Hors scope (basket)
- À implémenter quand on ouvrira le pari basket : reproduire Lots 1-7 avec un module `BASKETBALL_MARKETS` parallèle, picks dédiés (TOTAL_POINTS, SPREAD, QUARTER_WINNER, FIRST_TO_SCORE, HIGHEST_QUARTER, WINNER 2-col), et un dispatch sport-aware dans le shell `BetDialog`.

## Annexes
- A. Mapping complet `bytes32` → market spec football (label, outcomes générateur, line scaling)
- B. Hooks wagmi à utiliser, regroupés par feature
- C. Schéma exact du `BetSuccessStep` (état + transitions)
```

Pas de code dans le plan. Pseudo-code OK pour clarifier un algo (≤ 10 lignes).

## 6. Pour démarrer

Lis dans cet ordre, puis produis ton plan :

1. `apps/smart-contracts/chiliz-tv/src/betting/FootballMatch.sol` (markets + maxSelections)
2. `apps/smart-contracts/chiliz-tv/src/betting/BettingMatch.sol` (lifecycle, claim, claimRefund, claimAll, getUserBets)
3. `apps/smart-contracts/chiliz-tv/src/betting/BettingMatchFactory.sol` — comment lire `getSportType(contractAddress)` pour la garde basket
4. `apps/frontend/components/live/MatchMarketsList.tsx` (current implementation)
5. `apps/frontend/components/live/MarketBetDialog.tsx` (current dialog, ~752 lines)
6. `apps/frontend/components/live/AboutLiveSection.tsx` (tabs Markets/Schedule)
7. `apps/frontend/components/live/StreamerSchedule.tsx` (à euthanasier)
8. `apps/frontend/components/features/dashboard/domain/bets.ts` + `sections/MyBetsSection.tsx` + `components/BetRow.tsx`
9. `apps/frontend/components/features/dashboard/hooks/useMyBets.ts`
10. `apps/frontend/lib/contracts/generated.ts` — chercher les hooks watch (`useBettingMatchWatch{Payout,Refund,OddsUpdated,MarketResolved,MarketStateChanged}`) et `useBettingMatchFactoryReadGetSportType`

Si tu identifies un point que je n'ai **pas** prévu, ajoute un lot. Si un lot te semble inutile, supprime-le et explique pourquoi. **Trois pages max** sans les annexes.

Fais le plan. Pas de code.
