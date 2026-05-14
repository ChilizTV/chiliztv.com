# Contributing

## Setup local

```bash
# Prerequisites: Node 22 LTS, pnpm 10.28.1 (corepack), Docker
corepack enable
pnpm install
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
docker compose -f compose/docker-compose.dev.yml up -d
pnpm --filter "@chiliztv.com/backend" dev
pnpm --filter "@chiliztv.com/frontend" dev
```

Environment files: each app has a `.env.example` at its root. Never commit `.env` files.

## Conventions de commit

Format: `type(scope): subject` — imperative mood, < 72 chars, no trailing period.

Allowed types: `feat`, `fix`, `refactor`, `chore`, `docs`, `perf`, `test`, `ci`, `build`

Allowed scopes: `backend`, `frontend`, `landing`, `contracts`, `infra`, `docs`

```
feat(backend): add GetBrowseMatchesUseCase
fix(frontend): correct USDC decimals in bet dialog
chore(infra): remove stale MEDIAMTX env vars from turbo.json
```

## Branch naming

```
feat/<scope>-<slug>
fix/<scope>-<slug>
refactor/<scope>-<slug>
chore/<scope>-<slug>
hotfix/<version>          # from latest prod tag
release/<version>         # auto-created by release-please
```

## Ouvrir une PR

1. Fill out the PR template (`.github/PULL_REQUEST_TEMPLATE.md`).
2. Apply at least one `area:*` label.
3. PR title must follow Conventional Commits format — validated by CI (commitlint).
4. Owners are defined in `.github/CODEOWNERS`. Smart-contract PRs require `@helder77270` review. DDD layers and infra require `@Antonybyrt`.

## Changelog

`CHANGELOG.md` is managed automatically by release-please. No manual edits required. release-please parses commit messages and opens a release PR when merging to `main`.

## Tests locaux

```bash
pnpm test                     # Vitest unit tests (all workspaces)
pnpm test:integration         # L4 — requires Supabase CLI + Foundry (see apps/backend/docs/SMOKE_integration.md)
forge test -vvv               # Smart contract tests (from apps/smart-contracts/chiliz-tv/)
```

Smoke scenarios: see `apps/backend/docs/SMOKE.md` for L2 QA runbook.

## Lint et type-check

```bash
pnpm lint           # ESLint across all workspaces (via Turbo)
pnpm type-check     # TypeScript strict check across all workspaces
```

Both must pass before a PR can be merged. CI enforces this on every push.

## Politique de review

Ownership is defined in `.github/CODEOWNERS`. The relevant rules:

- **Smart contracts** (`apps/smart-contracts/`) — `@helder77270`
- **Domain + application layers, shared packages** — `@Antonybyrt`
- **Everything else** — `@Antonybyrt`

At least one approved review is required before merge.

## Politique de release

1. Merge commits to `main` following Conventional Commits.
2. release-please opens a release PR automatically (`chore(main): release vX.Y.Z`).
3. Only `@Antonybyrt` merges the release PR.
4. Merging the release PR creates the annotated tag `vX.Y.Z`.
5. The tag triggers `release.yml` which deploys to production.

Hotfixes: branch from the latest prod tag (`hotfix/<version>`), fix, open PR, merge, tag `vX.Y.(Z+1)`.

## Politique de sécurité

See `SECURITY.md` for responsible disclosure instructions. Do not open a public GitHub issue for security vulnerabilities.

## Code style

Key rules:

- TypeScript `strict: true`, zero `any`, discriminated unions for result types (`{ ok: true, data } | { ok: false, reason }`).
- No `console.log` in production code. Structured Pino logs on backend, Sentry on frontend.
- No new `package.json` dependencies without explicit team validation.
- DDD layer boundaries strictly enforced: `presentation` → `application` → `domain` ← `infrastructure`. The `domain` package has zero infrastructure dependencies.
- Smart contract changes require `forge test -vvv` + Slither clean before opening a PR.

## Ton

Neutral, professional, impersonal. Comments address the code, not the reader. No personal signatures, no emojis in code. Commit messages and PR descriptions are written in English.
