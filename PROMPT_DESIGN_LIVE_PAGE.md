# Prompt — Refonte UI de la page `/live/[id]` (Claude Design)

> À coller à Claude Design. Le but : **refaire le design** de la page live (`app/live/[...id]/page.tsx` → `LiveDetailsPage`) sans changer l'architecture macro. On **garde** : video au centre, chat à droite (desktop) / en bas (mobile), markets sous la video. Ce qu'on refait : la **chrome** autour du player, le **bouton Browse streams**, le **panneau qui s'ouvre quand on clique** dessus, le **bouton Go live (Start stream)** et **son panneau ouvert**. Le tout dans le langage landing (`#0A0A0A`, accent `#E8001D`, Barlow Condensed + JetBrains Mono).

---

## 1. Charte visuelle (rappel concentré)

```
Couleurs
  bg-page         #0A0A0A
  bg-card-1       #111
  bg-card-2       #141414
  bg-elevated     #1A1A1A
  border-subtle   #1E1E1E
  border-default  #2A2A2A
  border-hover    #3A3A3A
  accent-red      #E8001D
  red-hover       #FF1737
  red-dark        #B0001A
  red-tint        rgba(232,0,29,0.08)
  green-pnl       #2dd4a4
  gold            #F5C518
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
```

**Composants à réutiliser (ne pas dupliquer)** :
- `MatchScoreDisplay` (existant) — header score teams + status
- `VideoPlayer` (existant) — lecteur HLS / aspect-video bg-black
- `ChatPanel` (existant) — pas touché ici
- `MatchMarketsList` + `MyBetsOnMatch` (Lots de pari en cours) — pas touchés non plus, intégrés via `AboutLiveSection` existant
- `NetworkGuard` — pour les actions on-chain

---

## 2. État actuel — diagnostic

Route : `app/live/[...id]/page.tsx` → `<LiveDetailsPage id={id} />`
Fichier principal : `apps/frontend/components/live/LiveDetailsPage.tsx` (~410 lignes)

### Layout actuel

```
[Header global du site]
┌──────────────────────────────────────┬──────────────┐
│ [← Back] [MatchScoreDisplay]          │ ┌─ ribbon ─┐ │
├──────────────────────────────────────┤ │ rouge 2px │ │
│ [Browse streams ▼]  [Go live ▼]       │ ├──────────┤ │
│  (chips horizontales)                  │ │          │ │
├──────────────────────────────────────┤ │ ChatPanel│ │
│ ┌──────────────────────────────────┐ │ │          │ │
│ │   Video player aspect-video       │ │ │ (sticky  │ │
│ │   ou preview streamer             │ │ │  desktop)│ │
│ └──────────────────────────────────┘ │ │          │ │
│                                       │ │          │ │
│ [AboutLiveSection]                     │ │          │ │
│  - streamer row (avatar, follow CTA)  │ │          │ │
│  - tabs Markets / Schedule            │ │          │ │
│                                       │ │          │ │
│ [Mobile chat sous le live, hidden md]│ │          │ │
└──────────────────────────────────────┴──────────────┘
```

### Pourquoi ça ne va pas

