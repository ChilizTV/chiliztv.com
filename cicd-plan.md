# CI/CD + Versioning + Split landing/app — ChilizTV

> Document de pilotage technique.

---

## 1. Pré-requis & setup one-shot

### 1.1 Branch protection `main`

La branche `main` est configurée dans les settings GitHub du repo `chiliztv/chiliztv` (org dédiée) avec les règles suivantes :

- Pull request obligatoire avant tout merge (aucun push direct).
- Status checks requis : `lint`, `typecheck`, `test-unit`, `build-frontend`, `build-backend`, `docker-build-verify`, `secret-scan`. Tous les checks doivent être verts.
- Au moins une review approuvée par un mainteneur.
- Aucun force-push.
- Historique linéaire : rebase merge uniquement.
- Squash merge comme méthode par défaut. Le setting "Default commit message for squash merging" est positionné sur "Pull request title and description" — cela garantit que le titre de PR, validé par commitlint, atterrit comme première ligne du commit sur `main` et est parsé correctement par release-please.

Il n'y a pas de branche `staging` longue durée. `main` joue le rôle de staging : un push sur `main` déclenche les déploiements staging. Un tag annoté `vX.Y.Z` déclenche `release.yml` qui promeut en production.

### 1.2 Environnements GitHub

Deux environnements sont créés dans Settings > Environments :

- **`staging`** : aucun reviewer requis. Contient les secrets pointant vers les ressources staging (Fly.io apps staging, Supabase staging project ref, Vercel preview tokens).
- **`production`** : reviewer requis `@antonyloussararian`. Contient les secrets prod séparés. Tout job qui cible l'environnement `production` est mis en attente jusqu'à approbation manuelle.

### 1.3 Sous-domaines staging

Les enregistrements DNS suivants sont à créer dans le dashboard Cloudflare avant J6. Responsable : `@antonyloussararian`. Tous en proxy orange.

- `api-staging.chiliztv.com` — CNAME vers `chiliztv-api-staging.fly.dev` (app Fly.io staging de l'API)
- `workers-staging.chiliztv.com` — CNAME vers `chiliztv-workers-staging.fly.dev` (app Fly.io staging des workers)
- `app-staging.chiliztv.com` — optionnel ; Vercel attribue une URL preview automatique (ex. `chiliztv-frontend-git-main.vercel.app`) suffisante pour la beta

### 1.4 Secrets GitHub

La table ci-dessous est exhaustive. Les secrets sont créés dans Settings > Secrets and variables > Actions. Les secrets scoped `staging` ou `production` sont créés dans l'onglet de l'environnement correspondant.

| Nom exact | Scope | Source | Durée de vie | Rotation |
|---|---|---|---|---|
| `VERCEL_TOKEN` | production env | Vercel > Settings > Tokens (Create token) | 90 j | Manuelle, rappel calendrier |
| `VERCEL_ORG_ID` | tous | Vercel > Settings > General > Your ID | Permanent | Sur renommage de l'org |
| `VERCEL_PROJECT_ID_APP` | tous | Vercel > Project > Settings > General > Project ID | Permanent | Sur suppression/recréation du projet |
| `FLY_API_TOKEN` | staging + production envs | Fly.io > Account > Access Tokens — préférer OIDC (voir §6) | 90 j | Manuelle |
| `CLOUDFLARE_API_TOKEN` | tous | CF > My Profile > API Tokens — scope `Cloudflare Pages:Edit` + `Zone DNS:Edit` | 90 j | Manuelle |
| `CLOUDFLARE_ACCOUNT_ID` | tous | CF > Overview (colonne droite) | Permanent | Sur changement de compte |
| `CF_PAGES_PROJECT_NAME` | tous | Valeur littérale : `chiliztv-landing` | Permanent | Sur renommage du projet CF Pages |
| `SUPABASE_ACCESS_TOKEN` | production env | Supabase > Account > Access Tokens > Generate new token | 90 j | Manuelle |
| `SUPABASE_PROJECT_REF` | production env | Supabase > Project > Settings > General > Reference ID | Permanent | Sur re-création du projet |
| `SUPABASE_DB_PASSWORD` | production env | Supabase > Project > Settings > Database > Database password | 90 j | Manuelle |
| `SUPABASE_PROJECT_REF_STAGING` | staging env | Référence du projet Supabase staging | Permanent | Sur re-création |
| `TURBO_TOKEN` | tous | Vercel > Remote Cache > Team settings > Remote caching token | 90 j | Manuelle |
| `TURBO_TEAM` | tous | Nom de l'équipe Vercel (valeur littérale, ex. `chiliztv`) | Permanent | Sur renommage |
| `DISCORD_WEBHOOK_URL` | production env | Discord > Server settings > Integrations > Webhooks > Copy URL | Permanent | Sur suppression du channel |
| `SENTRY_AUTH_TOKEN` | tous | Sentry > Settings > Auth Tokens > Create new token | 90 j | Manuelle |
| `GITLEAKS_LICENSE` | tous | gitleaks.io — optionnel, la version OSS gratuite ne requiert pas de token | Annuel | Annuel |

GHCR (GitHub Container Registry) est alimenté par le `GITHUB_TOKEN` automatique de chaque workflow, avec la permission `packages: write` accordée au niveau du job. Aucun PAT distinct n'est requis.

### 1.5 Turbo Remote Cache

Remote Cache est activé via Vercel : Settings > Remote Cache > Enable. Les variables `TURBO_TOKEN` et `TURBO_TEAM` sont ajoutées comme secrets GitHub (table ci-dessus). Chaque workflow qui exécute `pnpm build` ou `pnpm lint` bénéficie du cache automatiquement si ces variables sont présentes.

### 1.6 Renovate

Renovate est installé comme GitHub App sur l'org `chiliztv` (pas de workflow custom — App native). Un fichier `renovate.json` est committé à la racine du repo (créé en J3). La config prévoit :

- Schedule : lundi 06:00 UTC.
- Groupes par écosystème : React/Next.js, wagmi/viem, Dynamic Labs, OpenZeppelin, devDependencies.
- Pas d'auto-merge (mode conservateur pré-V1) : Renovate ouvre des PRs, l'équipe review et merge manuellement.
- Pas de Dependabot : Renovate est plus configurable pour pnpm et les monorepos.

### 1.7 Fichiers à créer (one-shot)

Les fichiers suivants sont créés lors des premiers jours du plan d'exécution (voir §8) :

- `CONTRIBUTING.md` (racine) — structure détaillée en §12
- `CHANGELOG.md` (racine) — vide, entête seul, géré par release-please
- `SECURITY.md` (racine) — responsible disclosure : email de contact + délai de réponse 48h
- `.github/CODEOWNERS` — mapping area → reviewer
- `.github/PULL_REQUEST_TEMPLATE.md` — checklist PR
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `renovate.json` (racine) — config Renovate committée

---

## 2. Conventions transverses

### 2.1 Nommage des workflows

Les fichiers dans `.github/workflows/` suivent le préfixe de leur rôle :

- `ci-*.yml` — checks de qualité (lint, tests, build). Aucun déploiement.
- `deploy-*.yml` — déploiements automatiques déclenchés par push sur `main`.
- `release-*.yml` — releases pilotées par un tag ou `workflow_dispatch`.
- `security-*.yml` — scans périodiques de sécurité.

### 2.2 Images Docker

L'image backend est taguée selon trois schémas dans GHCR :

- `ghcr.io/chiliztv/chiliztv-backend:<8-char-sha>` — toute image buildée à partir d'un commit
- `ghcr.io/chiliztv/chiliztv-backend:main` — alias mis à jour à chaque merge sur `main` (staging)
- `ghcr.io/chiliztv/chiliztv-backend:vX.Y.Z` — alias créé par `release.yml` lors d'une release prod

### 2.3 Versioning sémantique

SemVer strict : MAJOR.MINOR.PATCH. Règles de bump :

- MAJOR : changement non rétrocompatible d'API backend (suppression/renommage d'endpoint), changement de storage layout d'un contrat Solidity, ou migration de schéma DB non rétrocompatible.
- MINOR : nouvelle fonctionnalité (feat:), ou extension d'API non breaking.
- PATCH : correctif (fix:), chore:, docs:, perf:, test:, ci:.

