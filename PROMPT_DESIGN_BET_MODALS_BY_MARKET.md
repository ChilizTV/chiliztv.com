# Prompt — Design des modales de pari par type de market **Football** (Claude Design)

> À coller à Claude Design. Scope : **football uniquement**. Le but : refaire **chaque modale de pari football** pour qu'elle soit adaptée au type de market sélectionné, dans le langage visuel landing déjà appliqué partout (fond `#0A0A0A`, accent rouge `#E8001D`, typo `Barlow Condensed` + `JetBrains Mono`). Une seule modale `MarketBetDialog` aujourd'hui sert tous les markets — on veut un **shell commun** + des **steps adaptés au type de market**, plus un **panneau de succès** marqué qui confirme le pari.
>
> Le contrat `BasketballMatch` existe et expose ses propres markets (TOTAL_POINTS, SPREAD, etc.), mais **on ne designe rien de basket dans ce lot**. Quand le shell détecte un contrat basket, il rend un placeholder "Coming soon" (cf. §11). Toute variante basket sera traitée dans un lot séparé ultérieur.

---

## 1. Charte visuelle de référence (rappel concentré)

Réutilise ce qui est déjà sur la landing / Discover / Dashboard refondus. **Ne réinvente pas.**

```
Couleurs
  bg-page         #0A0A0A
  bg-card-1       #111
  bg-card-2       #141414
  bg-elevated     #1A1A1A     (interne dialog, sélections survolées)
  border-subtle   #1E1E1E
  border-default  #2A2A2A
  border-hover    #3A3A3A
  accent-red      #E8001D     (CTA, eyebrow, sélection active)
  red-hover       #FF1737
  red-dark        #B0001A
  red-tint        rgba(232,0,29,0.08)
  green-pnl       #2dd4a4     (potential payout, gain réalisé)
  gold            #F5C518     (warning, pause, fee)
  text-primary    #fff
  text-body       rgba(255,255,255,0.65)
  text-meta       rgba(255,255,255,0.45)

Typo
  .font-display   Barlow Condensed, uppercase, tracking serré, 700-800
  .font-mono-ctv  JetBrains Mono, uppercase, letter-spacing 0.14-0.32em

Eyebrow rouge avec barre
  <div class="font-mono-ctv inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8001D]">
    <span aria-hidden class="block h-0.5 w-4 bg-[#E8001D]" />
    Eyebrow
  </div>

CTA primary
  className="rounded-md bg-[#E8001D] px-7 py-4 text-[14px] font-bold uppercase tracking-[0.06em] text-white hover:-translate-y-px hover:bg-[#FF1737]"
  style={{ boxShadow: "0 8px 32px rgba(232,0,29,0.25)" }}

CTA secondary
  className="rounded-md border border-[#2A2A2A] bg-transparent px-7 py-4 text-[14px] font-bold uppercase tracking-[0.06em] text-white hover:border-[#E8001D]"

Bento card
  className="rounded-xl border border-[#1E1E1E] bg-[#111] p-7 hover:border-[#2A2A2A]"
```

---

## 2. Architecture commune — le shell de la modale

Tu construis **un seul wrapper `BetDialog`** qui orchestre 4 étapes consécutives (steps) et un état d'erreur :

```
┌─────────────────────────────────────────────────────────┐
│  [Header sticky]                                    [✕] │
│   ┌─ Eyebrow ────────────────────────────────────────┐  │
│   │ ▌ Football · Premier League                       │  │
│   ├─ Title ──────────────────────────────────────────┤  │
│   │ Bayern Munich vs Barcelona                        │  │  font-display 28-32px
│   ├─ Market name + line ────────────────────────────┤  │
│   │ MATCH RESULT · 1X2                                │  │  mono uppercase
│   └──────────────────────────────────────────────────┘  │
│                                                          │
│  [Step indicator]  ●━━━━━━○━━━━━━○━━━━━━○                │  4 dots, courant rouge
│   1 Pick · 2 Stake · 3 Review · 4 Done                   │  font-mono-ctv 10px
│                                                          │
│  [Step content variable selon market type]              │
│                                                          │
│  [Footer sticky]                                         │
│   [← Back]                  [Continue →]                 │  ou [Confirm bet]
└─────────────────────────────────────────────────────────┘
```