| Symptôme | Détail |
|---|---|
| **Browse streams + Go live empilés en chips horizontales** | Lignes 251-275 de `LiveDetailsPage.tsx`. Une chip rouge plein largeur "Go live" + une chip ghost "Browse streams" → hiérarchie cassée. Le user expérience du live est : pour découvrir un stream, il faut cliquer la chip puis attendre que `StreamSelector` (Card shadcn brut, `bg-zinc-900 border-zinc-800`) s'expanse en-dessous des chips, **au-dessus** de la video. La video se déplace vers le bas, layout shift. |
| **`StreamSelector` style legacy** | `bg-zinc-900 border-zinc-800`, boutons shadcn `bg-blue-600 hover:bg-blue-700` (bleu). Texte `text-gray-400`. Aucune trace du langage landing. Refresh icon `Loader2` blue-400. |
| **`StreamManager` collapsible bouton "Go live"** | Quand on clique, le composant `StreamManager` (665 lignes, OBS setup) s'ouvre **sous** les chips, déplaçant la video vers le bas. Le panneau OBS est dense, plein de copy-pastes RTMP keys, mais sans mise en forme bento ni hiérarchie. |
| **Streamer row dans `AboutLiveSection`** | OK mais le bouton "Donate / Subscribe / Follow" est entassé à droite, parfois 4 boutons côte à côte. |
| **Loading state** | `<div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: "#E8001D" }}>` — spinner old-school sur fond noir. À remplacer par skeleton landing. |
| **Mobile ribbon rouge gradient** desktop only | Le sidebar chat desktop a une barre rouge `linear-gradient(90deg, #E8001D 0%, transparent 60%)` en haut. Cool mais cassée sur mobile (le chat passe sous la video, le ribbon disparaît). |
| **Header bar Back-button + match score** | Le bouton retour `← Back to /live` (bouton 8×8 rond, icon ArrowLeft) — `/live` n'existe plus si on a appliqué le merge précédent (redirige `/browse`). Le label "Back to live matches" est obsolète, à corriger en "Back to discover" → `/browse`. |

---

## 3. Layout cible

**On garde la structure macro** (video au centre, chat à droite desktop / en bas mobile, markets sous la video). On **refait** la chrome.

### Desktop (≥ 1024px)

```
[Header global]
┌──────────────────────────────────────────┬─────────────────────┐
│ ┌─ HERO STRIP ─────────────────────────┐ │ ┌─ Live ribbon ──┐  │
│ │ [Eyebrow rouge: League · Live · Min] │ │ │ ▌ Live chat    │  │  font-mono-ctv
│ │ [MatchScoreDisplay XL]                │ │ │ N viewers     │  │
│ │ [← Back to discover]                  │ │ │ ─────────────  │  │
│ └────────────────────────────────────┘ │ │                  │  │
│                                          │ │   ChatPanel      │  │  height: 100dvh
│ ┌─ STREAM SHELF (sticky over video) ──┐ │ │   (existing)     │  │  - 72 - hero
│ │ [📡 Now watching: @Streamer42]       │ │ │                  │  │
│ │ [Switch streams ⇋]   [Go live 🔴]    │ │ │                  │  │
│ │      └─ chips landing-style ──┘      │ │ │                  │  │
│ └─────────────────────────────────────┘ │ │                  │  │
│                                          │ │                  │  │
│ ┌─ VIDEO PLAYER (16:9) ───────────────┐ │ │                  │  │
│ │                                       │ │ │                  │  │
│ │   live HLS or preview                 │ │ │                  │  │
│ │                                       │ │ │                  │  │
│ │  [LIVE pill bottom-left]              │ │ │                  │  │
│ │  [N viewers bottom-right]             │ │ │                  │  │
│ └──────────────────────────────────────┘ │ │                  │  │
│                                          │ │                  │  │
│ ┌─ STREAMER STRIP ────────────────────┐ │ │                  │  │
│ │ [Avatar] @Streamer42  · Title         │ │ │                  │  │
│ │ [Follow] [Tip in CHZ] [Subscribe]     │ │ │                  │  │
│ └─────────────────────────────────────┘ │ │                  │  │
│                                          │ │                  │  │
│ ┌─ ABOUT LIVE / MARKETS ──────────────┐ │ │                  │  │
│ │ Tabs: [Markets] [My Bet (3)]         │ │ │                  │  │
│ │   └─ MatchMarketsList                │ │ │                  │  │
│ │   └─ MyBetsOnMatch                   │ │ │                  │  │
│ └─────────────────────────────────────┘ │ └──────────────────┘  │
└──────────────────────────────────────────┴─────────────────────┘
```

### Mobile (< 1024px)