Avant v1.0.0 : selon la convention SemVer, MINOR peut introduire des changements breaking — cette règle s'applique pendant la beta.

### 2.4 Tags git

Les tags sont annotés, préfixés `v` (ex. `v0.3.1`). Ils sont signés via deux mécanismes complémentaires, couvrant des artefacts différents :

- `gh attestation sign` (Sigstore keyless, OIDC GitHub Actions) : couvre la provenance du tag git et des release assets. Vérification via `gh attestation verify`.
- `cosign sign` keyless (OIDC GitHub Actions, Sigstore Rekor) : couvre l'intégrité de l'image OCI dans GHCR. Vérification via `cosign verify` avant tout déploiement prod.

Ces deux outils ne se substituent pas : `gh attestation` établit l'origine du code, `cosign` établit l'intégrité de l'image. Tous deux sont sans clé persistante (keyless OIDC).

### 2.5 Conventional Commits

Format strict : `type(scope): subject`

Types autorisés : `feat`, `fix`, `refactor`, `chore`, `docs`, `perf`, `test`, `ci`, `build`.

Scopes autorisés : `backend`, `frontend`, `landing`, `contracts`, `infra`, `docs`.

Le subject est en mode impératif, en anglais, < 72 caractères, sans point final. Exemple valide : `feat(backend): add PROCESS_ROLE env switch for worker isolation`.

Le titre de PR doit respecter ce format. Commitlint dans `ci-pr.yml` (via `@commitlint/config-conventional`) valide le titre de chaque PR.

### 2.6 Déclencheurs

Les workflows sont déclenchés par événements `paths`, jamais par inspection du contenu des messages de commit — sauf release-please qui parse les commits pour calculer le bump de version.

### 2.7 Labels PR

Labels créés sur le repo, obligatoires selon l'area touchée :

`area:backend`, `area:frontend`, `area:landing`, `area:contracts`, `area:infra`, `area:docs`, `breaking`, `migration` (schema DB), `release-skip` (n'apparaît pas dans le changelog).

### 2.8 Branch naming

- `feat/<scope>-<slug>` — nouvelle fonctionnalité
- `fix/<scope>-<slug>` — correctif
- `refactor/<scope>-<slug>` — refactor sans changement de comportement
- `chore/<scope>-<slug>` — tâche de maintenance
- `hotfix/<version>` — correctif d'urgence depuis le dernier tag prod
- `release/<version>` — créée automatiquement par release-please

---

## 3. Catalogue des workflows

### 3.1 `ci-pr.yml`

| Champ | Valeur |
|---|---|
| Nom fichier | `.github/workflows/ci-pr.yml` |
| Trigger | `pull_request` (opened, synchronize, reopened) toutes branches + `push` sur toutes branches hors `main` |
| Concurrency | `ci-pr-${{ github.ref }}`, cancel-in-progress: true |
| Permissions | `contents: read`, `pull-requests: write` (pour poster l'URL preview) |
| Environnement GitHub | aucun |
| Jobs | `lint`, `typecheck`, `test-unit`, `test-contracts` (conditionnel), `build-frontend`, `build-backend`, `docker-build-verify`, `secret-scan`, `audit`, `commitlint` |
| Étapes critiques | pnpm install frozen-lockfile → Turbo Remote Cache pull → lint (turbo) → typecheck (turbo) → vitest run (tous workspaces) → forge test -vvv (conditionnel, si paths `apps/smart-contracts/**` modifiés) → docker buildx build --target backend --load sans push → gitleaks detect → pnpm audit --prod → validation du titre de PR via commitlint |
| Cache | pnpm store (clé sur `pnpm-lock.yaml`), Turbo Remote Cache (`TURBO_TOKEN`/`TURBO_TEAM`), Docker buildx (type=gha) |
| Smoke tests post-deploy | N/A — aucun déploiement |
| Rollback | N/A |
| Durée cible | < 10 min |
| Idempotence | Safe — tous les jobs sont des vérifications sans effet de bord |

Le job `test-contracts` est conditionnel : il ne tourne que si la PR contient des modifications dans `apps/smart-contracts/**`. Il reprend la même logique que `apps/smart-contracts/.github/workflows/ci.yml` (existant) en l'intégrant au pipeline racine, et aligne la branche de référence sur `main` (la branche `beta_ready` de l'ancien workflow est retirée).

Après J4 (création de `apps/landing`), un job `build-landing` est ajouté en parallèle de `build-frontend`.

---

### 3.2 `ci-integration.yml`

| Champ | Valeur |
|---|---|
| Nom fichier | `.github/workflows/ci-integration.yml` |
| Trigger | `push main` + `schedule` nightly 02:00 UTC |
| Concurrency | `ci-integration-main`, cancel-in-progress: false (le nightly ne doit pas annuler un run déclenché par push) |
| Permissions | `contents: read` |
| Environnement GitHub | `staging` (pour accéder aux secrets Supabase staging) |
| Jobs | `setup-services` (Supabase CLI local + Anvil), `test-integration` (`pnpm test:integration` via `vitest.integration.config.ts`) |
| Étapes critiques | `supabase start` → spawn Anvil sur localhost:8545 (fork optionnel du RPC Spicy) → appliquer les migrations via `pnpm db:migrate` sur la DB locale → `pnpm test:integration` → `supabase stop` |
| Cache | pnpm store, Turbo Remote, cache Foundry artifacts (`~/.foundry`) |
| Smoke tests post-deploy | N/A |
| Rollback | N/A |
| Durée cible | < 20 min |
| Idempotence | Safe — services locaux éphémères, nettoyage automatique |

Ce workflow est maintenu séparé de `ci-pr.yml` car il est trop lent (Anvil fork + Supabase boot) pour tourner sur chaque PR. Le runbook de setup est documenté dans `apps/backend/docs/SMOKE_integration.md` (existant). Les scénarios L2 sont décrits dans `apps/backend/docs/SMOKE.md` (existant).

---

### 3.3 `deploy-api.yml`

| Champ | Valeur |
|---|---|
| Nom fichier | `.github/workflows/deploy-api.yml` |
| Trigger | `push main`, paths `apps/backend/**` ou `packages/**` |
| Concurrency | `deploy-api-staging`, cancel-in-progress: true |
| Permissions | `contents: read`, `packages: write`, `id-token: write` (OIDC Fly.io) |
| Environnement GitHub | `staging` |
| Jobs | `build-push` (Docker → GHCR), `deploy-staging` (flyctl rolling), `smoke` |
| Étapes critiques | docker buildx build --target backend → push `ghcr.io/chiliztv/chiliztv-backend:<sha>` et `:main` vers GHCR → `flyctl deploy --app chiliztv-api-staging --image <sha> --strategy rolling` → curl GET `https://api-staging.chiliztv.com/health` assert HTTP 200 + `{status: "ok"}`, timeout 30s |
| Cache | Docker buildx registry cache (manifest GHCR `type=registry`), pnpm store, Turbo Remote |
| Smoke tests post-deploy | `GET https://api-staging.chiliztv.com/health`, HTTP 200, corps JSON `{status: "ok"}` |
| Rollback | `flyctl releases rollback --app chiliztv-api-staging` |
| Durée cible | < 8 min |
| Idempotence | Safe — si le même sha est déjà en GHCR le buildx est un no-op ; flyctl détecte l'image déjà déployée |

---

### 3.4 `deploy-workers.yml`

| Champ | Valeur |
|---|---|
| Nom fichier | `.github/workflows/deploy-workers.yml` |
| Trigger | `push main`, paths `apps/backend/**` ou `packages/**` |
| Concurrency | `deploy-workers-staging`, cancel-in-progress: true |
| Permissions | `contents: read`, `packages: write`, `id-token: write` |
| Environnement GitHub | `staging` |
| Jobs | `wait-image` (vérifie que l'image `:sha` est disponible en GHCR avant de déployer, en cas d'exécution parallèle avec `deploy-api.yml`), `deploy-workers-staging` (flyctl immediate) |
| Étapes critiques | Attend la disponibilité de l'image `:sha` → `flyctl deploy --app chiliztv-workers-staging --image <sha> --strategy immediate` → curl GET `https://workers-staging.chiliztv.com/health` |
| Cache | pnpm store |
| Smoke tests post-deploy | `GET https://workers-staging.chiliztv.com/health`, HTTP 200 |
| Rollback | `flyctl releases rollback --app chiliztv-workers-staging` |
| Durée cible | < 6 min |
| Idempotence | Safe |

`PROCESS_ROLE=worker` est configuré dans le `fly.toml` de l'app workers (variable d'environnement Fly), pas dans le workflow. Ce switch conditionnel dans `apps/backend/index.ts` est un prérequis de J5 (voir §8).

