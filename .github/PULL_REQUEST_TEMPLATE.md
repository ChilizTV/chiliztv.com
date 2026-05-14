## Summary

<!-- What does this PR do? One paragraph max. -->

## Type of change

<!-- Apply the relevant label(s): area:backend area:frontend area:landing area:contracts area:infra area:docs -->
<!-- Add `breaking` if this introduces a non-backwards-compatible change. -->
<!-- Add `migration` if this includes a DB schema change. -->
<!-- Add `release-skip` if this should not appear in the changelog. -->

## Testing

- [ ] `pnpm test` passes locally
- [ ] `pnpm lint` and `pnpm type-check` pass
- [ ] Relevant unit tests added or updated
- [ ] If contracts changed: `forge test -vvv` passes

## Checklist

- [ ] PR title follows Conventional Commits format: `type(scope): subject`
- [ ] No `console.log` left in production code
- [ ] No new `package.json` dependency added without validation (CLAUDE.md §7.8)
- [ ] No `any` introduced in TypeScript (CLAUDE.md §4.1)
- [ ] If DB migration included: numbered sequentially, idempotent

## Related issues

<!-- Closes #<issue> -->
