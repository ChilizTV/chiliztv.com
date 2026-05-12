# DevOps Plan v2 — chiliztv.com

> Refresh complet du plan v1. Aligné sur l'état réel du projet au 2026-05-12 :
> beta déjà déployé Vercel + Render + VPS MediaMTX, plans en flight (no-live-betting,
> testing matches 4 niveaux, contracts integration, bet-label fix, pagination, stream
> lifecycle hardening), conventions matures de `CLAUDE.md` (IClock, fixtures L1,
> commentaires impersonnels, etc.).

---

## TL;DR — ce qui change vs v1

| Sujet | v1 (monolithique Hetzner) | v2 (split managé + VPS streaming) |
|---|---|---|
| Topologie cible | 1 VPS Hetzner CCX23 unique | Vercel (front) + Render (back) + VPS streaming (MediaMTX) |
| Phase 0 | Hetzner CX22 single-node + docker-compose | **DÉJÀ FAIT** — Vercel Hobby + Render Starter + VPS streaming + Caddy + Supabase Free |
| Coût Phase 0/MVP | ~$13/mo | ~$31/mo (incluant API-Football Basic $19) |
| CI/CD | GitHub Actions custom build + ssh deploy | GitHub Actions check-only (lint/test/build) — déploiements via auto-deploy Vercel/Render |
| Migrations DB | psql migrate dans la VM | `predeploy` Render hook + script idempotent |
| MediaMTX | Service docker dans la même stack | Service isolé sur VPS Hetzner/OVH avec son `infra/mediamtx/` ✅ déjà fait |
| KMS | Phase 3 only | **Phase 1** — `ADMIN_PRIVATE_KEY` est le single point of compromise critique |
| Sentry | Phase 2 | **Phase 1** — installable en 30 min, indispensable dès qu'il y a 10 testeurs |
| Indexers backend | Process node `index.ts` dans la VM | Render Background Worker dédié (séparé du web service) |

---

## Phase 0 — Beta (✅ déjà déployé, à durcir)

État actuel : 10 testeurs internes peuvent accéder à `app.chiliztv.com`, regarder des
streams (`ingest.chiliztv.com` → HLS), poser des bets sur Spicy testnet via le back
`api.chiliztv.com`. Le périmètre Phase 0 est **opérationnel**, mais il manque les
filets de sécurité minimaux pour ne pas perdre des données ou ne pas avoir de visibilité
en cas d'incident.

### 0.1 Acquis (à valider, pas à refaire)
- ✅ Front : Vercel Hobby (Next.js 15 App Router), auto-deploy `main` → prod, branches → preview
- ✅ Back : Render Starter Web Service, auto-deploy `main`
- ✅ Streaming : VPS (Hetzner ou OVH, le `infra/mediamtx/` est portable), Caddy reverse proxy + Let's Encrypt
- ✅ DB : Supabase Free (Postgres managé + Realtime)
- ✅ DNS : sous-domaines `app.` / `api.` / `ingest.` câblés (CNAME Vercel / Render / VPS)
- ✅ Secrets : `MEDIAMTX_PUBLISH_SECRET` partagé front-back-VPS via env

### 0.2 Gaps à combler avant d'élargir le beta (P0, semaine en cours)

| # | Item | Pourquoi | Effort |
|---|---|---|---|
| 0.A | **Backup Supabase manuel quotidien** (dump SQL → bucket S3 ou bunny.net) | Free tier n'a pas de PITR. Une migration ratée perd les données. | 2h |
| 0.B | **Logging Pino → Render log drain → BetterStack Free** | Sans rétention, impossible de débugger un incident à J+1. Free tier 1 GB/mois suffit pour 10 testeurs. | 1h |
| 0.C | **Sentry @sentry/nextjs + @sentry/node** (Sentry Free, 5k errors/mois) | Crash front non observable, exceptions back uniquement dans Render logs. | 3h |
| 0.D | **Healthcheck endpoint `/healthz` côté back** + ping uptime (BetterStack Uptime Free, 10 monitors) | Détecter Render qui coupe le service en idle (cold start ~30s). | 1h |
| 0.E | **Doppler ou env files chiffrés** pour rotation des secrets sans toucher Vercel/Render UI à la main | Aujourd'hui rotation = clic à clic dans 2 UIs + VPS, source de drift. | 4h |
| 0.F | **Documenter rollback** dans `docs/runbook-rollback.md` : Vercel one-click revert, Render redeploy d'un commit antérieur, MediaMTX `docker compose down && up` après edit | Sans doc, panique au prochain incident. | 2h |

Coût supplémentaire 0.A-0.F : **$0** (tous les free tiers tiennent à 10 testeurs).