### États globaux
- **`idle`** → step 1 (Pick selection)
- **`step:stake`** → step 2 (Pick token + amount)
- **`step:review`** → step 3 (Review odds, payout, slippage)
- **`step:submitting`** → loading dans le footer + tx pending
- **`step:success`** → step 4 (Bet placed, panneau dédié)
- **`step:error`** → bandeau rouge persistant en haut, step courant repris

### Dimensions
- Largeur desktop : `max-w-[520px]` (cohérent avec `PoolDepositDialog`)
- Mobile : full-width avec `dvh` viewport-based, header + footer sticky
- Hauteur : `max-h-[90dvh]` avec scroll interne sur le content step
- Overlay : `bg-black/70 backdrop-blur-sm`

### Step indicator
4 dots reliés par traits `bg-[#1E1E1E]` (hauteur `h-px`). Dot courant = `bg-[#E8001D] ring-2 ring-[#E8001D]/30`. Dots passés = `bg-[#2dd4a4]`. Dots futurs = `bg-[#2A2A2A]`. Labels en `font-mono-ctv text-[10px] uppercase tracking-[0.14em] text-white/45` sous chaque dot.

---

## 3. Step 1 — "Pick" : design par type de market football

C'est ici que tu **adaptes le rendu** au type de market. Le shell, le header, le footer, les steps 2/3/4 sont communs — seul le rendu de la sélection change.

Pour chaque market football : titre du step, layout des outcomes, copy d'aide.

### 3.1 — `WINNER` (1X2) ou `HALFTIME`

Titre step : "Pick the winner" (ou "Pick the halftime winner" pour HALFTIME)