Stack vertical :
1. Hero strip compact (eyebrow + score + back)
2. Stream shelf compact (streamer name + 2 boutons)
3. Video player 16:9
4. Streamer strip
5. Tabs Markets / My Bet (sticky tabs)
6. Chat fullwidth (collapsible — bouton "Open chat" qui ouvre un sheet bottom-up plein écran)

---

## 4. Refonte composant par composant

### 4.1 — `LiveHero` (NOUVEAU, remplace le header bar actuel)

Header sous le `<Header />` global. Pleine largeur, padding `px-6 sm:px-10 py-5`.

```
┌─────────────────────────────────────────────────────────────────┐
│ ▌ Premier League · LIVE · 67'                                    │  eyebrow
│                                                                  │
│  ←  BAYERN MUNICH  2 — 1  BARCELONA                              │
│      [logo H]            [logo A]                                │  Barlow 56-72px
│                                                                  │
│  [ Back to discover ]                                            │  ghost CTA
└─────────────────────────────────────────────────────────────────┘
                                                  border-bottom #1E1E1E
```

- **Eyebrow** : `font-mono-ctv text-[10px] uppercase tracking-[0.16em]` rouge avec barre + nom de la ligue + statut + minute (si live)
- **Score** : `MatchScoreDisplay` existant (déjà bien stylé), juste l'envelopper dans le hero
- **Back** : ghost button mono uppercase "Back to discover" → `router.push('/browse')`. Plus de `/live` (cf. décisions précédentes).
- Couleur de fond : `#0A0A0A` (transparent sur le fond page)

Si match `Resolved` ou `FT` : status pill mono "FULL TIME" gris à droite du score.
Si match `NS` (upcoming) : countdown "Kickoff in 14m" gold `#F5C518`.

### 4.2 — `StreamShelf` (NOUVEAU — la zone sticky avec les boutons)

C'est **le composant clé du brief**. Aujourd'hui c'est 2 chips empilées en haut, qui poussent la video. On veut une **shelf horizontale sticky** au-dessus de la video, qui contient :

```
┌─ Stream shelf ─────────────────────────────────────────────────┐
│ ┌─ left: now watching ──────────────┐   ┌─ right: actions ──┐  │
│ │ ▌ Now watching                     │   │ [Switch streams] │  │
│ │ [Avatar 28] @Streamer42  · 4.8K 👁 │   │ [Go live]        │  │
│ └────────────────────────────────────┘   └──────────────────┘  │
└────────────────────────────────────────────────────────────────┘
   bg #111, border #1E1E1E, rounded-lg, sticky top-[72px], z-30
```

Détails :
- **Left side** :
  - Eyebrow `▌ Now watching` (mono-ctv 10px rouge avec barre)
  - Avatar 28×28 rond de l'avatar streamer (initiale + dégradé déterministe sur address, **pas d'Unsplash**)
  - `@streamerName` en `font-display text-[15px] uppercase`
  - Séparateur `·` text-white/30
  - Viewers `4.8K 👁` en `font-mono-ctv text-[11px] text-white/45` (lucide `Eye` size 11)
  - Si pas de stream sélectionné : "▌ No stream selected" + texte "Pick a streamer to watch this match"
- **Right side** :
  - **Switch streams** — bouton ghost border `#2A2A2A` hover `#E8001D`. Icone `lucide:Repeat2` (chevron flèches inversées). Label `font-mono-ctv text-[11px] uppercase tracking-[0.14em]`. **Différent de l'actuel "Browse streams"** — sémantiquement plus clair : si l'utilisateur regarde déjà un stream, c'est pour switch, pas pour découvrir.
  - **Go live** — bouton primaire rouge `#E8001D` avec icone `lucide:Video`. Texte mono uppercase "Go live". Sur état "is streaming" → bascule en `border-[#E8001D] bg-[rgba(232,0,29,0.12)] text-[#E8001D]` avec icone `lucide:Square` et label "End stream".

**Sticky behavior** : `position: sticky; top: 72px` (sous le `<Header />` global, hauteur ~72px). Reste visible quand on scrolle vers les markets en bas.