---

## Phase 1 — Production MVP (semaines +2 à +6)

Objectif : passer le beta de 10 testeurs internes à 100-500 utilisateurs externes,
avec un niveau de sécurité acceptable pour de l'argent réel (USDC, même testnet) en
jeu.

### 1.1 Sécurité — non négociable avant mainnet

#### 1.1.1 `ADMIN_PRIVATE_KEY` → AWS KMS sign-only (P0 absolu)

Status actuel : la clé admin est en clair dans `Render env vars` et utilisée par
5 adapters + 1 CLI (`grep -rln ADMIN_PRIVATE_KEY apps/backend/src` → 7 fichiers).
Compromise = vol de tous les fonds liquidity pool + résolution malveillante de tous
les matches déployés.

Migration :
1. Créer un port `ISigner` dans `packages/domain/src/shared/ports/ISigner.ts`
   (interface : `sign(hash): Promise<Hex>`, `getAddress(): Promise<Address>`).
2. Implémenter `KmsSigner` dans `apps/backend/src/infrastructure/signing/KmsSigner.ts`
   (utilise `@aws-sdk/client-kms`, `AsymmetricSignParams` avec `SigningAlgorithm: ECDSA_SHA_256`).
3. Implémenter `LocalSigner` (wrap `privateKeyToAccount` viem) pour dev local + tests.
4. Refactorer `ViemBlockchainService` : `walletClient` construit à partir d'un
   `account` custom qui délègue `signTransaction` au `ISigner` injecté.
5. Bind `TOKENS.ISigner` → `KmsSigner` en prod, `LocalSigner` en dev/test dans
   `apps/backend/src/composition-root.ts` selon `NODE_ENV`.
6. Supprimer `ADMIN_PRIVATE_KEY` de l'env Render — remplacer par
   `AWS_KMS_KEY_ID` + IAM role.

Coût : AWS KMS = $1/mo par clé + $0.03 par 10000 signatures. Pour ~10000 signatures/mois
(résolutions + close markets), **~$1/mo**. Effort dev : 1-2 jours.

#### 1.1.2 Audit smart contracts (Lot pré-mainnet)
Avant tout deploy mainnet `chainId 88888`, audit par un tiers (Code4rena solo,
OpenZeppelin Defender Audit, ou Trail of Bits short engagement). Budget cible
$8k-15k pour le périmètre actuel (FootballMatch + LiquidityPool + ChilizSwapRouter
+ StreamWallet). **Bloquant pour le mainnet, pas pour le beta testnet.**

#### 1.1.3 Rate limiting back
- `express-rate-limit` sur `/auth/*`, `/bets`, `/streams/*` (20 req/min/IP).
- Whitelist `/healthz` (uptime monitor).
- Whitelist webhook MediaMTX `/mediamtx/*` par secret `MEDIAMTX_PUBLISH_SECRET`.

### 1.2 CI/CD — GitHub Actions