---

### 3.5 `deploy-app.yml`

| Champ | Valeur |
|---|---|
| Nom fichier | `.github/workflows/deploy-app.yml` |
| Trigger | `push main` paths `apps/frontend/**` ou `packages/**` (hors `packages/ui/**`) + `pull_request` (pour previews) |
| Concurrency | `deploy-app-${{ github.ref }}`, cancel-in-progress: true |
| Permissions | `contents: read`, `deployments: write`, `pull-requests: write` |
| Environnement GitHub | `staging` sur push main, aucun sur PR |
| Jobs | Sur PR : `deploy-preview` → commentaire URL. Sur push main : `deploy-staging` → smoke + output de l'URL de déploiement en artefact |
| Étapes critiques | `vercel pull --yes --environment=preview --token=$VERCEL_TOKEN` → `vercel build --token=$VERCEL_TOKEN` → `vercel deploy --prebuilt --token=$VERCEL_TOKEN` → si PR : poster l'URL via `actions/github-script`. Sur push main : stocker l'URL du déploiement dans un artefact GitHub Actions `latest-staging-deployment.txt` (utilisé par `release.yml` pour `vercel promote`) |
| Cache | pnpm store, Turbo Remote, Next.js build cache (interne Vercel) |
| Smoke tests post-deploy | `GET https://app-staging.chiliztv.com/api/health`, HTTP 200 (route `/api/health` à créer côté frontend) |
| Rollback | `vercel rollback --token=$VERCEL_TOKEN` (promouvoir le déploiement précédent) |
| Durée cible | < 12 min |
| Idempotence | Safe — Vercel déduplique les builds identiques |

Vercel Git Integration est désactivée. Les previews PR sont gérées explicitement dans ce workflow. La décision est argumentée en §4.

---

### 3.6 `deploy-landing.yml`

| Champ | Valeur |
|---|---|
| Nom fichier | `.github/workflows/deploy-landing.yml` |
| Trigger | `push main` paths `apps/landing/**` ou `packages/ui/**` + `pull_request` (previews CF Pages) — disponible après J4 |
| Concurrency | `deploy-landing-${{ github.ref }}`, cancel-in-progress: true |
| Permissions | `contents: read`, `pull-requests: write` |
| Environnement GitHub | `production` sur push main. La landing n'a pas de staging séparé : le build statique (`output: 'export'`) est déterministe et les changements sont de type marketing sans données sensibles. Un bug visible = rollback CF Pages en un clic. |
| Jobs | Sur PR : `build-preview` → `cloudflare/pages-action@v1` en mode preview → commentaire URL. Sur push main : `build-static` (`pnpm build --filter @chiliztv.com/landing` → répertoire `out/`) → `deploy-prod` → smoke |
| Étapes critiques | pnpm install → pnpm build → `npx wrangler pages deploy out/ --project-name=chiliztv-landing --branch=main` pour prod. `--branch=<pr-branch>` pour preview. CF Pages génère une URL de preview par commit sur les PRs. |
| Cache | pnpm store, Turbo Remote |
| Smoke tests post-deploy | `GET https://chiliztv.com`, HTTP 200 |
| Rollback | CF Pages dashboard → déploiement précédent → "Rollback to this deployment" (1 clic) |
| Durée cible | < 5 min |
| Idempotence | Safe — CF Pages déduplique les builds identiques |

---

### 3.7 `db-migrate.yml`

