# Runbook — Access Code Rotation

## What it is

A single shared code that gates access to the site. Stored as a scrypt hash in `ACCESS_CODE_HASH` (never the plain code). Visitors enter it once; an httpOnly cookie valid for 7 days is issued.

## Generating the hash (initial setup or rotation)

```bash
# From apps/backend/
node scripts/gen-access-code-hash.js <your-plain-code>
```

Copy the output and set it as `ACCESS_CODE_HASH` in your secret manager / `.env` (never commit the plain code).

Also set `ACCESS_CODE_COOKIE_SECRET` to a random string of ≥ 32 chars:

```bash
openssl rand -base64 32
```

## Rotating the code

1. Generate a new hash with the script above.
2. Update `ACCESS_CODE_HASH` (and optionally `ACCESS_CODE_COOKIE_SECRET`) in the secret manager.
3. Restart the backend. The new hash is read once at boot — no hot reload.
4. Existing `cwk_access` cookies signed with the old `ACCESS_CODE_COOKIE_SECRET` become invalid after the secret rotates. Users will need to re-enter the new code.

## What is never stored / logged

- The plain code.
- The hash (it is loaded into memory only, never written to DB or logs).
- The submitted code from `/access/redeem` requests (only IP, UA, and success/failure are logged).