Nouveau dossier `.github/workflows/` (absent aujourd'hui).

#### 1.2.1 `ci.yml` — sur chaque PR
```yaml
on: pull_request
jobs:
  lint-typecheck:
    steps:
      - pnpm install --frozen-lockfile
      - pnpm turbo run lint type-check
  test-domain:
    steps:
      - pnpm turbo run test --filter=@chiliztv/domain --filter=@chiliztv/shared
  test-backend:
    steps:
      - pnpm turbo run test --filter=backend
  test-contracts:
    steps:
      - forge test -vvv
  build:
    steps:
      - pnpm turbo run build
```

#### 1.2.2 `integration.yml` — sur `main` + nightly
Pour les tests L4 du plan testing matches (Anvil + Supabase local).
- Lance Anvil en service Docker, Supabase via supabase CLI.
- `pnpm test:integration` côté back.
- Allouer 15-20 min de timeout (Anvil + migrations + tests).

#### 1.2.3 `deploy-contracts.yml` — manuel + tagged release
- `workflow_dispatch` avec input `network: testnet | mainnet`.
- Step deploy Foundry signé via KMS (Phase 1.1.1 doit être merged).
- Commit auto-généré qui update `apps/smart-contracts/chiliz-tv/deployments/<network>.json`
  + push sur `main` via PAT — déclenche redeploy front+back avec les nouvelles
  adresses.

### 1.3 Déploiement — auto-deploy + safeguards

#### 1.3.1 Vercel front
- ✅ Acquis : preview deploys sur PR, prod sur `main`.
- À ajouter : **branch protection `main`** + required checks `ci.yml`.
- À ajouter : `Production Branch` lock — pas de force push sur `main`.
- Env vars sensibles (front) : `NEXT_PUBLIC_DYNAMIC_ENV_ID`, `NEXT_PUBLIC_BACKEND_URL`.
  Aucun secret backend dans Vercel.

#### 1.3.2 Render back
- ✅ Acquis : auto-deploy `main`, Web Service Starter $7/mo.
- À ajouter : **2 services Render** distincts :
  - `chiliztv-api` — Web Service, expose `/` Express, autoscale 1-2 instances.
  - `chiliztv-indexer` — Background Worker, lance le node process indexers
    (BettingMatchFactoryIndexer + BettingMatchEventIndexer + Pyth price feed)
    sans port exposé. **Critique** : aujourd'hui les indexers tournent dans le
    même process que le web → un crash du web tue l'indexation, et un timeout
    HTTP lent bloque les blocks ingérés.
- À ajouter : `preDeploy` script
  ```
  pnpm db:migrate && pnpm contracts:sync
  ```
  Garantit migrations Supabase appliquées avant que le web boot, et que les
  ABIs/adresses contracts sont fresh.
- À ajouter : healthcheck Render configuré sur `/healthz`.

#### 1.3.3 VPS MediaMTX
- ✅ Acquis : `infra/mediamtx/` + Caddy + Let's Encrypt.
- À ajouter : `infra/mediamtx/Makefile` avec targets `deploy`, `logs`, `restart`,
  `update` pour réduire les SSH manuels.
- À ajouter : **Ansible playbook minimal** dans `infra/mediamtx/playbook.yml` —
  installe docker, copie compose + config, ouvre UFW (1935 RTMP, 8888 HLS, 443
  Caddy), démarre. Idempotent. Permet de re-provisionner en cas de panne VPS.
- À ajouter : monitoring VPS (Hetzner/OVH Metrics → BetterStack ou Netdata Cloud).
- À ajouter : backup automatique `mediamtx-recordings` volume → S3 nightly
  (cron + `rclone`). Recordings = preuve de stream pour réclamations LP.

### 1.4 Observabilité — pour de vrai cette fois

| Layer | Outil | Coût | Pourquoi |
|---|---|---|---|
| Frontend errors | Sentry Free | $0 | Crashes Next.js + sourcemaps |
| Backend errors | Sentry Free | $0 | Exceptions Pino → Sentry transport |
| Logs structurés | BetterStack Free → upgrade $10/mo | $0-10 | 1 GB/mois free, 30 GB pour $10 |
| Uptime | BetterStack Uptime Free | $0 | 10 monitors, ping 1/min |
| Metrics back | Render Metrics built-in | $0 | CPU, memory, request rate |
| Metrics VPS | Netdata Cloud Free | $0 | docker stats + system metrics |
| RPC quotas | Custom Pino metrics → Grafana Cloud Free | $0 | Free tier : 10k metrics, 14j rétention |
| Indexer lag | Prometheus exporter custom → Grafana Cloud | $0 | block_head_lag, last_indexed_block, errors_per_block |

**Alertes critiques à configurer** (BetterStack ou Sentry alerts) :
- Indexer lag > 50 blocks (ChilizSpicy block time 3s → 2.5 min de retard)
- `/healthz` down > 2 min
- Sentry > 10 errors/min
- MediaMTX VPS unreachable > 1 min
- Supabase free tier > 80% (500 MB DB, 1 GB egress)

### 1.5 Backups — sérieusement cette fois

- Supabase : `pg_dump` quotidien → S3 (Backblaze B2 ou Cloudflare R2). $1/mo pour
  30j de rétention. Script `apps/backend/scripts/backup-supabase.sh` lancé par
  cron Render ou GitHub Actions scheduled workflow.
- MediaMTX recordings : `rclone` nightly → R2. Garder 7j.
- Smart contracts : pas de backup (immutable on-chain), mais snapshot des
  `deployments/*.json` versionné dans git.

---

## Phase 2 — Scale (mois +2 à +6)

Déclenché par : > 1000 utilisateurs actifs ou Supabase Free saturé ou Render
Starter saturé.

### 2.1 DB
- Migration Supabase Free → Supabase Pro ($25/mo) ou self-hosted Postgres.
  Pro débloque PITR 7j, daily backups managed, branching, 8 GB DB.
- Read replica si besoin (Phase 3).
- Connection pooler (PgBouncer) : déjà inclus côté Supabase.

### 2.2 Compute back
- Render Starter ($7) → Render Standard ($25) pour le web (2 GB RAM).
- Indexer Worker reste Starter sauf si block ingestion lag.
- Ajouter **Redis** (Upstash Free ou Render Redis $10) pour :
  - Cache API-Football (60s pré-match, 10 min match metadata)
  - Rate limiting distribué (vs in-memory aujourd'hui)
  - BullMQ pour jobs async (close markets, deploy contracts, resolve)

### 2.3 Compute front
- Vercel Hobby → Vercel Pro ($20/mo) si > 100 GB bandwidth/mois ou > 1M
  Edge function invocations.
- Alternative : self-host Next.js sur Render (Web Service Standard $25) — perd
  l'edge CDN, mais maîtrise costs.

### 2.4 Streaming
- VPS unique → 2 VPS load-balanced derrière Cloudflare avec `host: $stream_key`
  routing.
- Considérer Mux ou Cloudflare Stream si on dépasse 50 streamers simultanés
  (Mux ~$0.05/min de viewer, Cloudflare Stream $1/1000 min stocké + $1/1000 min
  delivered).

### 2.5 RPC Chiliz
- Public RPC `https://spicy-rpc.chiliz.com` throttle ~50 req/s — déjà serré
  même en beta.
- Migration vers RPC dédié : Ankr, Tatum, ou self-hosted node. Pour beta on
  reste public RPC, en Phase 2 on prévoit ~$50-100/mo pour un RPC dédié.

---

## Phase 3 — Production grade (mainnet)

Déclenché par : déploiement contracts mainnet `chainId 88888`.

### 3.1 Sécurité renforcée
- Audit smart contracts terminé + remediation merged.
- KMS multi-region replication.
- Multisig sur les fonctions admin (close markets, resolve, upgrade UUPS).
  → Gnosis Safe + threshold 2/3 sur Chiliz mainnet.
- Pause guardian role distinct de l'admin (incident response).
- Bug bounty Immunefi (budget 1% TVL min).

### 3.2 SRE
- SLO formels : 99.5% uptime back, 99.9% front (Vercel l'offre déjà).
- Runbook par incident class dans `docs/runbooks/` :
  - DB down
  - Indexer lag
  - RPC outage
  - MediaMTX VPS down
  - Stuck transaction (cf. `cancel-stuck-txs.ts` qui existe déjà)
  - Compromised admin key
- On-call rotation si > 1 dev backend.
- Postmortem template + culture blameless.

### 3.3 Compliance
- KYC/AML wrapper côté wallet (Sumsub ou Persona) si juridiction l'exige.
- Geo-blocking US + sanctioned countries via Cloudflare WAF.
- Logs immuables (Datadog Audit ou self-hosted SIEM).

---

## Mapping coûts par phase

| Item | Phase 0 (beta, 10 users) | Phase 1 (MVP, 100-500) | Phase 2 (scale, 1k-10k) | Phase 3 (mainnet) |
|---|---|---|---|---|
| Vercel | $0 (Hobby) | $0-20 (Pro si bandwidth) | $20 (Pro) | $20-150 (Team) |
| Render web | $7 (Starter) | $7 (Starter) | $25 (Standard) | $85 (Pro) |
| Render indexer worker | — | $7 (Starter) | $7-25 | $25 (Standard) |
| Render Redis | — | — | $10 | $30 |
| Supabase | $0 (Free) | $0 (Free) | $25 (Pro) | $599 (Team) |
| MediaMTX VPS | $5 (Hetzner CX22) | $5-7 | $14 (CCX13 x2 LB) | $50+ ou Mux |
| AWS KMS | — | $1 | $1 | $1-5 |
| Sentry | $0 | $0 (Free 5k errors) | $26 (Team) | $80 (Business) |
| BetterStack logs+uptime | $0 | $10 | $25 | $90 |
| Backup storage R2/B2 | $1 | $2 | $5 | $20 |
| API-Football | $19 (Basic) | $19 (Basic) | $49 (Pro) | $129 (Ultra) |
| RPC dédié | $0 (public) | $0 (public) | $50 (Ankr) | $200 (Ankr Pro) |
| Domaine | $1/mo (annualisé) | $1 | $1 | $1 |
| Cloudflare | $0 | $0 | $20 (Pro) | $200 (Business) |
| **Total /mo** | **~$33** | **~$45-55** | **~$251** | **~$1410** |

---

## Dépendances avec les plans en flight

Ordre d'exécution recommandé (DAG) :

```
                  ┌─────────────────────────────┐
                  │ Plan testing matches L1-L4  │
                  │ (IClock port + fixtures)    │
                  └──────────────┬──────────────┘
                                 │ IClock disponible
                                 ▼
        ┌────────────────────────────────────────┐
        │ Plan no-live-betting (4 couches)        │
        └──────────────┬─────────────────────────┘
                       │ BettablePolicy en place
                       ▼
        ┌────────────────────────────────────────┐
        │ Plan bet-label fix (selectionToBetLabel)│
        └──────────────┬─────────────────────────┘
                       │ market_events.line enrichi
                       ▼
        ┌────────────────────────────────────────┐
        │ Plan contracts integration full         │
        └──────────────┬─────────────────────────┘
                       │
                       ▼
  ┌──────────────────────────────────────────────────┐
  │ DevOps Phase 1 — KMS + CI/CD + Sentry + Render   │
  │ split web/worker                                  │
  └──────────────────────────────────────────────────┘
                       │
                       ▼
  ┌──────────────────────────────────────────────────┐
  │ Audit smart contracts → DevOps Phase 3 mainnet   │
  └──────────────────────────────────────────────────┘
```

Plans front (pagination dashboard, stream lifecycle hardening, leaderboard
coming soon, redesigns) sont **orthogonaux** à la pipeline DevOps — ils
mergent quand ils sont prêts, sans bloquer le DevOps plan.

---

## Risques majeurs (review v2)

| # | Risque | Sévérité | Mitigation |
|---|---|---|---|
| R1 | `ADMIN_PRIVATE_KEY` toujours en clair dans Render env | **Critique** | Phase 1.1.1 KMS — bloquant pour mainnet |
| R2 | Indexers et web dans le même process Render Starter | **Élevé** | Phase 1.3.2 split en 2 services Render |
| R3 | Supabase Free pas de PITR + pas de backups managés | Élevé | Phase 0.A backup quotidien manuel → Phase 2.1 Supabase Pro |
| R4 | RPC public ChilizSpicy throttle 50 req/s | Moyen (beta) → Élevé (scale) | Phase 2.5 RPC dédié Ankr |
| R5 | MediaMTX VPS single point of failure pour le streaming | Moyen | Phase 2.4 2-VPS LB ou managé Mux/Cloudflare Stream |
| R6 | Pas de CI/CD → drift quality et merge de regressions | Élevé | Phase 1.2 `ci.yml` GitHub Actions |
| R7 | Sentry absent = crashes invisibles côté prod | Élevé | Phase 0.C install immédiat |
| R8 | Pas de rollback documenté | Moyen | Phase 0.F runbook |
| R9 | Migrations Supabase appliquées manuellement | Moyen | Phase 1.3.2 preDeploy Render hook |
| R10 | Pas de monitoring indexer lag | Élevé | Phase 1.4 Grafana Cloud metrics custom |

---

## Action items immédiats (cette semaine)

1. **Installer Sentry** front + back (3h) — `0.C`
2. **Endpoint `/healthz`** + BetterStack Uptime monitor (1h) — `0.D`
3. **Backup Supabase nightly** (script + GitHub Actions scheduled) (2h) — `0.A`
4. **Runbook rollback** dans `docs/runbook-rollback.md` (2h) — `0.F`
5. **GitHub Actions `ci.yml`** lint + type-check + test minimal (4h) — `1.2.1`
6. **Branch protection `main`** + required checks (15 min) — `1.3.1`

Total : ~12h de travail pour fermer les 6 plus gros gaps Phase 0 + démarrer
Phase 1. Tout le reste de Phase 1 (KMS, indexer split, Render preDeploy) peut
attendre que les plans en flight (testing matches, no-live-betting, bet-label,
contracts integration) mergent — sinon on refactore deux fois.

---

## Décisions ouvertes à confirmer

1. **VPS streaming** : rester sur Hetzner CX22 ou migrer OVH VPS Value ? (cf.
   conversation passée — choix prix/perf équivalent, préférence personnelle).
2. **Audit smart contracts** : Code4rena solo (~$8k, 1-2 semaines) vs OZ Defender
   ($12k+, 3 semaines) vs ToB short engagement ($15k+, 4 semaines). Recommandation
   beta-friendly : Code4rena solo + Cantina secondary review communautaire.
3. **KMS provider** : AWS KMS ($1/mo + per-sig) vs Fireblocks (entreprise,
   ~$1k/mo) vs Lit Protocol (Web3-native, gratuit en beta). Reco : AWS KMS pour
   commencer, Fireblocks Phase 3 si volume justifie.
4. **Cloudflare** devant Vercel/Render ? Aujourd'hui CNAME direct → Vercel/Render
   gèrent leur edge eux-mêmes. Mettre Cloudflare devant casserait `apex →
   Vercel` (besoin de Cloudflare Workers ou flatten CNAME apex). À garder pour
   Phase 2 si on a besoin du WAF.

Dernière mise à jour : 2026-05-12.
