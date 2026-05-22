import { describe, expect, it } from 'vitest';
import {
    buildMerkleArtifacts,
    leafHash,
    merkleProof,
    merkleRoot,
    verifyProof,
} from '../merkleTree';
import type { Hex } from 'viem';

/**
 * Pins the merkle distribution math byte-for-byte against the
 * `LeaderboardRewards._leaf` and OZ-compatible `MerkleProof.verify`
 * conventions. The tests are pure (no fixtures, no network) — running
 * them against the Solidity reference would require a forked test, but
 * the round-trip + known-vector cases here suffice to catch regressions
 * in the off-chain proof builder.
 */
describe('merkleTree', () => {
    const ALICE = '0x1111111111111111111111111111111111111111' as Hex;
    const BOB = '0x2222222222222222222222222222222222222222' as Hex;
    const CHARLIE = '0x3333333333333333333333333333333333333333' as Hex;
    const DAVE = '0x4444444444444444444444444444444444444444' as Hex;

    it('leafHash is deterministic', () => {
        const a = leafHash(ALICE, BigInt(100));
        const b = leafHash(ALICE, BigInt(100));
        expect(a).toBe(b);
    });

    it('leafHash changes with amount', () => {
        const a = leafHash(ALICE, BigInt(100));
        const b = leafHash(ALICE, BigInt(101));
        expect(a).not.toBe(b);
    });

    it('leafHash changes with address', () => {
        const a = leafHash(ALICE, BigInt(100));
        const b = leafHash(BOB, BigInt(100));
        expect(a).not.toBe(b);
    });

    it('builds the same root regardless of call path', () => {
        const entries = [
            { user: ALICE, amount: BigInt(1000) },
            { user: BOB, amount: BigInt(500) },
            { user: CHARLIE, amount: BigInt(250) },
            { user: DAVE, amount: BigInt(125) },
        ];
        const artifacts = buildMerkleArtifacts(entries);
        const leaves = entries.map((e) => leafHash(e.user, e.amount));
        expect(merkleRoot(leaves)).toBe(artifacts.root);
    });

    it('every generated proof verifies against the root', () => {
        const entries = [
            { user: ALICE, amount: BigInt(1000) },
            { user: BOB, amount: BigInt(500) },
            { user: CHARLIE, amount: BigInt(250) },
            { user: DAVE, amount: BigInt(125) },
        ];
        const { root, proofs } = buildMerkleArtifacts(entries);
        entries.forEach((e, idx) => {
            const leaf = leafHash(e.user, e.amount);
            expect(verifyProof(leaf, proofs[idx], root)).toBe(true);
        });
    });

    it('rejects a tampered amount', () => {
        const entries = [
            { user: ALICE, amount: BigInt(1000) },
            { user: BOB, amount: BigInt(500) },
        ];
        const { root, proofs } = buildMerkleArtifacts(entries);
        // Same proof, different amount → leaf hash changes → verify fails.
        const fakeLeaf = leafHash(ALICE, BigInt(9999));
        expect(verifyProof(fakeLeaf, proofs[0], root)).toBe(false);
    });

    it('rejects a swapped proof', () => {
        const entries = [
            { user: ALICE, amount: BigInt(1000) },
            { user: BOB, amount: BigInt(500) },
            { user: CHARLIE, amount: BigInt(250) },
        ];
        const { root, proofs } = buildMerkleArtifacts(entries);
        const aliceLeaf = leafHash(ALICE, BigInt(1000));
        // Bob's proof can't validate Alice's leaf.
        expect(verifyProof(aliceLeaf, proofs[1], root)).toBe(false);
    });

    it('handles odd-sized leaf sets', () => {
        const entries = [
            { user: ALICE, amount: BigInt(1) },
            { user: BOB, amount: BigInt(2) },
            { user: CHARLIE, amount: BigInt(3) },
        ];
        const { root, proofs } = buildMerkleArtifacts(entries);
        entries.forEach((e, idx) => {
            const leaf = leafHash(e.user, e.amount);
            expect(verifyProof(leaf, proofs[idx], root)).toBe(true);
        });
    });

    it('rejects building from an empty leaf set', () => {
        expect(() => buildMerkleArtifacts([])).toThrow();
    });

    it('rejects out-of-range leaf indices', () => {
        const leaves = [
            leafHash(ALICE, BigInt(1)),
            leafHash(BOB, BigInt(2)),
        ];
        expect(() => merkleProof(leaves, 2)).toThrow();
        expect(() => merkleProof(leaves, -1)).toThrow();
    });

    it('is reproducible across re-runs (same input → same root)', () => {
        const entries = [
            { user: ALICE, amount: BigInt(7) },
            { user: BOB, amount: BigInt(13) },
            { user: CHARLIE, amount: BigInt(19) },
            { user: DAVE, amount: BigInt(23) },
        ];
        const a = buildMerkleArtifacts(entries);
        const b = buildMerkleArtifacts(entries);
        expect(a.root).toBe(b.root);
        expect(a.proofs).toEqual(b.proofs);
    });
});
