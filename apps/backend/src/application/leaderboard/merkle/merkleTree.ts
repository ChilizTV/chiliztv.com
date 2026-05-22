import { encodeAbiParameters, keccak256, concat, type Hex } from 'viem';

/**
 * Leaf format mirrors `LeaderboardRewards._leaf` ([LeaderboardRewards.sol:427-432](apps/smart-contracts/chiliz-tv/src/leaderboard/LeaderboardRewards.sol)):
 *
 *     leaf = keccak256(bytes.concat(keccak256(abi.encode(user, amount))))
 *
 * The double-hash matches OpenZeppelin's MerkleProof convention and blocks
 * second-preimage attacks where an intermediate node could masquerade as a
 * leaf. Tests pin this byte-for-byte against `@openzeppelin/merkle-tree`.
 */
export function leafHash(user: Hex, amount: bigint): Hex {
    const inner = keccak256(
        encodeAbiParameters(
            [
                { name: 'user', type: 'address' },
                { name: 'amount', type: 'uint256' },
            ],
            [user, amount],
        ),
    );
    return keccak256(inner);
}

/** Sorted-pair hashing — required by OZ MerkleProof.verify. */
function hashPair(a: Hex, b: Hex): Hex {
    const [lo, hi] = a < b ? [a, b] : [b, a];
    return keccak256(concat([lo, hi]));
}

/**
 * Build the merkle tree from a list of leaves. The return tree is a list of
 * layers, layer 0 = leaves, last layer = root. Empty siblings are duplicated
 * (OZ MerkleProof.verify is tolerant of odd-sized layers).
 */
export function buildLayers(leaves: ReadonlyArray<Hex>): Hex[][] {
    if (leaves.length === 0) {
        throw new Error('Cannot build merkle tree from empty leaf set');
    }
    const layers: Hex[][] = [leaves.slice()];
    while (layers[layers.length - 1].length > 1) {
        const cur = layers[layers.length - 1];
        const next: Hex[] = [];
        for (let i = 0; i < cur.length; i += 2) {
            const left = cur[i];
            const right = i + 1 < cur.length ? cur[i + 1] : cur[i];
            next.push(hashPair(left, right));
        }
        layers.push(next);
    }
    return layers;
}

export function merkleRoot(leaves: ReadonlyArray<Hex>): Hex {
    const layers = buildLayers(leaves);
    return layers[layers.length - 1][0];
}

/**
 * Generate the proof for `leafIndex` — list of sibling hashes from the leaf
 * up to (but excluding) the root. Compatible with OZ MerkleProof.verify.
 */
export function merkleProof(leaves: ReadonlyArray<Hex>, leafIndex: number): Hex[] {
    if (leafIndex < 0 || leafIndex >= leaves.length) {
        throw new Error(`leafIndex ${leafIndex} out of bounds [0, ${leaves.length})`);
    }
    const layers = buildLayers(leaves);
    const proof: Hex[] = [];
    let idx = leafIndex;
    for (let l = 0; l < layers.length - 1; l++) {
        const layer = layers[l];
        const siblingIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
        const sibling = siblingIdx < layer.length ? layer[siblingIdx] : layer[idx];
        proof.push(sibling);
        idx = Math.floor(idx / 2);
    }
    return proof;
}

/** Local mirror of OZ MerkleProof.verify — used by unit tests. */
export function verifyProof(leaf: Hex, proof: ReadonlyArray<Hex>, root: Hex): boolean {
    let computed: Hex = leaf;
    for (const sibling of proof) {
        computed = hashPair(computed, sibling);
    }
    return computed === root;
}

/** End-to-end builder: leaves → root + per-leaf proofs. */
export interface MerkleArtifacts {
    readonly root: Hex;
    readonly proofs: ReadonlyArray<ReadonlyArray<Hex>>;
}

export function buildMerkleArtifacts(
    entries: ReadonlyArray<{ user: Hex; amount: bigint }>,
): MerkleArtifacts {
    if (entries.length === 0) {
        throw new Error('Cannot build merkle artifacts from empty entries');
    }
    const leaves = entries.map((e) => leafHash(e.user, e.amount));
    return {
        root: merkleRoot(leaves),
        proofs: entries.map((_e, idx) => merkleProof(leaves, idx)),
    };
}