**Mobile** : la shelf devient une rangée horizontale scrollable si étroite, ou compacte avec icônes seules + tooltip. Pas de breakage layout.

### 4.3 — `StreamSwitcherSheet` (NOUVEAU, remplace l'expand `BrowseLivesCollapsible` + `StreamSelector`)

Aujourd'hui : click "Browse streams" → expand sous les chips, layout shift, video poussée vers le bas. **Mauvais.**

**Cible** : click "Switch streams" → ouvre une **sheet/dialog modale** par-dessus la video, listing les streams disponibles.

Layout dialog (`max-w-[640px]`, `max-h-[80dvh]`, overlay `bg-black/70 backdrop-blur`) :

```
┌─ Sheet ─────────────────────────────────────────────────┐
│ ▌ Available streams · 7 live                       [✕]  │  header
│                                                          │
│ ┌─ stream card 1 (currently watching, highlighted) ────┐│
│ │ [Thumbnail 16:9 small 96×54] [pulse rouge LIVE]      ││
│ │ @Streamer42  · 4.8K viewers                          ││  active border #E8001D
│ │ "PSG vs OM — chill vibes"                            ││
│ │ [● Watching]                                          ││  badge actif
│ └──────────────────────────────────────────────────────┘│
│ ┌─ stream card 2 ───────────────────────────────────────┐│
│ │ [Thumbnail] @StreamerKing  · 2.1K viewers            ││
│ │ "Live tactical analysis"                             ││
│ │ [Switch →]                                            ││  CTA primaire compact
│ └──────────────────────────────────────────────────────┘│
│ ┌─ Your stream (badge OWN) ─────────────────────────────┐│
│ │ [Thumbnail] @you (You)  · starting…                  ││
│ │ [Resume]                                              ││
│ └──────────────────────────────────────────────────────┘│
│                                                          │
│ Refreshes every 5s · refresh count discreet en bas       │
└─────────────────────────────────────────────────────────┘
```

Détails :
- Eyebrow header rouge "Available streams · N live"
- Chaque card stream : thumbnail 16:9 96×54 (preview Cloudflare ou gradient déterministe si pas de thumb), nom streamer en `font-display 15px`, viewers + titre stream en `font-mono-ctv 11px` + sans-serif body
- Status badges :
  - **Active (currently watching)** : badge `[● Watching]` mono rouge, card border `#E8001D`
  - **Own stream** (created/live by current user) : badge `[OWN]` mono or, card border or `#F5C518`
  - **Other live** : pas de badge, CTA "Switch →" rouge à droite
- Empty state : "No one is streaming this match yet" + CTA "Be the first — Go live →" qui ferme la sheet et ouvre `StartStreamSheet` (cf. 4.4)
- Loading initial : 3 skeletons cards `bg-[#1E1E1E] animate-pulse rounded-lg h-[88px]`
- Refresh discret bas-droite : `[⟳ Auto-refresh · 5s]` mono `text-white/45`

Click sur une card non active → ferme la sheet + appelle `onStreamSelect(stream)` → la video swap.

### 4.4 — `StartStreamSheet` (NOUVEAU, remplace l'expand `StartStreamCollapsible` + `StreamManager`)

Aujourd'hui : click "Go live" → expand sous les chips, layout shift, panneau OBS dense sous la video. **Mauvais.**

**Cible** : click "Go live" → ouvre une **sheet/dialog modale** par-dessus la video. Cette sheet contient le `StreamManager` (665 lignes) restylé.

Le `StreamManager` actuel gère :
- Le choix entre **stream WebRTC navigateur** et **stream OBS RTMP**
- L'OBS setup avec server URL + stream key + bouton "Copy"
- La preview WebRTC
- Le `Go live` final qui crée le stream côté back

Layout proposé pour la sheet (`max-w-[720px]` parce que le contenu est dense) :

