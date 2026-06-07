# Setup local — backend dev

Guide étape par étape pour lancer le backend Betcast en local avec Redis et Supabase isolés de staging/prod.

Document généré le 16 mai 2026.

## TL;DR — la commande à retenir

Une fois le setup initial fait, ta seule commande quotidienne pour démarrer le stack complet :

```bash
pnpm dev:local
```

Cette commande enchaîne automatiquement Supabase + Redis + doctor + backend Node. Idempotente : si quelque chose est déjà up, c'est skip instantané. Tu peux relancer autant de fois que tu veux entre deux `Ctrl+C`.

## Sommaire

1. [Prérequis machine](#section-1--prérequis-machine)
2. [Installation initiale (une fois)](#section-2--installation-initiale)
3. [Configuration du fichier .env.local](#section-3--configuration-du-fichier-envlocal)
4. [Workflow quotidien](#section-4--workflow-quotidien)
5. [Inspection et debug](#section-5--inspection-et-debug)
6. [Reset et nettoyage](#section-6--reset-et-nettoyage)
7. [Troubleshooting](#section-7--troubleshooting)
8. [Architecture du setup local](#section-8--architecture-du-setup-local)

---

## SECTION 1 — Prérequis machine

Vérifier que ces 4 outils sont installés avant de continuer.

### 1.1 Outils requis

| Outil | Version cible | Installation Mac |
|---|---|---|
| Docker Desktop ou OrbStack | ≥ 4.x ou OrbStack récent | `brew install --cask docker` (ou orbstack.dev) |
| pnpm | 10.28.1 exactement | `corepack enable && corepack prepare pnpm@10.28.1 --activate` |
| Node.js | 22 LTS | `brew install node@22` (ou via nvm) |
| Supabase CLI | ≥ 1.155 (pour migrations_path) | `brew install supabase/tap/supabase` |

### 1.2 Vérification rapide

Lance ces commandes dans un terminal pour valider l'install :

```bash
docker --version          # Docker version 24.x ou +
pnpm --version            # 10.28.1
node --version            # v22.x
supabase --version        # 1.155+ ou similaire
```

Si une de ces commandes retourne `command not found` ou une version incompatible, corrige avant de passer à la suite.

### 1.3 Cas particuliers

- **OrbStack vs Docker Desktop** — OrbStack est plus léger et plus rapide. Compatible 100% Docker CLI. Recommandé sur Mac silicon.
- **Windows** — `git config core.symlinks=true` requis avant le clone si tu pars sur le fallback symlink des migrations. Sur Mac/Linux aucune config particulière.
- **Pas de pré-requirement Anvil ou Foundry** — uniquement nécessaire pour les tests d'intégration L4 (`ci-integration.yml`). Pas pour le dev quotidien.

---

## SECTION 2 — Installation initiale

À faire une seule fois après le clone du repo. Étapes dans l'ordre, ne pas sauter.

### 2.1 Cloner et installer les dépendances

```bash
cd ~/Documents/Chiliz-hacking/chiliztv.com   # ou ton path
pnpm install
```

Première install : ~3-5 minutes (toutes les apps et packages du monorepo).

### 2.2 Démarrer Supabase pour la première fois

```bash
pnpm dev:supabase:start
```

Premier run uniquement : pull des images Docker Supabase (~2 GB, 3-5 min selon ton réseau). Sois patient, c'est une seule fois. Les démarrages suivants sont quasi instantanés.

À la fin tu verras quelque chose comme :

```
Started supabase local development setup.
         API URL: http://127.0.0.1:54321
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: <JWT token affiche par la CLI>
service_role key: <JWT token affiche par la CLI>
```

Note — Studio est désactivé par défaut dans `config.toml` à cause d'une limitation Docker File Sharing sur certains setups Mac. Pour le réactiver, voir Section 5.1.

### 2.3 Appliquer les 21 migrations

```bash
pnpm dev:supabase:reset
```

Cette commande drop la DB locale, la recrée, et rejoue les 21 migrations dans `apps/backend/src/infrastructure/database/migrations/` (depuis `000_init_schema.sql` jusqu'à `020_bets_realtime.sql`).

À refaire à chaque fois que tu veux un état propre, ou quand une nouvelle migration apparaît côté git.

### 2.4 Démarrer Redis

```bash
pnpm dev:redis:start
```

Lance le conteneur `betcast-redis-local` via `compose.local.yml`. ~5 secondes pour pull l'image `redis:7.4-alpine` la première fois.

### 2.5 Vérifier que tout est OK

```bash
pnpm dev:doctor
```

Tu dois voir :

```
[OK  ] Redis local (127.0.0.1:6379)
[OK  ] Supabase API (127.0.0.1:54321)
[OK  ] Supabase DB (127.0.0.1:54322)
All local services are up. You can run `pnpm dev:local` safely.
```

Si une ligne est DOWN, le script t'indique la commande de fix à lancer. Reviens à l'étape correspondante.

### 2.6 Préparer le fichier .env.local

Étape critique. Détaillée dans la Section 3 entièrement — passe directement à la suite.

---

## SECTION 3 — Configuration du fichier .env.local

### 3.1 Comment ça marche : .env vs .env.local

Le script `pnpm dev:local` utilise `dotenv-cli` avec deux fichiers chargés dans l'ordre :

```bash
dotenv -e .env.local -e .env -- pnpm dev
```

Mécanique :

- `.env.local` est chargé **en premier** — ses valeurs gagnent. C'est là que tu mets tout ce qui est local-only.
- `.env` est chargé **en second** — il fournit les valeurs qui ne changent pas entre local et staging (par exemple `API_FOOTBALL_KEY`, `ALLOWED_ORIGINS`, contracts addresses).

Conséquence pratique : tu ne mets dans `.env.local` QUE ce qui diffère du staging. Tout le reste reste dans ton `.env` existant.

### 3.2 Récupérer les credentials Supabase locaux

```bash
pnpm dev:supabase:env
```

Cette commande affiche quelque chose comme :

```
ANON_KEY="<JWT token affiche par la CLI>"
API_URL="http://127.0.0.1:54321"
DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
SERVICE_ROLE_KEY="<JWT token affiche par la CLI>"
```

Note — Supabase CLI utilise les noms `ANON_KEY` / `SERVICE_ROLE_KEY` / `API_URL`. Dans `.env.local` tu dois les renommer en `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_URL` — c'est ce que le schéma Zod du backend attend.

### 3.3 Générer les secrets locaux

`JWT_SECRET` et `ACCESS_CODE_COOKIE_SECRET` doivent être différents de staging pour ne pas signer des tokens valides cross-environnement. Génère deux valeurs :

```bash
openssl rand -base64 48    # pour JWT_SECRET
openssl rand -base64 32    # pour ACCESS_CODE_COOKIE_SECRET
```

Copie les deux sorties, tu vas les coller dans 3.4.

### 3.4 Contenu exact de apps/backend/.env.local

Crée le fichier `apps/backend/.env.local` avec exactement ce contenu (en remplaçant les anon/service_role keys par celles affichées par `pnpm dev:supabase:env`, et les deux secrets générés par `openssl`) :

```bash
# Local-only overrides for `pnpm dev:local`
# Loaded BEFORE .env via dotenv-cli; values here win over .env staging.

NODE_ENV=development
LOG_LEVEL=debug

# Supabase local (recupere via `pnpm dev:supabase:env`)
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=<ANON_KEY de `pnpm dev:supabase:env`>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY de `pnpm dev:supabase:env`>

# Redis local (compose.local.yml)
REDIS_URL=redis://localhost:6379

# JWT local-only - distinct from staging
JWT_SECRET=<colle la sortie de `openssl rand -base64 48`>
JWT_ISSUER=betcast-local

# Cookie secret local-only - distinct from staging
ACCESS_CODE_COOKIE_SECRET=<colle la sortie de `openssl rand -base64 32`>
```

### 3.5 Ce qui reste dans .env (staging) et qui n'a pas besoin d'être dupliqué

Le fichier `.env` qui existe déjà côté backend contient des valeurs partagées local + staging. Ne les recopie PAS dans `.env.local` :

- `API_FOOTBALL_KEY`
- `ALLOWED_ORIGINS`
- Contracts addresses : `BETTING_MATCH_FACTORY_ADDRESS`, `STREAM_WALLET_FACTORY_ADDRESS`, `CHILIZ_SWAP_ROUTER_ADDRESS`, `LIQUIDITY_POOL_PROXY`, `USDC_ADDRESS`, `WCHZ_ADDRESS`
- `NETWORK=testnet`
- `CHILIZ_RPC_URL`
- `PYTH_CHZ_PRICE_FEED_ID`
- `PRICE_FEED_JOB_INTERVAL_MS`
- `INDEXER_DEFAULT_LOOKBACK`
- `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_STREAM_API_TOKEN`, `CLOUDFLARE_STREAM_WEBHOOK_SECRET`, `CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN`
- `JWT_EXPIRY`
- `ACCESS_CODE_HASH` (vide en local si tu veux désactiver la gate)
- `PORT`

Le backend lira ces valeurs depuis `.env` automatiquement. Tu n'as à toucher à ce fichier que si tu changes ta config staging.

---

## SECTION 4 — Workflow quotidien

### 4.1 La commande à retenir

```bash
pnpm dev:local
```

Une seule commande, à lancer depuis la racine du repo. Ce qu'elle fait, dans l'ordre :

1. `supabase start` — démarre la stack Supabase si pas déjà up. Idempotent : skip instantané si déjà up.
2. `docker compose -f compose.local.yml up -d redis` — démarre Redis si pas déjà up. Idempotent.
3. `node scripts/dev-doctor.mjs` — probe TCP sur les 3 ports critiques. Fail fast si quelque chose ne répond pas.
4. `dotenv -e .env.local -e .env -- pnpm dev` — lance le backend Node avec les deux fichiers env chargés.

### 4.2 Logs attendus au boot

Dans le terminal qui lance `pnpm dev:local`, tu dois voir successivement :

```
Redis connecting host=localhost port=6379
Redis ready
Cache warmup starting
Cache warmup finished
Listening on port 3001
```

Si `Redis ready` n'apparait pas et que tu vois `Redis not configured (REDIS_URL empty or unset)`, c'est que ton `.env.local` n'a pas été chargé correctement. Vérifie qu'il existe bien dans `apps/backend/.env.local` (pas à la racine du repo).

### 4.3 Arrêter

Deux semantics distinctes selon ce que tu veux faire :

- **`Ctrl+C`** dans le terminal qui tourne — arrête uniquement le backend Node. Redis et Supabase continuent à tourner en background — pratique si tu veux relancer `pnpm dev:local` 5 secondes plus tard.
- **`pnpm dev:stop`** — arrête tout : Redis container + stack Supabase complète. À utiliser quand tu fermes ta session de dev.

Note — Tant que Redis et Supabase tournent en background, ils consomment ~500 Mo de RAM et un peu de CPU. Sur un Mac avec 16 Go c'est négligeable. Sur 8 Go fais `pnpm dev:stop` entre les sessions longues.

### 4.4 Cas particuliers

- **Relancer juste le backend sans toucher au stack** — `Ctrl+C` puis `pnpm dev:local`. Idempotence absorbée.
- **Backend qui crash silencieusement** — vérifie les logs au boot — un `Missing env var X` explicite te dit ce qui manque dans `.env.local`.
- **Tester avec Redis désactivé (mode NoopCacheService)** — commente la ligne `REDIS_URL=` dans `.env.local`, relance. Tu verras `Redis not configured ... running without distributed cache/locks` au boot.

---

## SECTION 5 — Inspection et debug

### 5.1 Supabase Studio

Studio est désactivé par défaut dans `apps/backend/supabase/config.toml` à cause d'une limitation Docker File Sharing : il monte `~/Documents/.../supabase/snippets/` et Docker rejette le mount si ce path n'est pas dans la liste File Sharing.

Pour réactiver Studio :

1. Docker Desktop → Settings → Resources → File Sharing → ajouter le path du repo (par exemple `/Users/<toi>/Documents/Chiliz-hacking`).
2. Apply & Restart Docker.
3. Dans `apps/backend/supabase/config.toml` passer `[studio] enabled = true`.
4. `pnpm dev:supabase:stop && pnpm dev:supabase:start` pour redémarrer la stack avec Studio activé.

Studio sera ensuite accessible sur `http://127.0.0.1:54323` (table editor, SQL editor, auth users, storage, logs).

### 5.2 Inspecter Redis

```bash
pnpm dev:redis:cli                       # shell redis-cli interactif
pnpm dev:redis:cli KEYS 'development:*'  # liste toutes les cles cachees
pnpm dev:redis:cli MONITOR               # stream LIVE des commandes (Ctrl+C pour sortir)
```

MONITOR est extrêmement utile pour comprendre ce que ton code tape sur Redis en temps réel pendant que tu cliques dans le frontend ou que tu appelles des endpoints depuis curl. Désactive dès que tu as compris, ça impacte les perfs.

### 5.3 Inspecter Supabase Postgres

Sans Studio, tu peux toujours te connecter en psql direct :

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
\dt                                       # liste les tables
SELECT * FROM matches LIMIT 5;
\q                                        # quitter
```

### 5.4 Doctor health probe

```bash
pnpm dev:doctor
```

À utiliser dès que tu doutes de l'état du stack. Probe TCP sur 6379, 54321, 54322. Si tout est UP, tu peux lancer `pnpm dev:local` sans souci. Sinon, le script te dit quelle commande lancer pour fixer.

### 5.5 Logs du backend

Le backend tourne en mode `pnpm dev` (tsx watch) avec Pino structured logs. Si tu veux pretty-print les JSON lines :

```bash
pnpm dev:local | pnpm exec pino-pretty
```

À utiliser uniquement en dev — en CI / staging on garde les JSON pour ingestion par les log aggregators.

---

## SECTION 6 — Reset et nettoyage

### 6.1 Tout reset d'un coup

```bash
pnpm dev:reset
```

Cette commande enchaîne :

- Arrête le stack (Redis + Supabase).
- Lance `supabase db reset` (drop la DB locale, recrée, rejoue les 21 migrations).
- Flush complètement Redis (`FLUSHDB`).

À utiliser quand tu veux un état totalement propre — par exemple après avoir testé une feature qui a pollué ta DB, ou après un `git pull` qui amène de nouvelles migrations.

### 6.2 Reset granulaire

```bash
pnpm dev:supabase:reset      # drop + recree DB seulement
pnpm dev:redis:flush         # FLUSHDB sur Redis seulement
pnpm dev:stop                # stop tout le stack sans wipe
```

### 6.3 Quand pnpm dev:reset ne suffit pas

Cas rares où la reset complète demande de nuke les conteneurs Docker :

- **Image Supabase corrompue après upgrade Supabase CLI** — `supabase stop --no-backup` puis `supabase start` re-pull les images.
- **Conteneur Redis dans un état bizarre** — `docker rm -f betcast-redis-local` puis `pnpm dev:redis:start`.
- **Port 54321 ou 6379 occupé par un autre processus** — `lsof -i :54321` pour identifier le coupable, puis `kill` ou changer le port dans `config.toml`/`compose.local.yml`.

---

## SECTION 7 — Troubleshooting

### 7.1 Symptômes et solutions

| Symptôme | Cause probable | Fix |
|---|---|---|
| `Redis not configured ... NoopCacheService` dans les logs | `REDIS_URL` absent dans `.env.local` ou `.env.local` pas chargé | Vérifier `apps/backend/.env.local` existe et contient `REDIS_URL=redis://localhost:6379` |
| `Missing Supabase environment variables` au boot | `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` absents | `pnpm dev:supabase:env` et coller les valeurs renommées (préfixe `SUPABASE_`) dans `.env.local` |
| Doctor renvoie Supabase DOWN mais Redis UP | Stack Supabase arrêtée ou crashée | `pnpm dev:supabase:start` puis re-`pnpm dev:doctor` |
| Backend crashe au boot avec `EADDRINUSE port 3001` | Une autre instance du backend tourne déjà | `lsof -i :3001` puis `kill -9 <pid>`, ou changer `PORT` dans `.env` |
| `supabase start: port 54321 already in use` | Une stack Supabase d'un autre projet tourne | Aller dans l'autre projet faire `supabase stop`, ou changer les ports dans `apps/backend/supabase/config.toml` |
| `Cache warmup finished warmed=0` mais pas d'erreur | Stack vide post-reset, les loaders trouvent rien (matches, prices, apy) | Comportement attendu sans seed. Pas un bug — pas d'inquiétude. |
| Studio ne démarre pas (file sharing error) | Path du repo pas dans Docker File Sharing | Section 5.1 — désactivé par défaut justement pour éviter ce cas |
| `pnpm dev:supabase:reset` échoue sur une migration | Migration cassée ou conflit FK | Vérifier la migration la plus récente — généralement c'est celle qu'on vient d'ajouter |
| Windows : migrations introuvables après reset | Symlink ignoré par git sans `core.symlinks=true` | `git config core.symlinks true` puis re-clone, ou copier les .sql manuellement |

### 7.2 Logs utiles pour debug

```bash
docker logs betcast-redis-local                  # logs Redis
docker logs -f betcast-redis-local               # tail live
supabase logs                                     # logs combines Supabase stack
pnpm dev:doctor                                   # snapshot sante
```

### 7.3 Quand rien ne marche : nuclear reset

Procédure de dernier recours qui repart vraiment de zéro :

```bash
pnpm dev:stop
docker rm -f betcast-redis-local                 # purge container Redis
cd apps/backend
supabase stop --no-backup                         # purge volumes Supabase
cd ../..
pnpm install                                      # re-install au cas ou
pnpm dev:supabase:start                           # re-pull images si necessaire
pnpm dev:supabase:reset
pnpm dev:redis:start
pnpm dev:doctor                                   # check tout vert
pnpm dev:local
```

---

## SECTION 8 — Architecture du setup local

### 8.1 Qui tourne où

| Composant | Où ça tourne | Géré par |
|---|---|---|
| Backend Node (Express + tsyringe) | Host (ton Mac directement) | `pnpm dev:local` + tsx watch |
| Redis 7.4-alpine | Container Docker `betcast-redis-local` | `compose.local.yml` |
| Supabase stack (Postgres + Realtime + Auth + Storage + GoTrue + PostgREST + Edge runtime) | 6-7 containers Docker | Supabase CLI native (`supabase start`) |
| Supabase Studio (optionnel) | Container Docker | Supabase CLI, désactivé par défaut |

### 8.2 Flux de données local

Quand tu cliques quelque part dans le frontend (port 3000) ou que tu tapes un endpoint du backend (port 3001) :

Frontend → `http://localhost:3001/...` → Backend Node → Redis (cache hit / miss) → Supabase Postgres (si miss) → réponse remontée → Redis populé pour la prochaine fois → réponse au frontend.

Côté backend, les jobs cron (`SyncMatchesJob`, `ComputeApyJob`, etc.) tournent en parallèle si `PROCESS_ROLE=all` ou `PROCESS_ROLE=worker`. Ils écrivent dans Supabase et acquièrent leurs locks Redis.

### 8.3 Ports utilisés

| Port | Service | Origine |
|---|---|---|
| 3001 | Backend Node (HTTP) | Configurable via `PORT` dans `.env` |
| 6379 | Redis | `compose.local.yml` (`betcast-redis-local`) |
| 54321 | Supabase API gateway (PostgREST) | Supabase CLI default |
| 54322 | Supabase Postgres direct | Supabase CLI default |
| 54323 | Supabase Studio (si activé) | Supabase CLI default |
| 54324 | Inbucket (mock email) | Supabase CLI default |

### 8.4 Isolation staging et prod

Rien dans ce setup local ne touche staging ou prod. Spécifiquement :

- **Supabase staging** (`lhbtdgftstuvfrqunjzl`) et **prod** (`uofqrnrclomfhrybbxkf`) — ne sont jamais accédés tant que `SUPABASE_URL` dans `.env.local` pointe sur `127.0.0.1:54321`.
- **Upstash Redis staging** — non touché tant que `REDIS_URL` dans `.env.local` pointe sur `localhost:6379`.
- **Cloudflare Stream** — les credentials côté `.env` peuvent être ceux du compte CF Stream staging mais les ingest tests ne se font pas tout seuls — il faut pousser un stream RTMP réel pour activer ces flows.
- **Smart contracts Chiliz Spicy testnet** — le backend les lit en lecture, ce qui est gratuit. Pas de transaction signée sans `ADMIN_PRIVATE_KEY` explicitement set en local (vide par défaut dans `.env.local`).

### 8.5 Référence rapide des commandes

| Commande | Effet |
|---|---|
| `pnpm dev:local` | Tout démarrer + backend |
| `pnpm dev:stop` | Tout arrêter |
| `pnpm dev:reset` | Tout reset (DB + Redis) |
| `pnpm dev:doctor` | Health check stack local |
| `pnpm dev:supabase:start` | Démarrer Supabase seul |
| `pnpm dev:supabase:reset` | Reset DB + replay migrations |
| `pnpm dev:supabase:env` | Afficher les credentials locaux |
| `pnpm dev:supabase:stop` | Stopper Supabase seul |
| `pnpm dev:redis:start` | Démarrer Redis seul |
| `pnpm dev:redis:flush` | FLUSHDB Redis (vider cache) |
| `pnpm dev:redis:cli` | Shell interactif redis-cli |
| `pnpm dev:redis:logs` | Tail logs Redis |