Layout : **3 colonnes égales**, gap 12px, hauteur ~120px.

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   [Logo H]  │ │             │ │   [Logo A]  │
│             │ │     X       │ │             │
│  BAYERN     │ │   DRAW      │ │  BARCELONA  │
│  MUNICH     │ │             │ │             │
│  ───────    │ │  ───────    │ │  ───────    │
│  ×1.85      │ │  ×3.50      │ │  ×4.20      │
└─────────────┘ └─────────────┘ └─────────────┘
```

Détails :
- Logo équipe : 40×40 rond, fallback initiales sur dégradé déterministe
- Nom équipe : `font-display text-[14px] uppercase`
- Odds : `font-display text-[24px] text-white`
- Bordure idle : `border border-[#2A2A2A]`
- Hover : `border-[#3A3A3A]`
- Active (sélectionné) : `border-[#E8001D] bg-[rgba(232,0,29,0.08)]` + barre rouge en haut `h-0.5 bg-[#E8001D]`
- Indicateur "favorite" si odds < autres : petit badge mono "FAV" en haut-droite

Copy d'aide sous les 3 boutons :
> *"Odds lock at the moment your tx mines. The pool can move them up to ±0.5% by then — you can adjust slippage in step 3."*

### 3.2 — `GOALS_TOTAL` (Over/Under)

Titre step : "Over or Under?"

Layout : **2 boutons larges**, le `line` en gros au centre.

```
┌──────────────────────────────────────────────┐
│                                               │
│              ▲                                │
│             OVER                              │
│            2.5 GOALS                          │
│           ───────                             │
│           ×1.72                               │
│                                               │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│              ▼                                │
│            UNDER                              │
│            2.5 GOALS                          │
│           ───────                             │
│           ×2.10                               │
└──────────────────────────────────────────────┘
```

Détails :
- Icone arrow up/down 24px en haut
- "OVER 2.5 GOALS" en `font-display text-[28px]`
- Odds en `font-display text-[24px]`
- Hauteur ~130px chaque
- Sous-texte d'aide :
  > *"Resolves on full-time goals (90 minutes + injury time). Extra time and penalties excluded."*

### 3.3 — `BOTH_SCORE` (BTTS)

Titre step : "Will both teams score?"

Layout : 2 boutons identiques à GOALS_TOTAL mais labels :
- "YES — both teams score" + odds
- "NO — at least one shut out" + odds

Sous-texte d'aide :
> *"Resolves on full-time score. Extra time excluded."*

### 3.4 — `FIRST_SCORER` (simplifié Home/Away/None)

Titre step : "Who scores first?"

Layout : 3 colonnes (Home / Away / No goal), même style que WINNER mais :
- Home : logo + "BAYERN MUNICH · scores first"
- Away : logo + "BARCELONA · scores first"
- No goal : icône `MinusCircle` + "0-0 AT FULL TIME"
- Odds en `font-display text-[24px]` sous chaque

Sous-texte d'aide :
> *"Simplified market — predicts which team's first goal opens the score. 'No goal' wins on a 0-0 finish."*

> Note dev : si plus tard le contrat expose un mapping `playerId → name`, prévoir une variante avec liste scrollable de joueurs (avec stats : `goals this season`, `last goal vs this team`). Pour l'instant, garder la version simplifiée.

### 3.5 — `CORRECT_SCORE` — **le plus complexe**

Titre step : "Pick the exact final score"

Layout : **grille 6×6 cliquable** (0-0 jusqu'à 5-5), avec scroll vertical si l'admin a configuré plus de scores.

```
       0  1  2  3  4  5
  0  [0-0][0-1][0-2][0-3][0-4][0-5]
  1  [1-0][1-1][1-2][1-3][1-4][1-5]
  2  [2-0][2-1][2-2][2-3][2-4][2-5]
  3  [3-0][3-1][3-2][3-3][3-4][3-5]
  4  [4-0][4-1][4-2][4-3][4-4][4-5]
  5  [5-0][5-1][5-2][5-3][5-4][5-5]
       ↑ Away
       ← Home
```

Chaque cellule :
- 56×56 minimum, font-display text-[16px]
- Affiche le score "1-2"
- Au hover, montre l'odds en bas en `font-mono-ctv text-[10px]`
- Active : `border-[#E8001D] bg-[rgba(232,0,29,0.12)]`
- Diagonale (matches nuls) avec léger fond `bg-[#1A1A1A]` pour aider la lecture
- Si une combinaison n'a pas d'odds configurée par l'admin, cellule grisée + cursor not-allowed

Tooltip sur la cellule sélectionnée : "Bayern 2 — 1 Barcelona · ×8.50"

Légendes "Home" sur l'axe vertical, "Away" sur l'axe horizontal, en `font-mono-ctv text-[10px] text-white/45`.

Encoding (à valider) : selection = `home * 10 + away`.

Sous-texte d'aide :
> *"Hardest market, biggest payout. Resolves on full-time score, regular time only."*

---

## 4. Step 2 — Stake : choix du token + montant

Common à tous les markets. Layout :

```
┌────────────────────────────────────────────┐
│ ▌ Pay with                                  │
│ ┌──────────────────────────────────────┐   │
│ │ [Token icon] USDC          ▼          │   │  click → drawer
│ │ Balance: 1,243.50                     │   │
│ └──────────────────────────────────────┘   │
│                                              │
│ ▌ Amount                                    │
│ ┌──────────────────────────────────────┐   │
│ │  100.00                               │   │  big input
│ │  ≈ $100.00 USDC                       │   │  conversion via Kayen quote
│ └──────────────────────────────────────┘   │
│ [25%] [50%] [75%] [MAX]                    │  pills mono uppercase
│                                              │
│ ▌ Slippage tolerance (non-USDC)            │
│ [0.1%] [0.5% ✓] [1%] [Custom]             │
└────────────────────────────────────────────┘
```

Détails :
- Token selector : USDC en premier, CHZ ensuite, puis fan tokens triés par solde décroissant. Icone fan token = logo officiel. Pas de logos jpg-Unsplash.
- Balance affichée en small mono `text-white/45`
- Si `balance < amount` → input bordé rouge + message "Insufficient balance"
- Big input avec masque pour 2 décimales max si USDC, 4 si fan token (selon `decimals`)
- Pills 25/50/75/MAX en `font-mono-ctv text-[10px]` style FilterBar Discover
- Slippage caché si `token === 'USDC'` (path direct, pas de swap)
- Si non-USDC : afficher la quote Kayen en dessous : "≈ 95.00 USDC after swap (slippage 0.5%)"
- Swap path missing : bandeau rouge "No swap route for this token. Try USDC or CHZ."

### Step 2 errors
- Allowance insufficient (ERC20) : bandeau gold "Approve {SYMBOL} first" + bouton "Approve" inline
- Pool liquidity insufficient : bandeau rouge "Pool too thin for this stake — try a smaller amount or wait for new deposits"

---

## 5. Step 3 — Review : confirmation pré-tx

Layout :

```
┌────────────────────────────────────────────┐
│ ▌ Review your bet                           │
│                                              │
│ ┌──────────────────────────────────────┐   │
│ │ Match    │ Bayern vs Barcelona       │   │
│ │ Market   │ 1X2 — Match result        │   │
│ │ Pick     │ Bayern Munich (Home win)  │   │
│ │ Pay      │ 100.00 USDC               │   │
│ │ Stake    │ 100.00 USDC               │   │  (= Pay si USDC, sinon quote)
│ │ Odds     │ ×1.85                     │   │
│ │ ────────────────────────────         │   │
│ │ Payout   │ $185.00 USDC if it hits   │   │  vert #2dd4a4 BIG
│ │ Profit   │ +$85.00 USDC              │   │  vert #2dd4a4
│ └──────────────────────────────────────┘   │
│                                              │
│  ⓘ Odds lock at submission. Pool may move    │
│    them ±0.5% in the next blocks.            │
└────────────────────────────────────────────┘
```

Détails :
- Tableau key/value en grid 2 colonnes, font-mono key, font-display value
- Payout en `font-display text-[28px] text-[#2dd4a4]`
- Profit en `font-mono text-[14px] text-[#2dd4a4]`
- Footer CTA : `[Confirm bet · 100 USDC]` rouge plein largeur
- Pendant tx pending : CTA spinner + "Submitting..." (mono uppercase)
- Pendant confirming : "Confirming on-chain..."

### Step 3 errors
- Tx rejected by user : bandeau gris "Transaction cancelled. Try again?"
- Tx reverted : bandeau rouge avec error name humanisé (ex. `BetAmountAboveCap` → "Stake exceeds the pool's per-bet cap. Try a smaller amount.")
- Network error : bandeau gold "Network issue — check your wallet and retry"

---

## 6. Step 4 — Success : panneau de confirmation marqué (le plus important)

C'est **la nouveauté principale** du brief. Quand le bet est confirmé, l'utilisateur doit avoir un feedback fort, persistant, et actionnable.

```
┌────────────────────────────────────────────┐
│              [✓ animé rouge]                │  cercle 80px avec check
│                                              │
│   ▌ Bet placed · On-chain · Block 12,401    │  eyebrow rouge mono
│                                              │
│   PREDICTION                                 │
│   PLACED                                     │  font-display 56px uppercase
│                                              │
│ ┌──────────────────────────────────────┐   │
│ │ Match  Bayern vs Barcelona            │   │
│ │ Pick   Bayern Munich · 1X2 Home win   │   │
│ │ Stake  100.00 USDC                    │   │
│ │ Odds   ×1.85 (locked)                 │   │
│ │ ─────────────────────────────         │   │
│ │ Potential                             │   │
│ │ payout                                │   │
│ │ $185.00                               │   │  font-display 64px green
│ │ USDC                                  │   │  small mono green
│ │ +$85.00 net profit if it hits         │   │
│ └──────────────────────────────────────┘   │
│                                              │
│   [View on explorer ↗]   [Indexing… ⏳]     │  links + status
│                                              │
│   ┌──────────────────────────────────┐      │
│   │ Place another bet  →             │      │  CTA primary rouge
│   └──────────────────────────────────┘      │
│   [View my bets]   [Close]                   │  ghost links
│                                              │
│   ⓘ This bet now appears under "My Bet" tab │
│     of this stream and in your dashboard.    │  petite ligne d'aide
└────────────────────────────────────────────┘
```

Détails du panneau success :

1. **Check animé** : cercle 80×80 `border-[#E8001D]` avec un `<path>` SVG de check qui se trace en 400ms (`stroke-dasharray` animation). Pulse subtil après tracing (scale 1 → 1.05 → 1, durée 800ms).
2. **Eyebrow** : "Bet placed · On-chain · Block N" — N = block number du tx (lu via tx receipt).
3. **Titre** : `PREDICTION PLACED` en `font-display text-[56px] font-extrabold uppercase tracking-[-0.02em]` — c'est l'écran de victoire, le titre doit dominer.
4. **Récap bento** : key/value mono avec une **section "Potential payout"** mise en hiérarchie majeure :
   - "Potential" + "payout" sur 2 lignes en `font-mono text-[10px] text-white/45`
   - "$185.00" en `font-display text-[64px] text-[#2dd4a4]`
   - "USDC" sous-texte mono vert
   - "+$85.00 net profit if it hits" en `font-mono text-[12px] text-[#2dd4a4]`
5. **Tx hash + indexing status** :
   - "View on explorer ↗" (lien explorer Chiliz testnet/mainnet selon network)
   - "Indexing…" / "Indexed ✓" pill mono à droite (basé sur `eventConfirmed` = watch BetPlaced filter sur `(user, marketId)`)
6. **CTAs** :
   - **Primary** : `Place another bet →` — rouge plein, scale-down rapide vers 8px de padding pour pas dominer le payout
   - **Ghost** : `View my bets` (navigate `/dashboard#bets` ou ferme + scroll) — souligne au hover
   - **Ghost** : `Close` — gris, ferme la modale
7. **Petite ligne d'aide** : "This bet now appears under My Bet tab of this stream and in your dashboard." en `font-mono-ctv text-[10px] text-white/45` — explique où retrouver le bet.

### Comportement
- **Pas d'auto-close** par défaut. L'utilisateur reste sur le panneau jusqu'à action explicite. Optionnel : countdown discret "auto-close in 30s" en bas, annulable.
- Toast Sonner reste affiché en parallèle (utile si l'user ferme rapidement).
- Si l'user clique `Place another` → reset le dialog au step 1, **garde la sélection token** (commodité).
- Confettis discrets (utiliser `react-confetti` déjà installé) lancés une fois quand on entre dans le success state — durée 2.5s, 80 particules max, palette rouge + blanc + vert pour matcher le thème. Désactivable via `prefers-reduced-motion`.

---

## 7. État erreur (transverse)

Bandeau persistant en haut de la modale, sous le header, au-dessus des steps :

```
┌──────────────────────────────────────────┐
│ ⚠ Bet rejected — odds moved beyond your   │  rouge
│   slippage. Try increasing tolerance to   │
│   1% or pick a different selection.       │
│   [Retry]  [Dismiss]                       │
└──────────────────────────────────────────┘
```

Mapper les viem custom errors aux messages humanisés (cf. annexe D du plan d'intégration des contrats) :
- `BetAmountAboveCap` → "Stake exceeds the pool's per-bet cap. Try a smaller amount."
- `InsufficientFreeBalance` → "Pool too thin for this stake. Try smaller, or wait for new LP deposits."
- `CooldownActive` → (hors bet, c'est LP) — n/a
- `InvalidMarketState` → "Market just closed. Refresh and try a different market."
- `InvalidOddsValue` → "Odds outside accepted range. Wait for next pricing update."
- `AccessControlUnauthorizedAccount` → "Network mismatch — switch to Chiliz Spicy."
- `ZeroAddress` / `ZeroAmount` → "Invalid input. Refresh the dialog."
- Generic fallback : "Something went wrong: {short message}. Try again."

---

## 8. Variantes mobile

- Modale en sheet bottom-up sur mobile (`max-h-[85dvh]`, `rounded-t-3xl rounded-b-none`).
- Step indicator collapsé en barre de progression simple : `[━━━━━━━━━░░░░] Step 2 of 4`.
- Grilles passent en 1-2 colonnes :
  - WINNER 1X2 → 1 colonne (3 lignes empilées Home / Draw / Away)
  - GOALS_TOTAL → 1 colonne (Over puis Under)
  - FIRST_SCORER → 1 colonne (Home / Away / No goal empilés)
  - CORRECT_SCORE → grille 6×6 maintenue mais cellules 44×44, scroll horizontal-vertical avec touch
- Footer sticky avec safe-area-bottom (iOS).
- Drawer sélecteur de token plein écran sur mobile.

---

## 9. Accessibilité

- Modale avec `role="dialog"` `aria-modal="true"` `aria-labelledby={titleId}`.
- Trap focus dans la modale (radix `<Dialog>` le fait déjà).
- ESC ferme avec confirmation si tx in-flight ("Tx pending — close anyway?").
- Tab order : header close → step content → footer back/continue.
- Toutes les sélections (boutons step 1) en `<button>` avec `aria-pressed`.
- Step 4 : focus initial sur le bouton "Place another" pour faciliter le re-pari.
- Contrastes ≥ AA — vert `#2dd4a4` sur fond `#111` est OK ; vérifier les tints rouges sur fond rouge.
- `prefers-reduced-motion` désactive : confetti, check tracing animation, scale pulse, transitions auto.

---

## 10. Garde sport — placeholder basket

Avant de rendre les steps, le shell `BetDialog` lit `factory.getSportType(contractAddress)` via `useBettingMatchFactoryReadGetSportType`.

Si `sportType !== FOOTBALL` (typeof `0`) :

```
┌────────────────────────────────────────────┐
│              [Header sticky]            [✕] │
│   ▌ Basketball · Roadmap                    │  eyebrow rouge mono
│                                              │
│   COMING                                     │
│   SOON                                       │  font-display 56px uppercase
│                                              │
│   Basketball markets are deployed on-chain   │
│   but the betting UI is football-only for    │
│   now. We'll ship spread, total points,      │
│   quarter winners and more in a future drop. │
│                                              │
│   ┌──────────────────────────────────┐      │
│   │ Discover football matches  →     │      │  CTA primary rouge
│   └──────────────────────────────────┘      │
│   [Close]                                    │  ghost
└────────────────────────────────────────────┘
```

Style cohérent avec les autres steps : eyebrow rouge avec barre, titre `font-display` 56px, body `text-white/65`, CTA rouge plein. **Pas de step indicator** dans cet écran (c'est terminal).

Click `Discover football matches` → `router.push('/browse')`. Click `Close` → ferme la modale.

---

## 11. Livrable attendu

Pour Claude Design, le livrable est **un design system de modales football** :

1. **Le shell `BetDialog`** complet (header / step indicator / footer / states erreur / garde sport).
2. **5 variantes du Step 1 "Pick"** — une par market type football :
   - WINNER (3-col)
   - HALFTIME (= WINNER design avec label)
   - GOALS_TOTAL (over/under XL)
   - BOTH_SCORE (yes/no)
   - FIRST_SCORER (3-col simplifié)
   - CORRECT_SCORE (grille 6×6)
3. **Step 2 "Stake"** unique avec gestion token selector + slippage + erreurs.
4. **Step 3 "Review"** unique.
5. **Step 4 "Success"** unique avec animation check + confettis + payout hero.
6. **État erreur** transverse + le mapping des messages.
7. **Placeholder basket "Coming soon"** (cf. §10).
8. **Variantes mobile** pour chacune des 5-6 variantes step 1 + le success step.

Pas de figma ni mockup statique : **livre directement le code React TypeScript** dans `apps/frontend/components/live/bet-dialog/` (nouveau dossier). Refactor de l'existant `MarketBetDialog.tsx` (752 lignes monolithiques) vers cette nouvelle structure :

```
components/live/bet-dialog/
├── BetDialog.tsx                       ← shell, orchestre les steps + garde sport
├── steps/
│   ├── PickStep.tsx                    ← dispatch sur le bon Pick selon market type
│   ├── StakeStep.tsx                   ← token + amount + slippage
│   ├── ReviewStep.tsx                  ← récap pré-tx
│   ├── SuccessStep.tsx                 ← panneau succès + confettis
│   └── ComingSoonStep.tsx              ← garde sport basket → placeholder
├── picks/                              ← un fichier par market type FOOTBALL
│   ├── PickWinner.tsx                  ← WINNER 3-col
│   ├── PickHalftime.tsx                ← réutilise PickWinner avec label
│   ├── PickGoalsTotal.tsx              ← over/under
│   ├── PickBothScore.tsx               ← BTTS yes/no
│   ├── PickFirstScorer.tsx             ← home/away/none
│   └── PickCorrectScore.tsx            ← grille 6×6
├── components/
│   ├── StepIndicator.tsx
│   ├── OutcomeButton.tsx               ← bouton outcome réutilisé partout
│   ├── PayoutPreview.tsx
│   ├── TokenSelector.tsx
│   └── SlippageControl.tsx
└── domain/                             ← purs, testables
    ├── markets.ts                       ← spec catalog FOOTBALL_MARKETS (cf. plan d'implémentation Lot 1)
    ├── outcomes.ts                      ← getOutcomes par market type football
    └── format.ts                        ← fmtSelection, fmtPayout, etc.
```

> ⚠ Pas de dossier `picks/basketball/` ni de `PickSpread`/`PickQuarterWinner`/etc. Tout ce qui est basket sort dans le `ComingSoonStep` jusqu'au lot dédié.

### Règles de qualité (non-négociables)
- TS strict, zéro `any`.
- Logique pure dans `domain/`.
- Composants présentation stateless ; le state vit dans `BetDialog` (orchestrateur) ou dans un hook `useBetFlow`.
- Aucune dépendance ajoutée (`framer-motion`, `react-confetti`, `sonner`, `lucide-react` déjà là).
- Réutilise `useChilizSwapRouter`, `useKayenQuote`, `usePoolDecimals`, `useBettingMatchWatchBetPlaced`, `useBettingMatchFactoryReadGetSportType` — **ne les remplace pas**.
- Imports groupés (1) externes (2) `@chiliztv/*` (3) `@/*` (4) relatifs.
- Aucun avatar Unsplash, aucun gradient `from-[#1a1919]` legacy.
- Respecte le langage landing : couleurs hex listées §1, typo `font-display` + `font-mono-ctv`, eyebrow rouge avec barre.

### Tests à valider
- Wallet connecté Chiliz Spicy + USDC : flow WINNER complet → success.
- Flow CHZ avec swap : quote affichée step 2, slippage modifiable, success.
- Flow ERC20 fan token : approval flow, allowance check.
- Flow CORRECT_SCORE : grille 6×6 cliquable, encoding `home*10+away` envoyé au contrat.
- Flow GOALS_TOTAL : line `25` → "OVER 2.5 GOALS" affiché correctement.
- Flow FIRST_SCORER : 3 outcomes Home/Away/None.
- Erreur `BetAmountAboveCap` : message humanisé clair.
- Garde basket : ouvrir un dialog avec un contrat basket (cas test) → écran "Coming soon" sans crash.
- Mobile sheet bottom-up : tous les steps utilisables.
- `prefers-reduced-motion` : confettis OFF, animations OFF.
- `pnpm type-check` + `pnpm lint` verts.

### Si tu hésites
- Tranche en faveur de **moins de chrome, plus de hiérarchie typo**.
- Si `FIRST_SCORER` 0..255 ne mappe pas à Home/Away/None tel quel (le contrat accepte plus de selections), implémente la version simplifiée Home/Away/None et ajoute un `// TODO(player-mapping): waiting on admin convention` — c'est acté pour ce lot.
- Si `CORRECT_SCORE` n'a pas d'odds configurées pour 36 cellules par défaut, designe une version "compact" 4×4 avec dépassement scrollable.
- Garde `MarketBetDialog.tsx` actuel temporairement pour ne pas casser, mais marque-le `@deprecated` et migre les call-sites au fur et à mesure.

Bonne refonte 🔴