```
┌─ Sheet "Go live" ──────────────────────────────────────────┐
│ ▌ Stream this match · On-chain                       [✕]    │
│ Title: Bayern vs Barcelona · Premier League · 2-1            │
│                                                              │
│ ┌─ Step 1 — Pick your setup ────────────────────────────┐   │
│ │ ┌──────────────────┐ ┌──────────────────┐              │   │
│ │ │ Browser studio   │ │ OBS / external  │              │   │
│ │ │ Camera + mic     │ │ RTMP server      │              │   │
│ │ │ One-click start  │ │ Pro setup        │              │   │
│ │ │ [Use this →]     │ │ [Use this →]     │              │   │
│ │ └──────────────────┘ └──────────────────┘              │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌─ Step 2 — Configure (varies par setup) ───────────────┐   │
│ │  (Browser studio:)                                      │   │
│ │   - Camera preview (live thumbnail)                    │   │
│ │   - Mic level meter                                    │   │
│ │   - Stream title input                                 │   │
│ │                                                          │   │
│ │  (OBS:)                                                 │   │
│ │   - Server URL  ┌──────────┐ [Copy]                    │   │
│ │   - Stream key  ┌──────────┐ [Copy] [Reveal]           │   │
│ │   - Stream title input                                 │   │
│ │   - Start your OBS, then click Go live                 │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                              │
│  ⓘ Subscriptions go to your StreamWallet on-chain. Your     │
│    keys, your revenue.                                       │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  Go live  →                                             │ │  CTA primaire rouge
│ └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

Détails :
- Header eyebrow rouge "Stream this match · On-chain" + titre `font-display 24px` du match
- 2 étapes visibles, séparées par une bordure subtile
- Cards setup : bento `border #1E1E1E p-6 rounded-xl`, hover `border #2A2A2A`. Active : `border #E8001D bg-[rgba(232,0,29,0.06)]`
- Inputs : style cohérent avec `PoolDepositDialog` (font-mono, border `#2A2A2A`, placeholder `text-white/45`)
- Boutons "Copy" / "Reveal" mini en `font-mono-ctv 10px` style mini-pill
- Footer info eyebrow gold `▌ Subs go to your StreamWallet` (rappel valeur produit)
- CTA final "Go live" rouge plein largeur, désactivé tant que la config est incomplète
- Loading on submit : spinner inline + label "Creating your stream…"

Une fois le stream créé :
- La sheet **se ferme automatiquement**
- Le `StreamShelf` (4.2) bascule sur l'état "End stream" rouge
- Dans le bloc video du parent, la preview WebRTC s'affiche via le `portalTarget` existant (ne pas casser ce flux)

### 4.5 — `StreamerStrip` (refonte — actuellement dans `AboutLiveSection.tsx` lignes 77-172)

Aujourd'hui : avatar + nom + boutons follow/donate/subscribe en ligne.

**Cible** : carte horizontale propre.

```
┌──────────────────────────────────────────────────────────────────┐
│ ┌────┐                                                            │
│ │ 🎮 │  @Streamer42                  4.8K viewers · 230 followers │
│ └────┘  "PSG vs OM — chill vibes"                                  │
│                                                                    │
│        [Follow ♥]  [Tip in CHZ]  [Subscribe — 5 USDC/mo]          │
└──────────────────────────────────────────────────────────────────┘
   bg #111, border #1E1E1E, rounded-xl, p-5
```

