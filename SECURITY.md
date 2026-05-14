# Security Policy

## Reporting a vulnerability

Do **not** open a public GitHub issue for security vulnerabilities.

Send a report by email to **antony.loussararian@gmail.com** with:

- A description of the vulnerability and its potential impact.
- Steps to reproduce or a proof-of-concept (if applicable).
- The affected component (`backend`, `frontend`, `contracts`, `infra`).

A response will be sent within **48 hours**. Once the issue is confirmed, a fix will be prioritised and a patched release published as soon as possible. The reporter will be credited in the release notes unless they prefer to remain anonymous.

## Scope

| In scope | Out of scope |
|---|---|
| `apps/backend` API endpoints | Third-party services (Supabase, Vercel, Fly.io) |
| `apps/smart-contracts` deployed on Chiliz Chain | Chiliz Chain infrastructure itself |
| Authentication and wallet handling | Dynamic Labs SDK internals |
| On-chain fund handling (LiquidityPool, FootballMatch) | Frontend cosmetic issues |

## Supported versions

Only the latest release tag (`vX.Y.Z`) is actively maintained. Older versions do not receive security patches.