| Champ | Valeur |
|---|---|
| Nom fichier | `.github/workflows/db-migrate.yml` |
| Trigger | `workflow_dispatch` + `push main` paths `apps/backend/src/infrastructure/database/migrations/**` |
| Concurrency | `db-migrate`, cancel-in-progress: false (ne jamais interrompre une migration en cours) |
| Permissions | `contents: read` |
| Environnement GitHub | `production` pour le job migrate-prod (reviewer requis) |
| Jobs | `validate-sequence`, `migrate-staging`, `migrate-prod` (needs: migrate-staging) |
| Étapes critiques | `validate-sequence` : script Node vérifiant que les fichiers de migrations sont nommés `NNN_description.sql`, sans gap dans la séquence et sans doublon. `migrate-staging` : `supabase login --token $SUPABASE_ACCESS_TOKEN` → `supabase link --project-ref $SUPABASE_PROJECT_REF_STAGING` → `supabase db push`. `migrate-prod` (approuvé manuellement via l'environnement `production`) : même séquence avec `$SUPABASE_PROJECT_REF`. |
| Cache | Aucun — migration = side-effect intentionnel |
| Smoke tests post-deploy | `supabase db diff --linked` après migration : le diff doit être vide (toutes les migrations appliquées) |
| Rollback | PITR Supabase Pro (restauration ponctuelle < 1h). Opération manuelle décrite dans le runbook incident. Il n'y a pas de rollback automatique de migration SQL. |
| Durée cible | < 5 min |
| Idempotence | `supabase db push` est idempotent sur les migrations déjà appliquées |

---

### 3.8 `release-please.yml`

| Champ | Valeur |
|---|---|
| Nom fichier | `.github/workflows/release-please.yml` |
| Trigger | `push main` |
| Concurrency | `release-please`, cancel-in-progress: false |
| Permissions | `contents: write`, `pull-requests: write` |
| Environnement GitHub | aucun |
| Jobs | `release-please` (googleapis/release-please-action@v4, type: node, package-name: chiliztv) |
| Étapes critiques | Parse les commits depuis le dernier tag → calcule le bump (MAJOR/MINOR/PATCH selon les types Conventional Commits) → ouvre ou met à jour une PR "chore(main): release vX.Y.Z" avec `CHANGELOG.md` mis à jour et version dans `package.json` → sur merge de cette PR : crée le tag annoté `vX.Y.Z` → déclenche `release.yml` |
| Cache | N/A |
| Smoke tests post-deploy | N/A |
| Rollback | N/A |
| Durée cible | < 2 min |
| Idempotence | Safe — release-please maintient son état dans un issue GitHub interne |

---

### 3.9 `release.yml`

| Champ | Valeur |
|---|---|
| Nom fichier | `.github/workflows/release.yml` |
| Trigger | `push` sur tags correspondant à `v*.*.*` |
| Concurrency | `release`, cancel-in-progress: false |
| Permissions | `contents: write`, `packages: write`, `deployments: write`, `id-token: write` (OIDC Sigstore + Fly.io) |
| Environnement GitHub | `production` (reviewer requis) |
| Jobs | `validate`, `retag-images`, `sign-image`, `sign-tag`, `verify-image`, `deploy-api-prod`, `deploy-workers-prod`, `deploy-app-prod`, `sentry-release`, `create-github-release`, `notify-discord` |
| Étapes critiques | (1) `validate` : assert le tag est sur `main`, assert semver valide. (2) `retag-images` : pull `:main` → retag `:vX.Y.Z` → push GHCR. (3) `sign-image` : cosign keyless sign de l'image `:vX.Y.Z`. (4) `sign-tag` : `gh attestation sign` du tag et release asset. (5) `verify-image` : `cosign verify ghcr.io/chiliztv/chiliztv-backend:vX.Y.Z` — gate de sécurité avant tout déploiement. (6) `deploy-api-prod` : `flyctl deploy --app chiliztv-api --image vX.Y.Z --strategy rolling` → smoke. (7) `deploy-workers-prod` : `flyctl deploy --app chiliztv-workers --image vX.Y.Z --strategy immediate` → smoke. (8) `deploy-app-prod` : lire l'artefact `latest-staging-deployment.txt` produit par `deploy-app.yml` → `vercel promote <url> --token=$VERCEL_TOKEN` pour promouvoir sans rebuild. Fallback : `vercel deploy --prebuilt --prod` si l'artefact est absent. (9) `sentry-release` : `sentry-cli releases new vX.Y.Z` → `set-commits --auto` → `finalize` → `deploys new -e production`. Conditionnel si `SENTRY_AUTH_TOKEN` est présent. (10) `create-github-release` : `gh release create vX.Y.Z --notes-file CHANGELOG_SECTION.md`. (11) `notify-discord` : POST webhook `$DISCORD_WEBHOOK_URL`, embed avec version, résumé changelog, liens prod. |
| Cache | Docker buildx registry cache, pnpm store |
| Smoke tests post-deploy | API prod : `GET https://api.chiliztv.com/health`, HTTP 200. App prod : `GET https://app.chiliztv.com/api/health`, HTTP 200. |
| Rollback | `flyctl releases rollback --app chiliztv-api` + `flyctl releases rollback --app chiliztv-workers` + `vercel rollback --token=$VERCEL_TOKEN`. Un embed Discord "Rollback vX.Y.Z → vX.Y.(Z-1)" est posté après rollback. |
| Durée cible | < 15 min |
| Idempotence | Safe — retag GHCR idempotent (même image), flyctl détecte l'image déjà déployée, `vercel promote` sur une URL déjà promue est sans effet |

Pour les prereleases (`-rc.N`), `release.yml` détecte la présence de `-rc` dans le tag et skip les jobs `deploy-api-prod`, `deploy-workers-prod`, `deploy-app-prod` — le déploiement reste en staging uniquement (voir politique prerelease en §10).

---

### 3.10 `release-contracts.yml`

| Champ | Valeur |
|---|---|
| Nom fichier | `.github/workflows/release-contracts.yml` |
| Trigger | `workflow_dispatch` uniquement — jamais déclenché automatiquement |
| Concurrency | `release-contracts`, cancel-in-progress: false |
| Permissions | `contents: write`, `pull-requests: write`, `id-token: write` (OIDC AWS KMS) |
| Environnement GitHub | `production` (reviewer requis) |
| Jobs | `test`, `deploy`, `sync-abis`, `open-pr` |
| Étapes critiques | (1) `test` : `forge test -vvv` (working-directory: `apps/smart-contracts/chiliz-tv`). (2) `deploy` : `forge script deploy ...` avec signing via AWS KMS OIDC (`ADMIN_PRIVATE_KEY` ne quitte pas le HSM) → broadcast sur Chiliz Spicy. (3) `sync-abis` : `node scripts/sync-abis.ts` → met à jour `packages/blockchain/src/abis/` et `apps/smart-contracts/chiliz-tv/deployments/*.json`. (4) `open-pr` : `gh pr create` avec les diff ABIs comme corps, label `area:contracts`. |
| Cache | Foundry cache (`~/.foundry`) |
| Smoke tests post-deploy | Appel read-only sur le contrat déployé (ex. `getFactory()` sur `BettingMatchFactory`) |
| Rollback | Pas de rollback contrat au sens strict. Pour un UUPS upgradeable : redéployer l'implémentation précédente via `upgradeToAndCall`. La procédure est documentée dans le runbook smart contracts. |
| Durée cible | < 20 min |
| Idempotence | Non idempotent — un double-run déploie deux fois. Le trigger `workflow_dispatch` manuel prévient les accidents. |

---

### 3.11 `security-contracts.yml`

| Champ | Valeur |
|---|---|
| Nom fichier | `.github/workflows/security-contracts.yml` |
| Trigger | `schedule` : lundi 06:00 UTC + `workflow_dispatch` |
| Concurrency | `security-contracts`, cancel-in-progress: false |
| Permissions | `contents: read`, `issues: write` |
| Environnement GitHub | aucun |
| Jobs | `slither`, `mythril`, `report` |
| Étapes critiques | `slither apps/smart-contracts/chiliz-tv/ --json slither-report.json` → `myth analyze apps/smart-contracts/chiliz-tv/src/*.sol` → upload des artefacts (slither-report.json, mythril-report.txt) → si findings critiques ou high : `gh issue create` automatique avec titre incluant la version et un lien vers les artefacts |
| Cache | Foundry cache |
| Smoke tests post-deploy | N/A |
| Rollback | N/A |
| Durée cible | < 30 min |
| Idempotence | Safe — analyse statique sans effet de bord |

---

### 3.12 `security-deps.yml`

| Champ | Valeur |
|---|---|
| Nom fichier | `.github/workflows/security-deps.yml` |
| Trigger | `schedule` : lundi 08:00 UTC + `workflow_dispatch` |
| Concurrency | `security-deps`, cancel-in-progress: false |
| Permissions | `contents: read`, `issues: write` |
| Environnement GitHub | aucun |
| Jobs | `pnpm-audit`, `auto-issue` |
| Étapes critiques | `pnpm audit --prod` → exit 1 si vulnérabilité high ou critical → `gh issue create` automatique avec le rapport si des vulnérabilités sont détectées |
| Cache | pnpm store |
| Smoke tests post-deploy | N/A |
| Rollback | N/A |
| Durée cible | < 5 min |
| Idempotence | Safe |

---

### 3.13 Renovate (GitHub App)

Renovate est installé comme App GitHub native sur l'org `chiliztv`. Aucun workflow custom n'est nécessaire. La configuration vit dans `renovate.json` committé à la racine. Principaux paramètres :

- Schedule : lundi 06:00 UTC (ne crée pas de bruit en cours de semaine).
- Groupes : une PR par écosystème (React/Next, wagmi/viem, Dynamic Labs, OpenZeppelin, Foundry, devDeps).
- Pas d'auto-merge (mode conservateur). Renovate ouvre les PRs, l'équipe review et merge manuellement.
- Ignore les dépendances Foundry gérées via `forge install` (pas pnpm).

Dependabot est désactivé : Renovate offre une meilleure granularité pour pnpm et les monorepos, et évite la duplication de PRs.

---

## 4. Vercel Git Integration — décision

**Décision : OFF. Git Integration Vercel désactivée. Tout passe par GitHub Actions.**

Arguments pour le OFF :

La stratégie de release est tag-driven : la promotion prod ne se déclenche que sur le tag `vX.Y.Z` via `release.yml`. La Git Integration Vercel déclenche automatiquement un déploiement prod sur chaque push `main`, ce qui contourne ce contrôle. Il faudrait gérer des `ignore-command` ou des hooks Vercel pour l'inhiber, ce qui ajoute de la complexité sans gain.

Avec la Git Integration OFF, les previews PR sont gérées dans `deploy-app.yml` (trigger `pull_request`). Le résultat est identique — une URL de preview par PR postée en commentaire — mais contrôlé depuis un seul plan (GitHub Actions), avec les secrets dans GitHub, et un tracé complet dans les logs Actions.

La promotion prod utilise `vercel promote <deployment-url>` depuis `release.yml` : aucun rebuild, la même image promue en staging est servie en prod. L'URL du déploiement staging est stockée en artefact par `deploy-app.yml` puis lue par `release.yml`.

Inconvénient accepté : setup initial légèrement plus verbeux (`vercel pull` + `vercel build` dans le workflow au lieu d'un trigger implicite). Contre-partie : tracé complet, un seul plan de contrôle, cohérence avec la politique tag = prod.

---

## 5. Stratégie de tests dans la CI

### 5.1 Inventaire des suites

**L1 — Unit tests (Vitest)** : rapides, < 30s. Couvrent la logique pure dans `packages/domain/`, les use cases dans `apps/backend/src/application/`, les helpers dans les sous-dossiers `domain/` des features frontend. Tournent sur chaque PR dans `ci-pr.yml`.

**L2 — Scénarios CLI** : décrits dans `apps/backend/docs/SMOKE.md`. Exécutés manuellement en local via `pnpm match:scenario run <name>`. Non intégrés au CI (trop lents, nécessitent un déploiement Chiliz réel).

**L3 — MockClock** : intégrés dans les tests unit L1. Les classes de `apps/backend/src/application/` et `apps/backend/src/infrastructure/` injectent `IClock` via tsyringe (`TOKENS.IClock`). Les tests utilisent `MockClock` et `advanceBy*` pour couvrir les chemins time-dependent sans accéder à l'horloge système. Le guard ESLint `no-restricted-syntax` interdit les appels directs à `new Date()` hors de `infrastructure/clock/` et `testing/clock/` — validé par `pnpm lint` (Turbo couvre tous les workspaces).

**L4 — Tests d'intégration** : décrits dans `apps/backend/docs/SMOKE_integration.md`. Tournent sur `main` push et nightly dans `ci-integration.yml`. Nécessitent Foundry (Anvil) + Supabase CLI. Isolation des tests via fixture IDs dans la plage `999000-999999` (nettoyage via `pnpm match:reset`).

**Foundry** : dans `ci-pr.yml`, job `test-contracts` conditionnel sur `paths: apps/smart-contracts/**`. Reprend la logique de `apps/smart-contracts/.github/workflows/ci.yml` en l'alignant sur la branche `main`.

### 5.2 Couverture cible

| Layer | Seuil cible |
|---|---|
| `packages/domain/` | ≥ 80% |
| `apps/backend/src/application/` | ≥ 60% |
| `apps/backend/src/infrastructure/` | ≥ 30% |
| `apps/backend/src/presentation/` | pas de cible (controllers trop couplés au framework) |
| `apps/frontend/` | pas de cible (JSX) |

Ces seuils sont configurés dans `vitest.config.ts` (coverage thresholds). Un échec de seuil fait échouer `test-unit` dans `ci-pr.yml`.

### 5.3 Validation des migrations

Le job `validate-sequence` dans `db-migrate.yml` exécute un script Node qui vérifie :

- Tous les fichiers de migration correspondent au pattern `^[0-9]{3}_[a-z0-9_]+\.sql$`.
- La numérotation est strictement séquentielle sans gap (001, 002, ..., N) et sans doublons.
- Aucune migration déjà committée n'a été modifiée (hash SHA-1 stable).

Le job échoue avec un message d'erreur clair si une de ces conditions est violée.

---

## 6. Sécurité de la pipeline

### 6.1 Permissions minimales

Tous les workflows ont `permissions: contents: read` en en-tête. Chaque job élargit uniquement ce dont il a besoin :

- `packages: write` — jobs qui poussent vers GHCR
- `id-token: write` — jobs OIDC (Fly.io, Sigstore, AWS KMS)
- `pull-requests: write` — jobs qui postent des commentaires de preview
- `issues: write` — jobs `security-*.yml` qui ouvrent des issues

### 6.2 OIDC Fly.io

`flyctl auth token --oidc` est disponible depuis la version récente du CLI Fly.io. Il remplace le long-lived `FLY_API_TOKEN` par un token éphémère généré via OIDC GitHub Actions (durée de vie < 15 min). À configurer dans `deploy-api.yml`, `deploy-workers.yml` et `release.yml`.

### 6.3 OIDC AWS KMS

`ADMIN_PRIVATE_KEY` ne doit pas vivre en clair. La procédure de migration vers AWS KMS sign-only (via OIDC GitHub Actions) est prévue en J10. La clé privée reste dans le HSM ; le workflow récupère un token OIDC éphémère, envoie le payload à signer à KMS et récupère la signature sans jamais voir la clé.

### 6.4 Gitleaks

`gitleaks detect` tourne dans `ci-pr.yml` (job `secret-scan`). Un fichier `.gitleaksignore` à la racine exclut :

- `.env.example` (fichier de template sans valeurs réelles)
- `apps/*/src/testing/**` (fixtures avec des clés de test fictives)

Une alerte est levée sur tout match dans `apps/**`, `packages/**`, `docs/**`.

### 6.5 Slither + Mythril

Analyses statiques weekly dans `security-contracts.yml` (chaque lundi 06:00 UTC). Les rapports sont uploadés comme artefacts GitHub Actions (durée de rétention 90 jours). Si des findings critiques ou high sont détectés, un issue GitHub est créé automatiquement avec un titre incluant la version des contrats et un lien vers les artefacts.

### 6.6 Signature tags et images

Deux outils complémentaires, couvrant des artefacts distincts :

- `gh attestation sign` (Sigstore keyless) dans `release.yml` job `sign-tag` : signe le tag git et les release assets. Vérification par n'importe qui via `gh attestation verify`. Utilise l'OIDC GitHub Actions comme identité.
- `cosign sign` keyless dans `release.yml` job `sign-image` : signe l'image OCI `:vX.Y.Z` dans GHCR. La signature est enregistrée dans Sigstore Rekor.
- `cosign verify` dans `release.yml` job `verify-image` : gate de sécurité exécuté avant tout déploiement prod. Échoue si la signature est absente ou invalide.

### 6.7 Runbook — secret leaké en production

Procédure d'urgence à exécuter dans les 30 minutes suivant la détection :

1. Identifier le commit et le fichier fautifs : `git log --all -S "<valeur_du_secret>" --source --all`.
2. Préparer un fichier `replacements.txt` listant les patterns à remplacer par `REDACTED`.
3. Nettoyer l'historique : `git filter-repo --replace-text replacements.txt`. Cette opération réécrit tous les commits contenant le secret.
4. Coordonner avec l'équipe : annoncer une fenêtre de 15 minutes pendant laquelle la protection de branche est temporairement levée sur `main`, puis force-pusher : `git push --force origin main`. Rétablir immédiatement la protection.
5. Rotation immédiate du secret dans toutes les plateformes concernées (Vercel, Fly.io, Supabase, Cloudflare selon le secret).
6. Auditer les access logs : Supabase dashboard > Logs, Vercel dashboard > Activity, Fly.io dashboard > Events. Vérifier qu'aucune action non autorisée n'a été exécutée avec le secret leaké.
7. Vérifier qu'aucun fork public du repo n'a capturé le commit avant la réécriture.
8. Invalider tout token JWT ou session pouvant avoir été compromis.

---

## 7. Observabilité de la pipeline

### 7.1 Notifications Discord

Le secret `DISCORD_WEBHOOK_URL` est configuré dans l'environnement `production`. Les notifications sont envoyées :

- Dans `release.yml` job `notify-discord` : embed avec version, résumé changelog, liens vers les déploiements.
- Sur tout job `deploy-*-prod` en failure (condition `if: failure()`) : embed d'alerte rouge avec le nom du job, le run ID et le lien vers les logs.
- Sur rollback : embed spécifique "Rollback vX.Y.Z → vX.Y.(Z-1)" avec les liens de confirmation.

### 7.2 Time-to-deploy

Dans `release.yml`, un artefact JSON `deploy-metrics.json` est créé avec les timestamps suivants :

- `tag_created_at` : timestamp du tag git (lu via `gh api`)
- `deploy_started_at` : début du job `validate`
- `smoke_passed_at` : fin du dernier smoke test prod
- `total_seconds` : durée totale commit → prod

Ces métriques sont stockées comme artefacts de 90 jours pour un suivi manuel des tendances.

### 7.3 Audit log des releases

La PR de release générée par release-please contient dans son corps :

- Extrait du CHANGELOG pour la version (sections Added/Changed/Fixed).
- Liste des commits inclus depuis le tag précédent.
- Liste des migrations SQL appliquées (comparaison entre le tag précédent et HEAD sur le répertoire `migrations/`).
- Liste des versions des packages pnpm bumpés.

Cette PR constitue le journal d'audit permanent de chaque release, accessible dans l'historique GitHub.

### 7.4 Status badges

Le `README.md` racine affiche :

- Badge CI main : statut de `ci-pr.yml` sur `main`.
- Badge dernière release : tag GitHub (shields.io).
- Badge coverage domain : généré depuis les artefacts de coverage Vitest (`packages/domain/` ≥ 80%).

---

## 8. Plan de migration progressif

L'ordre suit le brief. Les ajustements sont justifiés ci-dessous.

1. **J1** — Créer `ci-pr.yml` minimal (lint + typecheck + vitest unit + commitlint) + activer branch protection sur `main` + créer `CONTRIBUTING.md`, `.github/CODEOWNERS`, PR template, issue templates. Purger `MEDIAMTX_API_URL` et `MEDIAMTX_PUBLISH_SECRET` des `globalEnv` de `turbo.json` (commit `chore(infra): remove stale mediamtx env references`).

2. **J2** — Activer Turbo Remote Cache (`TURBO_TOKEN` + `TURBO_TEAM`) + cache pnpm store + cache Foundry artifacts dans `ci-pr.yml`. Vérifier la réduction de durée CI (cible < 10 min).

3. **J3** — Installer Renovate GitHub App + committer `renovate.json` + ajouter `secret-scan` (gitleaks + `.gitleaksignore`) + `audit` (pnpm audit --prod) dans `ci-pr.yml`.

4. **J4** — Refactor split landing : créer `apps/landing/` (Next.js 15, `output: 'export'`) + `packages/ui/` (shadcn primitives, theme.css Tailwind v4) + déplacer le code marketing depuis `apps/frontend/`. Mettre à jour `ci-pr.yml` avec un job `build-landing` indépendant. Aucun déploiement encore : `deploy-landing.yml` n'est pas créé à ce stade.

5. **J5** — Implémenter le switch `PROCESS_ROLE` dans `apps/backend/index.ts` + réactiver `output: 'standalone'` dans `apps/frontend/next.config.ts`. Créer les apps Fly.io (`chiliztv-api-staging`, `chiliztv-workers-staging`, `chiliztv-api`, `chiliztv-workers`) + committer les `fly.toml`. Provisionner les sous-domaines DNS staging dans Cloudflare (voir §1.3).

6. **J5b** — Bootstrap release-please : créer `release-please.yml` + `CHANGELOG.md` vide + `SECURITY.md` + `renovate.json` (si pas déjà fait en J3). Déclencher une release blanche `v0.1.0` pour valider le pipeline de versioning sans déploiement prod (le tag `v0.1.0` est posé manuellement, `release.yml` ne déploie pas encore en prod car le workflow n'existe pas encore). J5b est séparé de J5 car les deux prérequis sont indépendants de J6 : J5 prépare l'infrastructure, J5b prépare le versioning.

7. **J6** — Créer `deploy-api.yml` + `deploy-workers.yml` et déployer sur Fly.io staging. **Prérequis** : avant le premier déploiement, appliquer manuellement les migrations SQL 001-016 sur la DB Supabase staging via `pnpm db:migrate` pointé sur le projet staging — `db-migrate.yml` n'existe pas encore à ce stade.

8. **J7** — Créer `deploy-app.yml` (Vercel staging + previews PR, output URL en artefact) + `deploy-landing.yml` (Cloudflare Pages prod + previews CF Pages sur PR).

9. **J8** — Créer `release.yml` complet (verify-image, retag, sign cosign, deploy prod via `vercel promote`, sentry-release, Discord, GitHub Release). Premier tag prod `v0.2.0`.

10. **J9** — Créer `db-migrate.yml` (avec `validate-sequence`) + `ci-integration.yml` (s'appuyant sur `apps/backend/docs/SMOKE_integration.md`). Créer `security-contracts.yml` + `security-deps.yml`.

11. **J10** — Créer `release-contracts.yml`. Durcissement OIDC : remplacer `FLY_API_TOKEN` par OIDC dans les workflows deploy. Migrer `ADMIN_PRIVATE_KEY` vers AWS KMS.

12. **J11-J14** — `gh attestation sign` tags dans `release.yml`, observabilité Discord fine-grained (notifications d'alerte), runbooks incident WC, formation équipe. Ajustements de durée CI si les cibles ne sont pas atteintes.

**Ajustements par rapport au brief** :
- J5 scindé en J5 (infra + PROCESS_ROLE) et J5b (versioning) pour éviter un jour trop dense qui mêle deux prérequis indépendants.
- J6 inclut une note explicite sur l'application manuelle des migrations avant déploiement, absente du brief.
- J9 inclut `security-contracts.yml` et `security-deps.yml` déplacés depuis J10 — ces workflows sont plus simples à activer que `release-contracts.yml` et peuvent l'être dès J9.

---

## 9. Points à valider avant implémentation

Les points 1 à 8 ont été répondus avant la rédaction de ce document. Ils sont listés ici avec leur réponse pour archivage. Les points 9 à 12 restent ouverts.

1. **Org GitHub** — Org dédiée `chiliztv` retenue (pas le compte perso `antonyloussararian`).
2. **Vercel Git Integration** — OFF, tout via GitHub Actions (voir §4).
3. **Outil versioning** — release-please (voir §10).
4. **Stratégie staging** — `main` = staging, tag `vX.Y.Z` = prod.
5. **Notifications CI** — Discord (webhook secret `DISCORD_WEBHOOK_URL`).
6. **Renovate** — Conservateur, pas d'auto-merge pré-V1.
7. **`packages/ui/`** — Créé dès J4 avec le split landing.
8. **Signing** — Sigstore keyless (`gh attestation` pour tags, `cosign` pour images).
9. **Régions Fly.io** — `cdg` uniquement en beta ? `cdg + iad` dès V1 pour réduire la latence des viewers US lors de la WC ? À valider avant J5.
10. **KMS pour `ADMIN_PRIVATE_KEY`** — AWS KMS ou GCP KMS ? À valider avant J10. Impact : le choix conditionne la configuration OIDC dans `release-contracts.yml`.
11. **API-Football** — Quel tier actuel et quel plafond de requêtes ? À valider pour calibrer le polling en CI (les tests d'intégration L4 ne doivent pas consommer de quota réel).
12. **RPC Chiliz payant** — Ankr ou QuickNode pour remplacer le RPC public en V1 ? À valider avant J10 (le RPC public throttle au-dessus de 50 req/s, ce qui est atteint par les 5 indexers + les tests L4).

---

## 10. Versioning, changelog, releases

### 10.1 Choix de l'outil

Trois options ont été évaluées :

**release-please** (googleapis/release-please-action@v4) : parse les Conventional Commits, crée automatiquement une PR "chore(main): release vX.Y.Z" qui bumpe `package.json`, met à jour `CHANGELOG.md`, et pose le tag git au merge de la PR. Support natif des monorepos pnpm, des prereleases (`-rc.N`), et des changelogs multi-sections. Mature et activement maintenu (utilisé par Google Cloud SDK, Firebase CLI, etc.).

**Changesets** : chaque PR inclut un fichier `.changeset/` décrivant le changement. `pnpm changeset version` génère le changelog et bumpe les versions. Plus de contrôle manuel, adapté si chaque package du monorepo a un cycle de release indépendant. Prématuré avant V1 où tous les packages partagent le même cycle de déploiement.

**git-cliff** : génère un changelog depuis les commits Conventional Commits, très configurable. Ne gère pas le bump de `package.json` ni la PR de release automatique. Adapté aux releases cadencées manuelles, moins à la CI continue.

**Décision : release-please.** L'automatisation complète (PR de release, bump, tag) avec zéro action manuelle est prioritaire avant la WC. La séparation des versions par app (Changesets) sera réévaluée post-WC si les cycles de déploiement de `frontend`, `backend` et `landing` divergent.

### 10.2 Format du CHANGELOG.md

Keep a Changelog 1.1.0. Sections dans cet ordre : Unreleased, puis chaque version de la plus récente à la plus ancienne. Dans chaque version : Added, Changed, Deprecated, Removed, Fixed, Security.

La section Unreleased est alimentée automatiquement par release-please entre deux releases. Les entrées sont groupées par scope Conventional Commits.

### 10.3 Versionnage monorepo

Une seule valeur `version` dans le `package.json` racine, héritée par les sous-apps (`apps/frontend`, `apps/backend`, `apps/landing` après J4). Le couplage de déploiement est trop fort avant V1 pour justifier des versions séparées. Séparation envisageable post-WC si `landing` diverge des cycles de déploiement `backend`/`frontend`.

### 10.4 Définition complète de `release.yml`

**Déclencheur** : tag `v*.*.*` posé par release-please au merge d'une PR de release.

**Étapes** (détaillées en §3.9) :
1. Validation du tag (sur `main`, semver valide).
2. Retag de l'image GHCR `:main` en `:vX.Y.Z`.
3. Signature cosign keyless de l'image.
4. Signature `gh attestation` du tag.
5. Vérification cosign avant déploiement (gate de sécurité).
6. Déploiement API prod (flyctl rolling).
7. Déploiement workers prod (flyctl immediate).
8. Promotion app prod (`vercel promote <staging-url>`).
9. Création release Sentry.
10. Création GitHub Release avec le body extrait du CHANGELOG.
11. Notification Discord.

**Rollback** : `flyctl releases rollback` + `vercel rollback`. Les images versionnées dans GHCR (`:<sha>` et `:vX.Y.(Z-1)`) permettent de revenir à n'importe quelle version précédente sans rebuild.

### 10.5 Politique prerelease — WC

Semaine du 2026-05-26 : tags `v1.0.0-rc.1`, `v1.0.0-rc.2` (et `rc.3` si nécessaire). Ces tags déclenchent `release.yml`, mais le job `deploy-*-prod` est conditionnel et est skippé si le tag contient `-rc`. Les tags RC déploient en staging uniquement.

Tag `v1.0.0` le 2026-06-04 au go-live : deploy prod complet via `release.yml`.

### 10.6 Hotfix flow

1. Créer `hotfix/<version>` depuis le dernier tag prod (`git checkout -b hotfix/v0.3.2 v0.3.1`).
2. Appliquer le correctif, ouvrir une PR vers `main`.
3. Merger → release-please bump PATCH automatiquement → tag `v0.3.2` → `release.yml` déploie.

Pas de cherry-pick acrobatique depuis des branches de feature. Le flow reste linéaire.

### 10.7 Bump major (v2.0.0)

Conditions justifiant un MAJOR :

- Suppression ou renommage non rétrocompatible d'un endpoint API backend (affecte les clients mobiles ou partenaires).
- Changement de storage layout d'un contrat Solidity upgradeable (oblige un redéploiement avec migration de données).
- Changement de schéma de base de données non rétrocompatible (suppression de colonne, renommage de table).
- Refonte d'architecture majeure (remplacement du framework backend ou du système d'auth).

Processus communication : billet de blog + guide de migration + délai d'annonce de 4 semaines minimum avant dépréciation.

---

## 11. Split landing/app

### 11.1 Inventaire de l'existant

L'app `apps/frontend/` héberge actuellement landing et produit dans le même bundle Next.js 15. Les routes et composants sont répartis comme suit :

**Vers `apps/landing/`** (pages marketing, sans dépendance Web3) :
- `apps/frontend/app/page.tsx` — home (hero, sections marketing, FAQ)
- `apps/frontend/app/how-it-works/page.tsx` — page explicative du produit
- `apps/frontend/components/landing/` — BackgroundFX, SectionHead, et tous les composants marketing
- `apps/frontend/components/features/access/` — dialog d'accès code et waitlist
- `apps/frontend/components/features/how-it-works/` — si aucune dépendance wagmi (à vérifier au moment du refactor)
- `apps/frontend/app/layout.tsx` (une copie simplifiée sans providers Web3)

**Vers `packages/ui/`** (composants présentationnels partagés) :
- `apps/frontend/components/ui/` — primitives shadcn (Dialog, Tabs, Avatar, Button, etc.)
- Composants purement présentationnels identifiés lors du refactor (à confirmer : Footer marketing, Header simplifié)

**Restent dans `apps/frontend/`** (produit) :
- `apps/frontend/app/browse/page.tsx`
- `apps/frontend/app/live/page.tsx`
- `apps/frontend/app/dashboard/page.tsx`
- `apps/frontend/app/leaderboard/page.tsx`
- `apps/frontend/app/whitepaper/page.tsx`
- `apps/frontend/app/verifying/page.tsx`
- `apps/frontend/components/features/discover/`
- `apps/frontend/components/features/streaming/`
- `apps/frontend/components/features/dashboard/`
- `apps/frontend/components/features/leaderboard/`
- `apps/frontend/components/features/whitepaper/`
- `apps/frontend/components/live/`
- `apps/frontend/components/web3/`
- `apps/frontend/components/providers/`
- `apps/frontend/components/selfProtcol/`
- `apps/frontend/components/leaderboard/`
- `apps/frontend/components/shared/`
- `apps/frontend/components/system/`
- `apps/frontend/components/common/`

### 11.2 Structure cible

```
apps/
  landing/
    app/
      page.tsx             (home marketing)
      how-it-works/
        page.tsx
      layout.tsx           (minimal — aucun provider wagmi/Dynamic)
    components/
      landing/             (BackgroundFX, SectionHead, etc.)
      features/
        access/            (dialog accès code / waitlist)
    next.config.ts         (output: 'export', transpilePackages: ['@chiliztv/ui'])
    package.json           (@chiliztv.com/landing)
    .env.example
  frontend/
    app/
      browse/
      live/
      dashboard/
      leaderboard/
      whitepaper/
      verifying/
      page.tsx             (redirect vers /browse ou landing produit minimaliste si non connecté)
      layout.tsx           (providers wagmi, Dynamic Labs, Supabase client)
    components/
      features/            (discover, streaming, dashboard, leaderboard, whitepaper)
      live/
      web3/
      providers/
      ...
    next.config.ts         (output: 'standalone', transpilePackages: ['@chiliztv/ui', ...])
    package.json           (@chiliztv.com/frontend)
    .env.example
packages/
  ui/
    src/
      ui/                  (shadcn primitives Button, Dialog, Tabs, etc.)
      theme.css            (Tailwind v4 @theme, @import "tailwindcss" — source unique partagée)
    package.json           (@chiliztv/ui)
```

### 11.3 Tailwind v4

La version 4 de Tailwind (déjà installée : `"tailwindcss": "^4"` dans `apps/frontend/package.json`) remplace `tailwind.config.js/ts` par une configuration CSS. Le partage de la palette et des tokens de design se fait via un fichier CSS partagé `packages/ui/src/theme.css` qui contient les directives `@import "tailwindcss"` et `@theme { ... }` (couleurs Chiliz, typographie, etc.). Chaque app importe ce fichier en premier dans son CSS global. Aucun `tailwind.config.ts` JS n'est à mutualiser.

### 11.4 Call-sites à modifier

**Dans `apps/landing/`** — tout lien interne vers le produit devient une URL absolue :

- `/browse` → `https://app.chiliztv.com/browse`
- `/live` → `https://app.chiliztv.com/live`
- `/dashboard` → `https://app.chiliztv.com/dashboard`
- `/leaderboard` → `https://app.chiliztv.com/leaderboard`
- CTA "Enter App" → `https://app.chiliztv.com`

Ces URLs sont externalisées via la variable d'env `NEXT_PUBLIC_APP_URL` pour éviter le hard-coding.

**Dans `apps/frontend/`** — les liens vers la landing deviennent absolus :

- Footer "Home" → `https://chiliztv.com`
- Footer "How It Works" → `https://chiliztv.com/how-it-works`
- Tout lien vers la page d'accueil publique → `https://chiliztv.com`

Ces URLs sont externalisées via `NEXT_PUBLIC_LANDING_URL`.

### 11.5 Variables d'environnement

**`apps/landing/.env.example`** :
- `NEXT_PUBLIC_APP_URL` — ex. `https://app.chiliztv.com`
- `NEXT_PUBLIC_API_URL` — ex. `https://api.chiliztv.com`

**`apps/frontend/.env.example`** — conserver toutes les variables Web3 existantes (wagmi, Dynamic Labs, Supabase, Chiliz RPC, etc.) et ajouter :
- `NEXT_PUBLIC_LANDING_URL` — ex. `https://chiliztv.com`

### 11.6 Workflows CI

Après J4, `ci-pr.yml` inclut un job `build-landing` déclenché si `apps/landing/**` ou `packages/ui/**` sont modifiés. Ce job est indépendant de `build-frontend`. La stratégie matrix est écartée : les conditions de path-filter et les commandes de build sont suffisamment différentes pour justifier des jobs séparés plutôt qu'une matrix qui compliquerait les conditions.

### 11.7 SEO

**`apps/landing/`** : meta tags marketing complets dans le layout racine (`<title>`, `<meta name="description">`, OpenGraph, Twitter Card). Fichier `public/robots.txt` avec `Allow: /`. Fichier `public/sitemap.xml` (ou généré via une lib compatible `output: 'export'`).

**`apps/frontend/`** : `noindex, nofollow` sur les routes authentifiées uniquement (`/dashboard`, `/verifying`). Les routes publiques `/browse`, `/live`, `/leaderboard`, `/whitepaper` restent indexables pour alimenter le SEO produit.

### 11.8 Risques

**Tailwind v4 CSS config** : si `apps/landing` et `apps/frontend` importent le même `packages/ui/src/theme.css` mais ont besoin de sur-définir certains tokens différemment, cela passe par un second `@theme { ... }` dans leur CSS global qui surcharge les valeurs. C'est préférable à un fork — à documenter dans le PR de refactor.

**Isolation `packages/ui/`** : le package ne doit avoir aucune dépendance vers wagmi, viem, @supabase, Dynamic Labs ou framer-motion. Cette règle est vérifiée au moment du refactor via une revue du `package.json` de `packages/ui/`. Une violation introduirait les dépendances Web3 dans le bundle landing.

**Coût pnpm install** : l'ajout de `packages/ui/` comme workspace invalide le cache Turbo une seule fois. Les rebuilds suivants sont incrémentiaux.

---

## 12. CONTRIBUTING.md — structure

Le `CONTRIBUTING.md` à créer à la racine suit la structure ci-dessous. Chaque section est un heading H2. Le contenu est rédigé au moment de la création (J1) ; ce document en décrit uniquement la structure attendue.

### Setup local

Instructions pour cloner, installer les dépendances (`pnpm install`), démarrer Docker compose, et copier les fichiers `.env.example` de chaque app. Références vers `apps/backend/.env.example`, `apps/frontend/.env.example` et (après J4) `apps/landing/.env.example`.

### Conventions de commit

Format Conventional Commits : `type(scope): subject`. Exemples par scope (`backend`, `frontend`, `landing`, `contracts`, `infra`, `docs`). Rappel : le titre de PR sera utilisé comme message du commit squashé sur `main`.

### Branch naming

Conventions de nommage des branches : `feat/<scope>-<slug>`, `fix/<scope>-<slug>`, `refactor/<scope>-<slug>`, `chore/<scope>-<slug>`. Branches spéciales : `hotfix/<version>`, `release/<version>` (auto-créées par release-please, ne pas créer manuellement).

### Ouvrir une PR

Remplir le template `.github/PULL_REQUEST_TEMPLATE.md`. Appliquer au moins un label `area:*`. Lier la PR à une issue si applicable. Référence vers `.github/CODEOWNERS` pour savoir qui assignera automatiquement comme reviewer.

### Changelog

release-please gère automatiquement le `CHANGELOG.md`. Aucune entrée manuelle n'est requise de la part du contributeur : les commits Conventional Commits sont parsés automatiquement.

### Tests locaux

- `pnpm test` — suite unit (L1), tous les workspaces, résultat en < 30s.
- `pnpm test:integration` — suite L4 (Supabase CLI + Anvil requis, voir `apps/backend/docs/SMOKE_integration.md`).
- `forge test -vvv` depuis `apps/smart-contracts/chiliz-tv/` — suite Foundry.

### Lint et type-check

- `pnpm lint` — ESLint sur tous les workspaces via Turbo.
- `pnpm type-check` — TypeScript strict sur tous les workspaces via Turbo.

### Politique de review

Les reviews sont assignées automatiquement par `.github/CODEOWNERS`. Une review approuvée par un mainteneur est requise. Référence vers `.github/CODEOWNERS` pour la liste des owners par area.

### Politique de release

release-please ouvre automatiquement une PR "chore(main): release vX.Y.Z" après chaque merge. Cette PR met à jour `CHANGELOG.md` et `package.json`. Seul `@antonyloussararian` (mainteneur) peut merger une PR de release. Le merge crée automatiquement le tag `vX.Y.Z`, qui déclenche `release.yml` et le déploiement prod.

### Politique de sécurité

Les vulnérabilités sont signalées de manière privée par email (contact défini dans `SECURITY.md`). Aucun issue public ne doit être ouvert pour une vulnérabilité non divulguée. Délai de réponse attendu : 48h.

### Code style

Le détail des conventions (TypeScript strict, naming, imports, React, DDD, commentaires) est dans `CLAUDE.md §4`. Ce fichier fait référence.

### Ton

Ton neutre, professionnel, impersonnel dans les messages de commit, commentaires de PR et documentation. Formulations à la troisième personne ou au passif. Aucun Contributor Covenant formel — une note brève sur le ton attendu est suffisante pour une équipe restreinte en beta.

---

*Fin du document. Prochaine étape : valider les points ouverts en §9 (points 9-12), puis lancer J1 selon le plan d'exécution de §8.*