Détails :
- Avatar 48×48 rond, déterministe (pas d'Unsplash)
- `@streamername` en `font-display 18px`
- Title du stream en `font-mono-ctv 11px text-white/65`
- Stats viewers + followers en `font-mono-ctv 10px text-white/45`
- 3 CTAs en bas, gap 8px :
  - **Follow** : ghost border `#2A2A2A` avec coeur. Active : border `#E8001D` rempli rouge, label "Following"
  - **Tip in CHZ** : ghost
  - **Subscribe — N USDC/mo** : ghost or `border-[#F5C518] text-[#F5C518] hover:bg-[#F5C518]/10`

Si pas de stream sélectionné : empty state inline `eyebrow rouge "No stream selected — pick one to interact"`. Aucune row streamer.

Si l'utilisateur regarde son **propre** stream : les CTAs Follow/Tip/Subscribe disparaissent (cohérent avec `hideStreamerActions={isOwnSelectedStream}` actuel).

### 4.6 — `AboutLiveSection` tabs (cohérence avec lots paris en cours)

Tabs sticky sous la `StreamerStrip` :

```
┌────────────────────────────────────────────────────────────┐
│ [ Markets ]  [ My Bet (3) ]                                 │
│ ─────────                                                    │
│  pills mono uppercase, active = border-[#E8001D] bg rouge tint
│                                                              │
│ {Tab content : MatchMarketsList ou MyBetsOnMatch}           │
└────────────────────────────────────────────────────────────┘
```

Style cohérent avec la `FilterBar` Discover. Tab `Schedule` **supprimé** (cf. plan paris). Tabs sticky à `top-[72px]` sur mobile pour que le user sache où il est en scrollant.

### 4.7 — Chat sidebar (desktop) / drawer (mobile)

**Desktop** : pas de refonte majeure du `ChatPanel` lui-même (existant). Juste corriger :
- Le ribbon rouge `linear-gradient(90deg, #E8001D 0%, transparent 60%)` en haut → garder mais l'élargir à 4px et l'ajouter aussi à gauche pour signaler "live"
- Hauteur : `h-[calc(100dvh - 72px - hero_height)]` avec scroll interne — éviter que le chat dépasse en bas
- Border-left : `1px solid #1E1E1E`

**Mobile** : aujourd'hui le chat est en bloc fixe sous le live (`min(70dvh, 640px)`). **Cible** : un bouton flottant `[💬 Live chat · 12 new]` en bas-droite qui ouvre une **bottom-sheet** plein écran. Quand fermé, plus de bloc chat sous la video — le user voit direct les markets.

Détails du bouton flottant :
- Position fixed bottom-right, `bottom: 24px right: 24px z-50`
- Bento rouge `bg-[#E8001D] hover:bg-[#FF1737]`, ombre `0 8px 32px rgba(232,0,29,0.25)`
- Icone `lucide:MessageCircle` 18px
- Pastille compteur (badge mono) si nouveaux messages
- Click → bottom-sheet 90dvh avec `ChatPanel` dedans
- Le bouton flottant disparaît si la sheet est ouverte

### 4.8 — Loading state (refonte)

Actuel : spinner rouge centré 8×8 `border-b-2`.

**Cible** : skeleton landing — 3 blocs `bg-[#1E1E1E] animate-pulse rounded-xl` empilés :
1. Hero skeleton (height 120)
2. Video skeleton aspect-video (height ~360)
3. Streamer + tabs skeleton (height 160)

Pas de spinner, pas de texte "Loading match…".

### 4.9 — Empty / Error states

| State | UI |
|---|---|
| **No on-chain match deployed yet** (test match `999999`) | Carte centrée bento rouge avec eyebrow `▌ No on-chain match`, titre `Coming soon` 28px, lead "/live/999999 binds to factory.getAllMatches().at(-1). Create a match in /admin first." + CTA "Open /admin" |
| **No match found** (404) | Carte centrée même style, titre `Match not found` + CTA "Back to discover" → `/browse` |
| **Pas de stream** sélectionné | Video player rendre une **vue intermédiaire** : icone `lucide:Tv` 64px gris au centre, eyebrow rouge "Pick a stream", lead "Choose from N live streams below or start your own.", 2 CTAs "Switch streams" + "Go live" |

---

## 5. Architecture cible

```
components/live/
├── LiveDetailsPage.tsx                  ← shell orchestrateur (refondu, ~250 lignes max)
├── sections/
│   ├── LiveHero.tsx                     ← NOUVEAU (4.1)
│   ├── StreamShelf.tsx                  ← NOUVEAU (4.2) — sticky shelf au-dessus de la video
│   ├── StreamPlayer.tsx                 ← wrapper VideoPlayer + empty state intermédiaire (4.9)
│   ├── StreamerStrip.tsx                ← NOUVEAU (4.5) — extrait de AboutLiveSection
│   └── AboutLiveTabs.tsx                ← NOUVEAU — tabs Markets / My Bet, contient les 2 lists
├── sheets/
│   ├── StreamSwitcherSheet.tsx          ← NOUVEAU (4.3) — remplace BrowseLivesCollapsible
│   └── StartStreamSheet.tsx             ← NOUVEAU (4.4) — remplace StartStreamCollapsible
├── components/
│   ├── StreamCardItem.tsx               ← NOUVEAU — row dans la sheet switcher
│   ├── StreamerAvatar.tsx               ← NOUVEAU — avatar déterministe (initiale + dégradé)
│   ├── ChatFloatingButton.tsx           ← NOUVEAU (4.7 mobile)
│   └── states/{LoadingSkeleton,EmptyState,ErrorState}.tsx
├── chat/                                ← INTACT (existing)
└── (composants legacy à supprimer)
    ├── BrowseLivesCollapsible.tsx       ← retiré, remplacé par StreamSwitcherSheet
    ├── StartStreamCollapsible.tsx       ← retiré, remplacé par StartStreamSheet
    ├── StreamerSchedule.tsx             ← retiré (déjà acté dans le plan paris — D4)
    └── AboutLiveSection.tsx             ← retiré, splitté en StreamerStrip + AboutLiveTabs
```

`StreamSelector.tsx` et `StreamManager.tsx` peuvent être conservés temporairement comme dépendances internes des nouvelles sheets, mais leur **JSX** doit être réécrit en langage landing (pas de `bg-zinc-900 border-zinc-800`, pas de `bg-blue-600`).

---

## 6. Règles de qualité (non-négociables)

- **Garder la structure macro du brief** : video haut/centre, chat à droite (desktop) / bouton flottant (mobile), markets en bas. Ne pas réinventer le flow.
- **TS strict, zéro `any`.** Types depuis `@/models/stream.model` et `@chiliztv/shared/dto/*`.
- **Composants présentation stateless** ; le state vit dans `LiveDetailsPage` ou des hooks dédiés.
- **Aucune nouvelle dépendance** — `framer-motion`, `lucide-react`, `radix-ui` (Dialog) déjà installés.
- **Réutiliser** `MatchScoreDisplay`, `VideoPlayer`, `ChatPanel`, `MatchMarketsList`, `MyBetsOnMatch`, `StreamWalletButton`, `StreamSubscriptionButton`, `NetworkGuard` — ne pas les remplacer.
- **Server vs client** : `app/live/[...id]/page.tsx` reste server. `LiveDetailsPage` est `"use client"`.
- **A11y** : `aria-label` sur les boutons icon-only (Switch streams, Go live, ChatFloatingButton). Modales avec `role="dialog"` `aria-modal="true"`. Trap focus dans les sheets.
- **Aucun avatar Unsplash** — `StreamerAvatar` génère un dégradé déterministe à partir de `streamerId` ou `walletAddress` (cf. pattern `StreamCard` Discover).
- **Respect strict du langage landing** : couleurs hex listées §1, typo `font-display` + `font-mono-ctv`, eyebrow rouge avec barre, bento `rounded-xl border bg-[#111]`. Aucun `bg-zinc-*`, aucun `bg-gray-*`, aucun `bg-blue-*`, aucun `bg-emerald-*` legacy.
- **Sticky comportements** : `StreamShelf` sticky `top-72px z-30`, `AboutLiveTabs` sticky `top-152px z-20` (pour rester visibles en scroll), `ChatFloatingButton` mobile `fixed bottom-6 right-6 z-50`.
- **`/live` index** : le bouton "Back" pointe vers `/browse` (le `/live` d'index a été supprimé / redirigé dans le merge précédent).

---

## 7. Tests à valider

```bash
pnpm -F @chiliztv.com/frontend type-check
pnpm -F @chiliztv.com/frontend lint
pnpm -F @chiliztv.com/frontend build
```

Manuellement :

- **Sans wallet connecté** → page rendue, video lit le stream sélectionné automatiquement par `StreamSelector`, chat visible mais composer désactivé "Connect your wallet to chat".
- **Click "Switch streams"** → sheet s'ouvre par-dessus la video (pas de layout shift), liste des streams disponibles, click sur un stream ferme la sheet et swap la video.
- **Click "Go live"** → sheet s'ouvre, choix Browser/OBS, formulaire restylé, submit → sheet se ferme + bouton bascule en "End stream" rouge inverted.
- **Click "End stream"** → confirme via dialog mini ("End your stream now? Viewers will disconnect."), tx complete, bouton revient en "Go live" rouge.
- **Place a bet** → ouvre `MarketBetDialog` (refondu dans le lot paris), success → tab `My Bet (1)` apparaît.
- **Chat mobile** → bouton flottant en bas-droite, click ouvre bottom-sheet plein écran, bouton X dans le header de la sheet ferme.
- **Aucun layout shift** quand on ouvre une sheet (overlay correct, video reste figée derrière).
- **`prefers-reduced-motion`** : pas d'animation chevron rotation, pas de transition height des sheets (apparition/disparition simple).
- **Mobile responsive** ≤ 640px : tout le layout passe en stack vertical, hero compact, shelf compacte (icônes + tooltip), pas de débord horizontal.
- `grep -r "bg-zinc-\|bg-gray-\|bg-blue-\|bg-emerald-" components/live/` doit retourner 0 résultats après refonte.

---

## 8. Livrable attendu

1. Refonte des 5 composants section : `LiveHero`, `StreamShelf`, `StreamPlayer`, `StreamerStrip`, `AboutLiveTabs`.
2. 2 nouvelles sheets : `StreamSwitcherSheet`, `StartStreamSheet`.
3. 1 bouton flottant chat mobile : `ChatFloatingButton`.
4. 1 avatar utilitaire : `StreamerAvatar`.
5. 3 states : `LoadingSkeleton`, `EmptyState`, `ErrorState` (landing-style).
6. **Suppression** : `BrowseLivesCollapsible.tsx`, `StartStreamCollapsible.tsx`, `StreamerSchedule.tsx`, `AboutLiveSection.tsx` (splitté). Vérifier `grep -r "BrowseLivesCollapsible\|StartStreamCollapsible\|AboutLiveSection\|StreamerSchedule" components/ app/` retourne 0 résultats hors leurs propres fichiers.
7. Aucun changement dans `packages/`, `apps/backend`, hooks `lib/contracts/generated.ts`, ni dans `VideoPlayer`, `ChatPanel`, `MatchScoreDisplay`, `MatchMarketsList`, `MarketBetDialog` (objets de lots distincts).
8. `pnpm type-check` et `pnpm lint` verts.
9. Commit propre, par exemple :
   `refactor(live): redesign LiveDetailsPage in landing language, replace inline collapsibles with sheets, add floating chat`

---

## 9. Si tu hésites

- Tranche en faveur de **moins de chrome, plus de hiérarchie typo**, comme la landing.
- Si une sheet doit pousser le video (mobile très étroit), préférer un **drawer plein écran** plutôt qu'une expand inline.
- Si un état n'a pas d'illustration claire (ex. "test match without on-chain deploy"), utilise un eyebrow rouge + titre Barlow + CTA — pas de spinner, pas d'icône giant.
- Si tu doutes sur le placement sticky (ex. `StreamShelf` qui couvrirait le score quand on scroll), priorise la **visibilité de la video** : la shelf peut se compacter en scroll, voire se masquer au-delà d'un threshold.
- Les composants `StreamManager` (665 lignes WebRTC) et `StreamSelector` (auto-fetch logic) sont **complexes** — ne réécris pas leur logique, juste leur JSX. Si tu dois extraire des sous-blocs propres, fais-le sans toucher aux hooks `useStream*`.

Bonne refonte 🔴
