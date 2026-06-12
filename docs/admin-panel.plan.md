# Plan d'implémentation — Panel admin PredCast (`apps/admin` → admin.predcast.tv)

> **Review PO du 11/06 intégrée — toutes les validations §8 sont actées (GO).** Les décisions sont
> reportées dans les sections concernées et marquées « ✅ acté ». Un préalable bloquant a été identifié :

## ⚠️ Préalable hors plan — hotfix leaderboard (avant tout lot)

Vérification PO : `LeaderboardRewards.sol` déployé en mainnet est en **V2** (`advanceEpoch`/`rolloverEpoch`/`claim` permissionless, scores on-chain — **`closeEpoch` n'existe plus**), alors que `CloseEpochUseCase.ts` embarque un ABI inline `closeEpoch(merkleRoot, claimDuration)`. Le `CloseMonthlyEpochJob` **revertra à sa prochaine exécution** (1ᵉʳ du mois) et le flux merkle CLI est mort.

→ **Hotfix immédiat, hors plan admin** : aligner le backend sur le contrat V2 (ou désactiver le job en attendant), mettre à jour CLAUDE.md §1/§7.13. Le lot 6 du plan admin **consomme le résultat de ce hotfix** (vue Finance epochs) au lieu de l'investiguer.

## Contexte

La plateforme est ouverte au public et le plan modération `docs/signalement-bannissement.plan-v2.md` (tables `reports`/`bans`/`report_actions`/`report_config`, migrations 036/037) part en prod en premier. Son schéma a été conçu forward-compatible avec un back-office (`status/reviewed_*/review_note`, `reversed_*`, `lifted_*`, `quorum_snapshot`). Ce plan crée l'app `apps/admin` (back-office opérateurs) qui **consomme et enrichit** ce système — revue des signalements, levée de ban, restore de message, édition `report_config` — plus les surfaces joueurs/marchés/finance/contrats/analytics/audit, sans rien redonder. Backend partagé (`/admin/*` dans `apps/backend`, DDD strict), RBAC via table `admin_wallets`, actions on-chain signées côté serveur via une abstraction `ISigner` compatible KMS.

---

## 1. Compréhension & écarts (spec PO vs code réel vs plan modération)

Vérifications faites (Étape 0) — écarts confirmés :

| # | Spec PO / CLAUDE.md | Réalité vérifiée | Conséquence |
|---|---|---|---|
| 1 | « Next.js 16 » (spec) vs « Next.js 15 » (CLAUDE.md §2) | **Next 16.2.6** réel (frontend + landing), React 19, Tailwind v4 | La spec a raison ; CLAUDE.md périmé (à corriger, validation §9) |
| 2 | LP/bookmaker caduc | Confirmé : aucun `LiquidityPool`/`BettingMatchFactory`. Contrats réels : `PariMatchFactory`, `StreamWalletFactory`, `ChilizSwapRouter`, `LeaderboardRewards` — **mainnet 88888 déployé le 2026-06-09** (`deployments/chilizMainnet.json`), le front prod est passé mainnet (v1.4.0) | Le panel cible mainnet par défaut, testnet en staging |
| 3 | « TanStack Query, Recharts, Zod, shadcn déjà là » | react-query ✅, zod ✅, primitives Radix dans `packages/ui` ✅ (dont `Table`) — mais **recharts ABSENT** de tous les package.json (CLAUDE.md §7.8 périmé). TanStack Table, react-hook-form, date-fns **absents** aussi | **Zéro nouvelle dépendance au MVP** (cf. §3.3) ; recharts réévalué au lot analytics |
| 4 | `adminLimiter` « éventuel » | **Existe déjà** (`rate-limit.middleware.ts`, 1000/h keyed wallet JWT) mais neutralisé par le kill switch `RATE_LIMIT_DISABLED=true` | Appliquer le flag `bypassKillSwitch` (même mécanique que le `reportsLimiter` du plan modération) |
| 5 | Auth JWT wallet + révocation Redis | Confirmé : `authentication.middleware.ts`, claims `{walletAddress, role, email}`, révocation `auth:revoked:{wallet}`. **Mais** le claim `role` est hardcodé `'USER'` à l'émission — inerte | RBAC = lookup `admin_wallets` (jamais le claim JWT) |
| 6 | KYC + IP/devices (spec d'origine) | **Aucune donnée KYC/IP/device** dans les tables. RGPD : collecter ça pour les users finaux = nouveau traitement injustifié | **Écarté** pour les users. IP/user-agent conservés **uniquement pour les admins** dans `audit_log` (intérêt légitime sécurité, purge 12 mois) |
| 7 | « Treasury claimable vs claimé » + « action treasury claim » | **Faux dans le code** : `PariMatchBase` transfère la company fee à `feeRecipient` **immédiatement au resolve** (idem part leaderboard). Aucun accrual, aucun claim | Surface Finance = **lecture seule** (agrégat des `MarketResolved.fee` indexés) — la « tx signée admin » de la spec est sans objet |
| 8 | « Kill switch global (pause tous les markets) » | Pas de pause cross-contrats on-chain. `emergencyPause()` (PAUSER_ROLE) existe **par contrat** (Pausable) | Kill switch = orchestration off-chain : batch `emergencyPause` sur `factory.getAllMatches()` actifs (cf. §4) |
| 9 | — | **Nonce non coordonné** : API et workers = 2 process Fly distincts signant avec le même `ADMIN_PRIVATE_KEY` (`PariMatchResolutionAdapter` avec nonceManager in-process, `CloseEpochUseCase` sans). `ResolveHalftimeMarketsJob` toutes les 60 s | Risque structurant : le panel ajoute un 3ᵉ écrivain → **lock Redis `lock:admin-wallet:{addr}`** sur tous les chemins de signature (cf. §4) |
| 10 | Leaderboard : `closeEpoch(merkleRoot, claimDuration)` (CLAUDE.md §1/§7.13) | Le source `LeaderboardRewards.sol` est en **V2** : `advanceEpoch`/`claim`/`rolloverEpoch` permissionless, scores on-chain — alors que le backend (`CloseEpochUseCase`, CLI) suit encore le flux merkle | **Écart à réconcilier en lot Finance** (vérifier quel chemin est réellement actif en prod) ; le piège ghost epochs (`leaderboard_epochs.tx_hash` PK, rows `pending`) reste valable côté DB et la vue admin doit exposer les `pending` |
| 11 | Migrations | 000–035 appliquées (historique prod réparé le 10/06) ; **036/037 réservées modération** | Migrations admin = **038/039** |
| 12 | — | `ForbiddenError` (403) n'existe pas dans `packages/domain/src/shared/errors/` | À créer |
| 13 | Deploy | App = Vercel (projet `predcast.tv`, staging + prod par tag via `release.yml`), landing = CF Pages, API/workers = Fly (image GHCR retagée au tag) | Admin = **nouveau projet Vercel** (`output: standalone`, l'export statique CF ne convient pas) + workflow `deploy-admin.yml` miroir de `deploy-app.yml` + job `deploy-admin-prod` dans `release.yml` |

Cohérence plan modération : le panel **réutilise** les ports/repos/policies du plan v2 (`IReportRepository`, `IBanRepository`, `IReportActionRepository`, `IReportConfigProvider`, `StopStreamUseCase`, clés Redis `ban:active:{wallet}` et clé cache config — constantes partagées) en y **ajoutant des méthodes**, jamais en créant de repos parallèles. Les actions admin écrivent dans `report_actions` avec `quorum_snapshot.trigger='admin_manual'` (JSONB sans CHECK → aucune migration), ce qui leur fait bénéficier de l'invariant `idx_actions_one_active` et du flux de reverse uniforme.

---

## 2. Architecture

### 2.1 App `apps/admin` (monorepo)

- Modèle = `apps/frontend` (Next 16.2.6, App Router, Tailwind v4, `output: 'standalone'`, `transpilePackages @chiliztv/{ui,domain,shared,blockchain}`), port dev **3003**. Nom package `@chiliztv.com/admin`.
- `middleware.ts` Next : uniquement `X-Robots-Tag: noindex,nofollow` + headers sécu. **Pas de RBAC edge** (JWT en localStorage, invisible côté edge) — l'enforcement est 100 % serveur sur `/admin/*`.
- **CORS (PO #3, lot 1)** : le secret Fly `ALLOWED_ORIGINS` de `chiliztv-api` doit inclure `https://admin.predcast.tv` et `https://admin-staging.predcast.tv` (`apps/backend/index.ts:46`). Projet Vercel + DNS créés par le PO.
- Wiring API : **duplication contrôlée** du client (`lib/api/client.ts` + `auth.ts` adaptés depuis le frontend) — pas d'extraction `packages/api-client` au MVP (toucherait l'app revenue-critical pour un gain nul ; le vrai contrat partagé = les DTOs Zod `packages/shared/src/dto/admin/`). Clé localStorage **séparée** `predcast_admin_auth_token` ; le 403 `ACCOUNT_NOT_ADMIN` ne déclenche jamais de retry. ✅ Acté V1 (PO) — **migration cookie httpOnly + SameSite notée en amélioration V2**.
- **Gate par code d'accès (pré-wallet, ajout PO 2026-06-12)** : au lancement du panel, une page demande un code avant même d'exposer la connexion wallet. Le code est vérifié **côté serveur** (`POST /admin/gate`, vérification scrypt contre `ADMIN_GATE_CODE_HASH` (jamais de code en clair en env), limiter dédié 5/min/IP avec `bypassKillSwitch`) qui renvoie un **gate token HMAC** (signé `JWT_SECRET`, TTL 12 h, stocké sessionStorage). Toute requête `/admin/*` doit ensuite porter ce token en header `X-Admin-Gate` — vérifié dans `requireAdmin` AVANT le lookup RBAC. Défense en profondeur : un JWT volé ne suffit pas sans le code, et le code seul ne donne rien sans wallet granté.
- Auth front : mêmes providers Dynamic Labs (copie de `DynamicProviderWrapper`/`auth-provider`), puis `AdminGuard` à machine d'états (discriminated union) : `gate (code) → wallet_disconnected → authenticating → checking_admin (GET /admin/me) → denied | error | admin`. `AdminSessionProvider` expose `{wallet, role}` ; `SidebarNav` et `RequireRole` filtrent par rôle (cosmétique — le backend re-vérifie tout).

### 2.2 Auth + RBAC (Option A)

- **Table `admin_wallets`** (cf. §2.3) + middleware `requireAdmin(...roles)` empilé après `authenticate` existant. Rôles : `super_admin > admin > moderator | finance`.
- **Lookup par requête, pas claims JWT** : port `IAdminAccessService.getActiveRole(wallet)` impl `CachedAdminAccessService` — Redis `admin:role:{wallet}` TTL 60 s avec negative caching (`'none'`), `DEL` à chaque grant/revoke. Justification : révocation effective ≤ 60 s sans re-login, le claim `role` actuel est inerte, et on ne touche pas au flux d'émission JWT.
- Policy pure `AdminRolePolicy.isAllowed(actual, allowed)` dans `packages/domain/src/admin/policies/` (testée L1). Échec → `ForbiddenError` (403, à créer). Propagation `req.admin = {wallet, role}` (declaration merge Express).
- **Matrice RBAC actée (PO #8)** : `moderator` = modération complète + **joueurs en lecture** (nécessaire à la revue des signalements), pas de finance/contrats ; `finance` = finance + analytics lecture ; `admin` = tout sauf gestion des admins ; `super_admin` = tout. `unpause` = `admin` + 2FA. Gestion des admins = `super_admin` uniquement.
- Montage `apps/backend/index.ts` dans le bloc authentifié : `app.use('/admin', adminLimiter, adminRoutes)` (+ `bypassKillSwitch` sur `adminLimiter`).
- **Force logout** : pas de table sessions — `UPDATE admin_wallets SET revoked_at` + `DEL admin:role:{wallet}` + `SET auth:revoked:{wallet}` (mécanique de révocation existante). Bootstrap : CLI `pnpm admin:grant <wallet> super_admin` (jamais de wallet hardcodé en migration).
- **Audit dans les use-cases, pas en middleware** (le middleware ne connaît ni `old_value` ni l'issue réelle) : chaque use-case mutateur reçoit un `AuditContext {actorWallet, actorRole, ip, userAgent, requestId}` et termine par `IAuditTrail.record(...)`.

### 2.3 Modèle de données — migrations `038_admin_panel.sql` et `039_admin_analytics.sql`

✅ Acté (PO #1) — avec la règle de numérotation : 036/037 n'existent pas encore ; si le lot 0 admin merge avant le plan modération, **prendre le prochain numéro libre au moment du merge** (pas de trous réservés). Les numéros 038/039 ci-dessous sont indicatifs.

**038 — `admin_wallets`** : `id` UUID PK, `wallet_address` TEXT (lowercase), `role` TEXT CHECK (`super_admin|admin|moderator|finance` — invariant de sécurité gelé, CHECK SQL justifié), `granted_by_wallet` (`'bootstrap'` pour le seed CLI), `granted_at`, `revoked_at/revoked_by_wallet/revoke_note`, `note`. **Index unique partiel `(wallet_address) WHERE revoked_at IS NULL`** (un seul grant actif — même pattern que `idx_bans_one_active`). Changement de rôle = revoke + insert (historique gratuit). Pas de colonne 2FA (le 2FA retenu est la re-signature wallet, cf. §4 — colonne `totp_secret_enc` additive plus tard si besoin).

**038 — `audit_log`** append-only : `id` BIGSERIAL PK (keyset trivial), `actor_wallet`, `actor_role` (snapshot au moment des faits), `action` TEXT namespacé (`moderation.ban.lift`, `markets.cancel.request`, `config.report_config.update`… — union TS dans `packages/shared`, pas d'ENUM SQL), `target_type/target_id`, `old_value/new_value` JSONB, `ip` INET + `user_agent` (admins uniquement — intérêt légitime sécurité, purge cf. §5), `request_id` (corrélation Pino), `created_at`. Index `(actor_wallet, id DESC)`, `(target_type, target_id, id DESC)`, `(action, id DESC)`. **Append-only enforcé** : `REVOKE UPDATE, DELETE FROM service_role` (les grants s'appliquent même en bypass RLS) + trigger `BEFORE UPDATE OR DELETE → RAISE EXCEPTION`.

**038 — `admin_onchain_actions`** (machine à états des tx admin, distincte d'audit_log qui la référence) : `id` UUID, `action_type`, `target_contract`, `target_market_id`, `params` JSONB, `requested_by`, `rbac_role`, `two_fa_nonce`, `simulation_result` JSONB, `state_before` JSONB, `nonce`, `tx_hash`, `gas_used`, `status` (`pending→simulated→broadcast→confirmed|reverted|failed|stuck`), `error`, `parent_id` (batchs kill switch), `retry_of`, timestamps. UNIQUE sur `action_id` client (idempotence des re-POST).

**039 — analytics** : index composites nécessaires (`bets (lower(user_address), block_timestamp DESC)`, `bets (block_timestamp DESC)`, donations/subs `(streamer, created_at DESC)`) + **fonctions SQL appelées par `.rpc()`** (pattern repo existant — supabase-js ne fait pas de GROUP BY) : `admin_player_aggregates`, `admin_streamer_aggregates`, `admin_kpis`, `admin_timeseries`. **Choix : calcul à la volée + cache Redis TTL** (60 s listings, 300 s KPIs via `ICacheService.getOrLoad` — single-flight déjà codé) plutôt que matviews (REFRESH à orchestrer sur Supabase managé = pièce mobile en plus) ; si la volumétrie explose, on remplace le corps des fonctions SQL par un SELECT sur matview **sans changer l'API**.

RLS des deux migrations : `ENABLE ROW LEVEL SECURITY`, **zéro policy**, `REVOKE ALL FROM anon, authenticated` explicite (la 027 a fait des grants larges). Lecture exclusivement via l'API backend (service_role).

### 2.4 Intégration avec le schéma modération — requêtes types

Doctrine identique au plan v2 : pas de transaction applicative — ordonnancement fail-safe (DB d'abord) + guards idempotents.

- **File de revue** : `SELECT reports WHERE status='open' [AND severity>=x AND target_type=… AND created_at BETWEEN…] ORDER BY severity DESC, created_at DESC` — sert exactement `idx_reports_admin_queue` (036) ; second SELECT batché sur `report_actions IN (triggered_action_id…)` ; cursor keyset `(severity, created_at, id)` base64.
- **Levée de ban** : `UPDATE bans SET status='lifted_by_admin', ended_at=$now, lifted_by_wallet=$actor, lift_note=$note WHERE id=$id AND status='active' RETURNING *` (0 row → 409) → `DEL ban:active:{wallet}` (clé exacte du plan v2 §1.6) → `notifyBanLifted` (IModerationNotifier, non bloquant) → audit avec diff.
- **Restore message** : (1) `UPDATE report_actions SET reversed_* WHERE id=$id AND reversed_at IS NULL RETURNING affected_message_id` (libère `idx_actions_one_active`, 0 row → 409) ; (2) `UPDATE chat_messages SET removed_at=NULL, removed_by_action_id=NULL WHERE id=$msg AND removed_by_action_id=$actionId` (guard idempotent si crash entre 1 et 2) ; (3) audit. Le front user voit réapparaître le message via le Realtime existant.
- **Ban manuel admin** : `INSERT bans (…, quorum_snapshot={trigger:'admin_manual', issuedBy, reason}, escalation_index=countEscalating+1)` — violation `idx_bans_one_active` → 409 `BAN_ALREADY_ACTIVE` ; via **`BanLifecycleService`** partagé (service applicatif `application/reporting/services/` consommé par le `BanAccountUseCase` auto ET l'admin : insert + DEL Redis + notify + cascade stop-stream — zéro duplication).
- **Édition `report_config`** : SELECT pour `old_value` → `UPDATE … WHERE id=1 RETURNING *` → `DEL` de la **clé de cache exacte** du `ReportConfigCache` (constante partagée `REPORT_CONFIG_CACHE_KEY`) → hot-reload effectif (TTL résiduel 30 s max sur les autres workers, documenté) → audit diff.
- **`ForceEndStreamUseCase`** délègue au `StopStreamUseCase` du plan v2 + `report_actions` `admin_manual` + audit. **`DeactivateAccountUseCase`** V1 = ban permanent via `BanLifecycleService` + `SET auth:revoked:{wallet}` (zéro nouvel état, enforcement déjà câblé). ✅ Acté (PO) : la révocation totale du JWT casse volontairement le principe « le banni peut parier » — action distincte et plus grave que le ban modération, **à documenter dans la JSDoc du use-case et le wording UI** (« désactiver le compte » ≠ « bannir »).

---

## 3. Surfaces & écrans

### 3.1 Arborescence `apps/admin/` (résumé — détail complet conservé du design)

```
app/                    layout.tsx (providers+AdminGuard+AdminShell), page.tsx → redirect /moderation
  moderation/           page (file de revue), reports/[id], bans/, config/
  players/              page (listing joueurs+streamers), [wallet]/
  markets/              page (matches actifs), [matchId]/
  finance/  contracts/  analytics/  audit/      une page chacun (Tabs internes)
components/
  guard/      AdminGuard, ConnectWalletScreen, AccessDeniedScreen, AdminLoadingScreen, RequireRole
  layout/     AdminShell, SidebarNav(+Item), TopBar, PageHeader
  common/     DataTable, DataTablePagination, SortableHeader, FilterBar, StatCard, JsonViewer,
              ConfirmDangerDialog (double saisie), AddressLink, TxLink, WalletBadge, RoleBadge,
              StatusBadge, SeverityBadge, AuditDiff, DateTime, RelativeTime, CopyButton,
              EmptyState, ErrorState, Sparkline          (1 composant = 1 fichier)
  features/   moderation/ players/ markets/ finance/ contracts/ analytics/ audit/
              (orchestrateur + components/ + dialogs/ + domain/ par feature)
hooks/api/    ~16 hooks React Query ; hooks/useTableQueryState.ts (filtres/tri/page ↔ URL)
lib/          api/{client,auth,errors,endpoints/*}, query/{client,keys}, explorer.ts, format/*
providers/    dynamic, auth, query, admin-session
config/       nav.ts (sidebar filtrée par rôle), rbac.ts (matrice)
```

### 3.2 Endpoints `/admin/*` (DTOs Zod dans `packages/shared/src/dto/admin/`, un fichier par schéma)

Enveloppe commune : Format B `{success, data}` + pagination **keyset** `AdminPageDto {items, nextCursor}` pour les tables à volume (reports, bans, bets, audit) ; **offset borné + total** pour les listings d'agrégats (`/admin/players` trié par volume — keyset instable sur une somme fenêtrée).

| Surface | Endpoints (rôle minimal) |
|---|---|
| Session | `GET /admin/me` → `{wallet, role}` (tout rôle actif) |
| Modération (moderator+) | `GET /admin/reports` (status/severityMin/targetType/from/to) ; `GET /admin/reports/:id` (report + action + historiques reporter/signalé + contenu cible) ; `POST /admin/reports/:id/dismiss` et `/close` (`{note}`) ; `GET/POST /admin/bans` (création : `{walletAddress, durationHours|null, reason, stopActiveStream?}`) ; `POST /admin/bans/:id/lift` (`{note}` obligatoire) ; `GET /admin/report-actions` ; `POST /admin/actions/:id/reverse` ; `POST /admin/messages/:id/restore` ; `GET /admin/report-config` ; `PUT /admin/report-config` (**admin** — la politique de modération n'est pas du ressort moderator) |
| Joueurs/streamers | `GET /admin/players` (rpc agrégats, cache 60 s) ; `GET /admin/players/:wallet` (+ `/bets` keyset) ; `GET /admin/streamers` (+ `/:wallet`) ; `POST /admin/streams/:id/stop` (moderator+) ; `POST /admin/players/:wallet/deactivate` (**admin**) |
| Marchés | `GET /admin/matches` (volumes par contrat + résumé états markets dérivés de `market_events`, pools on-chain via le reader multicall existant) ; `GET /admin/matches/:id` ; `POST /admin/markets/{suspend,open,close,resolve,cancel}` (**admin**, cf. §4) |
| Finance (finance+) | `GET /admin/finance/overview` (cache 300 s) ; `GET /admin/finance/epochs` (**expose les ghost epochs `pending`/`epoch_id NULL`**, jointure claims seulement si `epoch_id IS NOT NULL`, badge « tx non confirmée ») ; `/donations`, `/subscriptions`, `/streamers/:wallet` |
| Contrats/Ops | `GET /admin/contracts/health` (wallet + rôles on-chain) ; `GET /admin/indexers` ; `POST /admin/ops/kill-switch` ; `POST /admin/indexers/:name/rewind` (**super_admin**, cf. §4) ; `GET /admin/actions/:id` (suivi des tx, poll du kill switch) |
| Analytics | `GET /admin/analytics/kpis` (DAU V1 = union wallets actifs chat+bets+donations — `viewer_sessions` est sans wallet ; méthodologie documentée dans le DTO) ; `GET /admin/analytics/timeseries?metric&granularity&from&to` |
| Audit (admin+) | `GET /admin/audit` (actor/action-préfixe/target/from/to, keyset id DESC) |
| Gestion admins (**super_admin**) | `GET/POST /admin/admins`, `PATCH/DELETE /admin/admins/:wallet` — policies pures : pas de self-revoke, pas de révocation du **dernier** super_admin |

### 3.3 Choix de libs — **zéro nouvelle dépendance au MVP**

| Besoin | MVP | Trigger phase 2 |
|---|---|---|
| Tables | `Table` de `@chiliztv/ui` + `DataTable` maison (colonnes déclaratives ~50 lignes), tri/pagination/filtres **server-side** pilotés par l'URL (`useTableQueryState`, deep-linkable) | Bulk-selection, colonnes réordonnables, virtualisation → `@tanstack/react-table` |
| Formulaires | Contrôlés + `safeParse` des DTOs Zod partagés (mêmes bornes front/back) — `ReportConfigForm` = 6 champs | >10 champs / arrays dynamiques → `react-hook-form` |
| Dates | `Intl.DateTimeFormat`/`RelativeTimeFormat` dans `lib/format/datetime.ts`, composants `DateTime`/`RelativeTime` client-only (hydration-safe §7.4 : `—` au premier paint) | Date-range picker riche → réévaluer |
| Charts | SVG maison : `Sparkline` + `TimeSeriesPanel` barres/aires (~100 lignes) | Multi-séries/tooltips/zoom → ajouter `recharts` (et corriger CLAUDE.md §7.8 au passage) |

### 3.4 Adaptation du langage visuel (back-office dense, palette §5 intacte)

Corps de table 13 px, headers de colonnes = style eyebrow (`font-mono-ctv` 10 px tracking 0.14em white/45), rows 38-40 px `border-b #1E1E1E` hover `#111` (pas de zébrage), cards `p-4/p-5` `rounded-lg`, titres `font-display` 2xl/3xl, `PageHeader` avec l'eyebrow rouge à barre (signature conservée). Sémantique constante : vert `#2dd4a4` = sain/résolu, gold `#F5C518` = pending/suspendu, rouge `#E8001D` = danger/sévérité haute. Zones dangereuses : card `border-[#E8001D]/30` fond rouge 5 %. Pas de SmokeBackground/BorderBeam sur les écrans de travail (réservés aux écrans guard). Focus rings et aria-labels conservés.

---

## 4. Actions on-chain admin

### 4.1 Flux de signature — le backend signe via `ISigner` (option a, recommandée)

L'app admin ne touche jamais de clé. Argument décisif contre la signature wallet front (option b) : les rôles AccessControl sont **par proxy de match** (la factory renonce à ses rôles au wiring) — granter chaque opérateur sur chaque contrat = N tx ingérables, et un kill switch demanderait des dizaines de signatures MetaMask.

- **`ISigner`** (`packages/domain/src/shared/ports/`) : `getAddress()` + `signTransaction(tx)` — on construit un **Account viem custom** (`toAccount`) par-dessus, le reste du code garde `walletClient.writeContract`. Impl `PrivateKeySignerAdapter` aujourd'hui, `KmsSignerAdapter` demain (AWS KMS `ECC_SECG_P256K1`, signature DER → low-s + recovery id, latence 50-150 ms/tx acceptable). Binding DI unique `TOKENS.IAdminSigner` — la bascule KMS = un seul binding. **Refactor obligatoire des 5 points de signature existants** (`PariMatchResolutionAdapter`, `CloseEpochUseCase`, `PariMatchDeploymentAdapter`, `StreamWalletDeploymentAdapter`, `ViemBlockchainService`) vers ce provider : c'est l'abstraction demandée par CLAUDE.md §7.1 et le prérequis KMS.
- **`AdminTxService`** — pipeline unique : valider (machine d'états du market répliquée backend + croisement statut API-Football) → `simulateContract` (revert simulé = refus, résultat stocké) → persist `pending` → **lock Redis `lock:admin-wallet:{addr}`** (fenêtre lecture-nonce→broadcast seulement) → sign → broadcast → unlock → `waitForTransactionReceipt` → persist `confirmed|reverted` → audit → alerte Discord si critique. Idempotence par `action_id` UNIQUE (re-POST = renvoi de l'état). Job léger marque `stuck` après N min sans receipt (résolution = logique du CLI `cancel-stuck-txs.ts` existant).
- **Nonce cross-process (risque n°1)** : API et workers signent avec le même wallet depuis 2 process Fly. **Wallet partagé + mutex Redis sur tous les chemins de signature** (✅ acté PO #6) ; le lock est pris **par transaction** (fenêtre lecture-nonce→broadcast), **jamais pour la durée d'un batch** — le kill switch (2-3 min) ne doit pas bloquer les jobs de resolve pendant tout le batch. Un wallet ops secondaire granté dans le wiring des futurs matchs = amélioration séparée non bloquante.
- ✅ Acté (PO #5) : le refactor ISigner des 5 signataires existants ship **seul** (deploy dédié, découplé des autres lots — il touche les chemins de signature en prod), avec les tests L4 nonce cross-process **avant merge**.

### 4.2 Catalogue (rôle RBAC minimal / 2FA)

| Action | Contrat | RBAC | 2FA | Garde-fous |
|---|---|---|---|---|
| suspend / re-open market | `suspendMarket`/`openMarket` | admin | non | transitions valides uniquement |
| close market(s) | `closeMarket(sBatch)` | admin | non | warning si match pas commencé |
| cancel market (+refund) | `cancelMarket(id, reason)` | admin (super_admin si match live) | **oui** | raison ≥10 car., affichage du pool refundé |
| resolve by score guidé | `resolveByScore(FootballScore)` | admin | **oui** | form FT/HT/AET/penWinner pré-rempli API-Football, **diff visuel saisi vs API**, flag `force` si divergence ; close préalable des Open (séquence du `PariMatchResolutionAdapter` réutilisée) |
| resolve unitaire (outcome manuel) | `resolveMarket(id, result)` | **super_admin** | **oui** | outcome décodé + pools par outcome affichés |
| pause par contrat | `emergencyPause()` | admin | non (rapidité, action conservatrice) | — |
| unpause | `unpause()` | admin | **oui** (réexpose les fonds) | — |
| **kill switch global** | batch `emergencyPause` | **super_admin** | **oui** | cf. ci-dessous |
| fees/wiring | `setFeeBps`(≤500)/`setFeeRecipient`/`setLeaderboard*` + factory `setWiring` | super_admin | **oui** | old→new affiché ; distinguer « contrats existants » vs « futurs matchs » |
| epochs leaderboard | `advanceEpoch`/`rolloverEpoch` | finance / super_admin | rollover : oui | montant non réclamé affiché |
| treasury | — | finance | — | **lecture seule** (écart #7) |
| rewind indexer | UPDATE `indexer_checkpoints` | **super_admin** | **oui** | cf. ci-dessous |

**Kill switch** : cible = `factory.getAllMatches()` ∩ matchs actifs DB, filtrés `paused()==false` ; 1 ligne parent + N enfants dans `admin_onchain_actions` ; V1 séquentiel strict sous lock (≈50k gas/tx, ~30 contrats ≈ 2-3 min) ; reporting de progression par poll `GET /admin/actions/:parentId` ; échec d'un enfant n'arrête pas le batch ; **reprise idempotente** (re-clic skippe les `paused()`) ; checkbox « inclure LeaderboardRewards » (gèle aussi les claims) — **décochée par défaut** (✅ acté PO #9) ; alerte Discord avec le nb de matchs live impactés.

**Rewind indexer** : `{toBlock, reason}` ; garde-fous : `toBlock < last_block`, borne max 50 000 blocs (au-delà = opération manuelle), acquisition du lock Redis de l'indexeur (clé `indexerLockConfig(name)`) le temps de l'UPDATE — `BaseIndexer` relit le checkpoint à chaque tick (≤6 s), **aucun redémarrage nécessaire** ; pré-condition d'activation du bouton : tests L4 prouvant l'idempotence des handlers au re-traitement (l'incident `bets` du 10/06 a été réparé à la main — ce bouton l'industrialise).

### 4.3 2FA actions critiques — re-signature wallet EIP-712 (recommandé)

Cohérent avec l'auth wallet, zéro dépendance, prouve la **possession de la clé au moment T** (un JWT volé ne suffit plus), et lie la signature aux paramètres exacts. Flux : `POST /admin/2fa/challenge {action_type, params_hash}` → nonce 32 bytes Redis `admin:2fa:{wallet}:{nonce}` TTL 120 s → le front signe le typed-data (domain « PredCast Admin », message `{wallet, actionType, paramsHash, nonce, expiry}`) → l'action critique porte `{challenge_nonce, signature}` → middleware `require2fa` : `recoverTypedDataAddress` == wallet du JWT, nonce consommé atomiquement (GETDEL), `params_hash` revalidé. Anti-rejeu et anti-substitution par construction. Double saisie (`ConfirmDangerDialog`) intégrée en plus dans les modales. Admins **EOA only** en V1 (sinon ERC-1271 — à trancher). TOTP = option V2 super_admin.

### 4.4 Audit & alerting

- Audit on-chain en **deux écritures corrélées** : *intent* (à la requête : params, simulation, state_before) puis *outcome* (au receipt : tx_hash, gas, state_after) — toutes deux référencent `admin_onchain_actions.id`.
- **`DiscordIncidentReporter`** : extension du port existant `IIncidentReporter` (+ composite log+Discord), webhook `DISCORD_ALERTS_WEBHOOK_URL` (distinct de la CI). Événements : actions critiques, tx reverted/failed/stuck, balance wallet < seuil, anomalies.
- **`BetVolumeAnomalyJob`** (worker, 15 min, lock Redis — pattern JobScheduler existant) : volume fenêtre glissante vs baseline 7 j, ratio >10 → alerte informative (pas de blocage auto V1).
- **Health wallet** `GET /admin/contracts/health` (cache 30 s) : balance CHZ + seuil (~50 tx de gas), nonces latest vs pending (écart persistant = stuck → badge + lien procédure), dernière tx, **rôles on-chain effectifs** (`hasRole` ADMIN/RESOLVER/PAUSER + `owner()` factory sur les contrats actifs — détecte un wiring cassé), `paused()` par contrat (alimente le dashboard kill switch).

---

## 5. Carte blanche — ajouts intégrés / écartés (justifiés)

| Proposition | Décision | Justification |
|---|---|---|
| Alerting Discord + job anomalie volume | **Intégré** (lot 5) | Port `IIncidentReporter` existant à étendre, pattern job établi — coût faible, valeur ops élevée |
| Vue indexers + rewind guidé | **Intégré** (lot 5, gated tests d'idempotence) | Industrialise l'incident réel du 10/06 (replay manuel du checkpoint `PariMatchEvent`) |
| Édition `report_config` | **Intégré** (lot 2) | Hot-reload prévu par le plan v2 — le panel est son débouché naturel |
| Table `admin_onchain_actions` | **Ajouté** | audit_log append-only ne doit pas servir de machine à états tx ; suivi kill switch/stuck impossible sans |
| Purge RGPD `AuditRetentionJob` | **Ajouté** (NULL-ifie ip/user_agent >12 mois, la ligne d'audit reste) | Minimisation — coût : un job de plus sur le pattern existant |
| Mode read-only par défaut | **Intégré sous forme RBAC** | Rôles `moderator`/`finance` = lecture + actions de leur périmètre ; actions destructives admin/super_admin + 2FA + double saisie — un « toggle read-only » global serait redondant |
| Exports CSV | **Écarté MVP** | Trivial à ajouter plus tard (`?format=csv` sur les listings) ; aucune demande opérationnelle immédiate |
| Bulk-ban par pattern wallet regex | **Écarté V1** | Risque élevé (faux positifs en masse, irréversibilité pratique), incompatible avec l'esprit une-action-auditée-par-cible ; le ban unitaire + la file de revue couvrent le besoin actuel |
| Warnings utilisateur | **Écarté V1** | Aucun canal de notification user→backend existant ; pis-aller possible (system message si en live) — vraie feature = table additive ultérieure |
| Table `admin_sessions` | **Écarté** | La révocation Redis existante + lookup RBAC 60 s couvrent force-logout et révocation ; une table dupliquerait l'état |
| KYC / IP-devices users | **Écarté** | Aucune donnée existante, traitement RGPD injustifié pour le besoin actuel |
| 2FA TOTP | **Écarté V1** (EIP-712 retenu) | Nouvelle dépendance + enrollment/recovery à construire pour un gain marginal vs re-signature wallet |

---

## 6. Lots de livraison (ordre : foundations → modération → joueurs/marchés → on-chain → finance/analytics)

| Lot | Contenu | Est. | Risques principaux |
|---|---|---|---|
| **0 — Socle backend** | Migrations 038/039, `ForbiddenError`, `requireAdmin` + `CachedAdminAccessService`, `AuditTrailService`, CLI `admin:grant`, `GET /admin/me`, `bypassKillSwitch` sur adminLimiter | 3-4 j | Faible. Indépendant de la 036 — peut shipper avant la modération |
| **1 — App admin foundations** | Scaffold `apps/admin` (port 3003), providers, client API + clé JWT séparée, AdminGuard + 4 écrans, AdminShell/Sidebar/TopBar, kit `common/` complet, `useTableQueryState`, `deploy-admin.yml` (staging Vercel) | 4-5 j | Setup Vercel/DNS (dépendance externe) |
| **2 — Modération** (prod first) | Backend : extensions ports `IReport*/IBan*`, `BanLifecycleService`, 12 use-cases + routes ; Front : queue, détail report (QuorumSnapshotCard, timeline), 5 dialogs, bans, report_config | 5-6 j | **Dépend de la migration 036 + LOT 3 du plan modération en prod.** Coordination des constantes partagées (clés Redis) |
| **3 — Joueurs & marchés (lecture)** | rpc agrégats joueurs/streamers, listings + détails, force-end-stream/deactivate ; matches/markets en lecture (états, volumes, pools multicall) | 4-5 j | Perf agrégats `bets` (index 039 obligatoires) |
| **4 — Socle on-chain** | `ISigner` + `PrivateKeySignerAdapter` + account viem DI, **refactor des 5 signataires existants + lock Redis wallet**, `AdminTxService`, actions simples (suspend/open/close) | 5 j | **Refactor transversal des chemins de signature en prod** — tests L4 nonce cross-process indispensables |
| **5 — Actions critiques + ops** | 2FA EIP-712 (`require2fa`), cancel/resolve guidé/resolve unitaire/unpause, kill switch (parent/enfants + reprise), health wallet, rewind indexer (gated tests), `DiscordIncidentReporter`, `BetVolumeAnomalyJob` | 5 j | Sécurité — revue dédiée du flux 2FA ; idempotence replay à prouver avant d'exposer le bouton |
| **6 — Finance, analytics, audit UI** | Finance (overview, epochs avec ghost-epochs `pending`, donations/subs), réconciliation V1/V2 leaderboard (écart #10), KPIs + timeseries SVG, page audit + AuditDiff, `AuditRetentionJob`. Décision recharts réévaluée ici | 4-5 j | Écart leaderboard V2 à élucider ; méthodologie DAU assumée |

Total ≈ 30-35 jours-dev. Lots 0+1 parallélisables back/front ; le lot 2 est le chemin critique aligné sur la mise en prod du plan modération. **L'écriture des entrées d'audit démarre au lot 0** même si l'écran arrive au lot 6.

**Séquencement acté (PO, 2 devs, WC en cours)** : ① hotfix leaderboard (hors plan, immédiat) → ② lots **0 → 1 → 2** (la modération est le besoin opérationnel réel pendant la WC) → ③ lot **3** (lecture joueurs/marchés). Les lots **4-5** (on-chain) sont **différés post-phase de groupes** : les CLI existants couvrent l'urgence (resolve, stuck tx), et le refactor ISigner mérite une fenêtre calme + un deploy dédié. Lot **6** après le hotfix leaderboard.

---

## 7. Plan de test (convention §4.1ter)

- **L1 — policies pures (vitest, MockClock, zéro I/O)** : `AdminRolePolicy` (matrice 4 rôles × surfaces), `LastSuperAdminPolicy` (self-revoke interdit, dernier super_admin protégé), `AdminBanPolicy` (durée null=permanent, bornes, escalation_index), encode/décode cursor keyset, `impliedOdds`/`marketState` côté front (domain purs), validation des transitions de la machine d'états market répliquée backend. Fixtures `adminWallet.fixtures.ts`/`auditEntry.fixtures.ts` ; **réutiliser** les fixtures report/ban du plan modération.
- **L2 — scénarios (`pnpm match:scenario`, IDs 999000+)** : `admin-grant-revoke` (grant → 200 → revoke → 403 immédiat après DEL cache), `admin-report-review` (seed multi-sévérité → filtres/tri → dismiss → audit présent), `admin-ban-lift` (ban manuel → 403 `requireNotBanned` → lift → accès restauré + Redis purgé), `admin-restore-message` (réutilise le scénario quorum du plan v2), `report-config-hot-reload` (PUT → GET public reflète ≤30 s).
- **L4 — intégration (Anvil + Supabase local)** : RLS anon sur `admin_wallets`/`audit_log` → 42501 ; append-only (UPDATE/DELETE service_role → exception trigger) ; rpc agrégats (volumes fenêtrés, win_rate division-par-zéro, buckets timeseries) ; concurrence (2 lifts simultanés → un 200 + un 409 ; 2 bans → un seul insert) ; ghost epoch `pending` sans crash de jointure ; **sérialisation nonce cross-process** (2 writers concurrents sous lock → nonces strictement croissants, zéro replacement) ; 2FA anti-rejeu (nonce consommé, params_hash substitué → refus) ; **replay indexer** : re-traitement d'un range déjà indexé → zéro doublon (`(tx_hash, log_index)`), pré-condition du bouton rewind ; kill switch sur Anvil multi-contrats avec échec injecté au milieu → reprise idempotente.

---

## 8. Validations — toutes actées par la review PO du 11/06

Synthèse des GO (détail intégré dans les sections ci-dessus) : **1** migrations GO avec renumérotation au merge ; **2** zéro dep GO, recharts lot 6 ; **3** Vercel/DNS par le PO + `ALLOWED_ORIGINS` à étendre (lot 1) ; **4** 2FA EIP-712 GO, EOA only V1 ; **5** ISigner GO — refactor shippé seul + L4 avant merge ; **6** lock par transaction, jamais par batch ; **7** treasury lecture seule acté (spec produit corrigée) ; **8** matrice RBAC précisée (§2.2) ; **9** pause sans 2FA / unpause+kill switch avec, checkbox Leaderboard décochée par défaut ; **10** rewind GO (borne 50 000, gated L4) ; **11** ip/UA admins + purge 12 mois GO ; **12** leaderboard = **hotfix immédiat hors plan** (encadré en tête) ; **13** corrections CLAUDE.md en une PR `docs:` dédiée (+ leaderboard V2 post-hotfix) ; **14** secrets GO (+ `ADMIN_GATE_CODE_HASH` ajouté avec le gate, 2026-06-12).

Liste d'origine (référence) :

1. **Migrations 038/039** (admin_wallets + audit_log + admin_onchain_actions ; index + rpc analytics) — schémas §2.3. *(CLAUDE.md §9 : schéma Supabase.)*
2. **Zéro nouvelle dépendance au MVP** — tables/forms/dates/charts maison ; triggers phase 2 explicités §3.3. Confirmer notamment le report de `recharts` au lot 6 *(CLAUDE.md §9 : dépendances)*.
3. **DNS/deploy** : nouveau projet Vercel `predcast-admin` (standalone), domaine `admin.predcast.tv` + `admin-staging.predcast.tv`, workflow `deploy-admin.yml` miroir de `deploy-app.yml` + job `deploy-admin-prod` dans `release.yml`. Qui crée le projet Vercel et le DNS ?
4. **Flux 2FA = re-signature wallet EIP-712** (challenge nonce Redis 120 s, anti-rejeu, params-bound) — et admins **EOA only** en V1 ?
5. **Le backend signe (option a)** via `ISigner`/account viem partagé — incluant le **refactor des 5 signataires existants** + lock Redis wallet (touche du code prod : `PariMatchResolutionAdapter`, `CloseEpochUseCase`, etc.).
6. **Wallet partagé + mutex Redis** (vs second wallet ops — proposé en amélioration séparée via le wiring des futurs matchs).
7. **Treasury en lecture seule** (les fees partent à `feeRecipient` au resolve — vérifié dans `PariMatchBase`) : la spec « action treasury claim » est sans objet — à acter.
8. **Matrice RBAC** rôle → surfaces/actions (§3.2 et §4.2) — notamment : moderator voit-il les joueurs ? unpause = admin ou super_admin ?
9. **Politique pause** : `emergencyPause` sans 2FA (rapidité), `unpause`/kill switch avec — et le kill switch inclut-il `LeaderboardRewards.emergencyPause` (claims gelés, checkbox) ?
10. **Rewind indexer** : borne 50 000 blocs + bouton gated par les tests L4 d'idempotence.
11. **audit_log : ip/user_agent des admins** (intérêt légitime sécurité, purge 12 mois par job) — OK RGPD côté PO ? (sinon : colonnes présentes, valeurs NULL — réversible sans migration).
12. **Écart leaderboard** : contrat V2 (`advanceEpoch` permissionless) vs flux merkle backend/CLAUDE.md — investigation à caler au lot 6 ; la vue Finance expose les ghost epochs `pending` dans tous les cas.
13. **Corrections CLAUDE.md** (édition validée séparément, §9) : Next 16, recharts absent, treasury-au-resolve.
14. **Secrets à créer** : `VERCEL_PROJECT_ID_ADMIN`, `DISCORD_ALERTS_WEBHOOK_URL`.

---

## Vérification end-to-end (après implémentation)

1. `pnpm admin:grant <wallet-test> super_admin` → ouvrir `localhost:3003`, connecter le wallet → AdminGuard passe ; wallet non granté → AccessDeniedScreen ; `DELETE /admin/admins/:wallet` → 403 en ≤60 s sans re-login.
2. Lot modération : `pnpm match:scenario run <scenario-reports>` → la file affiche les reports seedés, dismiss/ban/lift/restore aboutissent et chaque action apparaît dans `GET /admin/audit` ; PUT report_config → le quorum change de comportement sur un scénario L2 sans redéploiement.
3. On-chain (staging Spicy) : suspend/close/resolve guidé sur un match `match:scenario` → statuts `admin_onchain_actions` `pending→confirmed`, tx visibles sur testnet.chiliscan ; kill switch sur 2-3 contrats de test avec un échec injecté → reprise idempotente ; pendant ce temps les jobs workers continuent de résoudre sans erreur de nonce (test L4 + observation staging).
4. `pnpm test` (L1), `pnpm test:integration` (L4), build TS vert sur les 4 apps, `grep -rE "bg-(zinc|purple|blue|emerald|gray)-"` vide sur `apps/admin`.

## Fichiers critiques (référence d'implémentation)

- `docs/signalement-bannissement.plan-v2.md` — schémas 036/037, ports, clés Redis à partager.
- `apps/backend/index.ts` (montage routes, bloc authentifié l.95), `src/di/container.ts`, `packages/domain/src/shared/tokens.ts`.
- `apps/backend/src/presentation/http/middlewares/{authentication,rate-limit}.middleware.ts` — patterns à étendre (revocation, bypassKillSwitch).
- `apps/backend/src/infrastructure/blockchain/adapters/PariMatchResolutionAdapter.ts` + `application/leaderboard/use-cases/CloseEpochUseCase.ts` — signataires à refactorer vers `ISigner`.
- `apps/backend/src/infrastructure/blockchain/indexers/BaseIndexer.ts` + `SupabaseIndexerCheckpointRepository` — rewind.
- `apps/smart-contracts/chiliz-tv/src/pari/PariMatchBase.sol`, `PariMatchFactory.sol`, `leaderboard/LeaderboardRewards.sol` — surface admin on-chain.
- `apps/frontend/lib/api/client.ts`, `providers/auth-provider.tsx`, `next.config.ts` — modèles à dupliquer/adapter pour `apps/admin`.
- `packages/ui/src/index.ts` — primitives disponibles pour le kit DataTable/dialogs.
- `.github/workflows/{deploy-app,release,db-migrate}.yml` — modèles deploy-admin.
