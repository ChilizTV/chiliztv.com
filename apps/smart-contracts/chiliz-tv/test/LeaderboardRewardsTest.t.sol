// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test}            from "forge-std/Test.sol";
import {ERC1967Proxy}    from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import {LeaderboardRewards} from "../src/leaderboard/LeaderboardRewards.sol";
import {MockUSDC}           from "./mocks/MockUSDC.sol";

/**
 * @title LeaderboardRewardsTest
 * @notice Coverage for the leaderboard contract:
 *           1.  Initialization
 *           2.  recordWin auth (factory.isMatch + role-less)
 *           3.  Score accumulation across multiple winners
 *           4.  Epoch close: snapshot, merkle root, claim expiry
 *           5.  Claim with valid proof (single-leaf root)
 *           6.  Claim with invalid proof rejected
 *           7.  Double-claim rejected
 *           8.  Claim after expiry rejected
 *           9.  Two-user merkle distribution
 *          10.  Rollover after expiry returns unclaimed funds
 *          11.  Pause blocks recordWin + claim
 *          12.  Multi-epoch lifecycle invariants
 */
contract LeaderboardRewardsTest is Test {

    // ═══════════════════════════════════════════════════════════════════════
    // ACTORS
    // ═══════════════════════════════════════════════════════════════════════

    address public admin   = makeAddr("admin");
    address public oracle  = makeAddr("oracle");
    address public alice   = makeAddr("alice");
    address public bob     = makeAddr("bob");
    address public stranger = makeAddr("stranger");

    // ═══════════════════════════════════════════════════════════════════════
    // CONTRACTS
    // ═══════════════════════════════════════════════════════════════════════

    MockUSDC public usdc;
    LeaderboardRewards public lb;
    MockMatchFactory public mockFactory;
    address public matchA;  // authorized by mockFactory
    address public matchB;  // authorized by mockFactory

    // Hardcoded so it matches the contract.
    bytes32 constant ADMIN_ROLE    = keccak256("ADMIN_ROLE");
    bytes32 constant ORACLE_ROLE   = keccak256("ORACLE_ROLE");
    bytes32 constant PAUSER_ROLE   = keccak256("PAUSER_ROLE");
    bytes32 constant DEFAULT_ADMIN = 0x00;

    function setUp() public {
        usdc = new MockUSDC();

        LeaderboardRewards impl = new LeaderboardRewards();
        bytes memory init = abi.encodeWithSelector(
            LeaderboardRewards.initialize.selector,
            address(usdc),
            admin,
            oracle
        );
        lb = LeaderboardRewards(address(new ERC1967Proxy(address(impl), init)));

        // Plug in a mock factory that authorizes matchA + matchB.
        mockFactory = new MockMatchFactory();
        matchA = makeAddr("matchA");
        matchB = makeAddr("matchB");
        mockFactory.setMatch(matchA, true);
        mockFactory.setMatch(matchB, true);

        vm.prank(admin);
        lb.setMatchFactory(address(mockFactory));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 1. INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════

    function test_Initialize_RolesGranted() public view {
        assertTrue(lb.hasRole(DEFAULT_ADMIN, admin),  "admin gets DEFAULT_ADMIN");
        assertTrue(lb.hasRole(ADMIN_ROLE,    admin),  "admin gets ADMIN_ROLE");
        assertTrue(lb.hasRole(PAUSER_ROLE,   admin),  "admin gets PAUSER_ROLE");
        assertTrue(lb.hasRole(ORACLE_ROLE,   oracle), "oracle gets ORACLE_ROLE");
        assertEq(address(lb.usdcToken()), address(usdc));
        assertEq(lb.epochIndex(), 0);
    }

    function test_Revert_InitializeTwice() public {
        vm.expectRevert();
        lb.initialize(address(usdc), admin, oracle);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 2. recordWin AUTH
    // ═══════════════════════════════════════════════════════════════════════

    function test_RecordWin_AuthorizedMatch() public {
        vm.prank(matchA);
        lb.recordWin(alice, 100e6);
        assertEq(lb.score(alice), 100e6);
    }

    function test_Revert_RecordWin_UnauthorizedCaller() public {
        vm.prank(stranger);
        vm.expectRevert(
            abi.encodeWithSelector(LeaderboardRewards.UnauthorizedMatch.selector, stranger)
        );
        lb.recordWin(alice, 100e6);
    }

    function test_Revert_RecordWin_NoFactorySet() public {
        // Deploy a fresh proxy WITHOUT calling setMatchFactory.
        LeaderboardRewards impl = new LeaderboardRewards();
        bytes memory init = abi.encodeWithSelector(
            LeaderboardRewards.initialize.selector,
            address(usdc),
            admin,
            oracle
        );
        LeaderboardRewards bare = LeaderboardRewards(address(new ERC1967Proxy(address(impl), init)));

        vm.prank(matchA);
        vm.expectRevert(LeaderboardRewards.MatchFactoryNotSet.selector);
        bare.recordWin(alice, 100e6);
    }

    function test_RecordWin_ZeroAmountIsNoOp() public {
        vm.prank(matchA);
        lb.recordWin(alice, 0);
        assertEq(lb.score(alice), 0, "no event, no score change");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 3. SCORE ACCUMULATION
    // ═══════════════════════════════════════════════════════════════════════

    function test_Score_AccumulatesAcrossMatches() public {
        vm.prank(matchA); lb.recordWin(alice, 100e6);
        vm.prank(matchB); lb.recordWin(alice, 250e6);
        vm.prank(matchA); lb.recordWin(bob,    50e6);

        assertEq(lb.score(alice), 350e6);
        assertEq(lb.score(bob),    50e6);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 4. EPOCH CLOSE
    // ═══════════════════════════════════════════════════════════════════════

    function test_CloseEpoch_SnapshotsPool() public {
        usdc.mint(address(lb), 1000e6);

        bytes32 root = _singleLeafRoot(alice, 500e6);

        vm.prank(oracle);
        uint256 closed = lb.closeEpoch(root, 7 days);
        assertEq(closed, 0);

        LeaderboardRewards.Epoch memory ep = lb.epoch(0);
        assertEq(ep.prizePool, 1000e6, "pool snapshotted at close time");
        assertEq(ep.merkleRoot, root);
        assertTrue(ep.closed);
        assertEq(uint256(ep.claimExpiry), block.timestamp + 7 days);
        assertEq(lb.epochIndex(), 1, "epoch index incremented");
        assertEq(lb.lockedInClosedEpochs(), 1000e6);
        assertEq(lb.openPrizePool(), 0, "all funds locked");
    }

    function test_Revert_CloseEpoch_NotOracle() public {
        vm.prank(stranger);
        vm.expectRevert();
        lb.closeEpoch(bytes32(uint256(1)), 1 days);
    }

    function test_Revert_CloseEpoch_ZeroClaimDuration() public {
        uint256 maxDur = lb.MAX_CLAIM_DURATION();
        vm.prank(oracle);
        vm.expectRevert(
            abi.encodeWithSelector(
                LeaderboardRewards.InvalidClaimDuration.selector,
                uint256(0),
                maxDur
            )
        );
        lb.closeEpoch(bytes32(uint256(1)), 0);
    }

    function test_Revert_CloseEpoch_ClaimDurationTooLarge() public {
        uint256 maxDur  = lb.MAX_CLAIM_DURATION();
        uint256 tooLong = maxDur + 1;
        vm.prank(oracle);
        vm.expectRevert(
            abi.encodeWithSelector(
                LeaderboardRewards.InvalidClaimDuration.selector,
                tooLong,
                maxDur
            )
        );
        lb.closeEpoch(bytes32(uint256(1)), tooLong);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 5. CLAIM (single-leaf merkle root)
    // ═══════════════════════════════════════════════════════════════════════

    function test_Claim_SingleLeaf_TransfersUsdc() public {
        usdc.mint(address(lb), 1000e6);

        bytes32 root = _singleLeafRoot(alice, 500e6);
        vm.prank(oracle);
        lb.closeEpoch(root, 7 days);

        // For a one-leaf tree, root == leaf and the proof is empty.
        bytes32[] memory proof = new bytes32[](0);

        uint256 before = usdc.balanceOf(alice);
        vm.prank(alice);
        lb.claim(0, 500e6, proof);
        assertEq(usdc.balanceOf(alice) - before, 500e6);
        assertTrue(lb.hasClaimed(0, alice));

        LeaderboardRewards.Epoch memory ep = lb.epoch(0);
        assertEq(ep.totalClaimed, 500e6);
        assertEq(lb.lockedInClosedEpochs(), 500e6, "remainder still locked until rollover");
    }

    function test_Revert_Claim_InvalidProof() public {
        usdc.mint(address(lb), 1000e6);
        bytes32 root = _singleLeafRoot(alice, 500e6);
        vm.prank(oracle);
        lb.closeEpoch(root, 7 days);

        // Wrong amount → leaf doesn't match.
        bytes32[] memory proof = new bytes32[](0);
        vm.prank(alice);
        vm.expectRevert(LeaderboardRewards.InvalidMerkleProof.selector);
        lb.claim(0, 600e6, proof);
    }

    function test_Revert_Claim_DoubleClaim() public {
        usdc.mint(address(lb), 1000e6);
        bytes32 root = _singleLeafRoot(alice, 500e6);
        vm.prank(oracle);
        lb.closeEpoch(root, 7 days);

        bytes32[] memory proof = new bytes32[](0);
        vm.prank(alice);
        lb.claim(0, 500e6, proof);

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(LeaderboardRewards.AlreadyClaimed.selector, uint256(0), alice)
        );
        lb.claim(0, 500e6, proof);
    }

    function test_Revert_Claim_AfterExpiry() public {
        usdc.mint(address(lb), 1000e6);
        bytes32 root = _singleLeafRoot(alice, 500e6);
        vm.prank(oracle);
        lb.closeEpoch(root, 7 days);

        vm.warp(block.timestamp + 7 days + 1);

        bytes32[] memory proof = new bytes32[](0);
        vm.prank(alice);
        vm.expectRevert();
        lb.claim(0, 500e6, proof);
    }

    function test_Revert_Claim_EpochNotClosed() public {
        bytes32[] memory proof = new bytes32[](0);
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(LeaderboardRewards.EpochNotClosed.selector, uint256(0))
        );
        lb.claim(0, 500e6, proof);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 6. TWO-USER MERKLE
    // ═══════════════════════════════════════════════════════════════════════

    /// Build a 2-leaf merkle tree, close the epoch, both users claim.
    function test_Claim_TwoLeaf_BothUsersClaim() public {
        uint256 alicePrize = 600e6;
        uint256 bobPrize   = 400e6;

        usdc.mint(address(lb), 1000e6);

        // Leaves (OZ double-hash convention).
        bytes32 leafA = keccak256(bytes.concat(keccak256(abi.encode(alice, alicePrize))));
        bytes32 leafB = keccak256(bytes.concat(keccak256(abi.encode(bob,   bobPrize))));

        // 2-leaf parent: hash of (min(leafA, leafB), max(leafA, leafB)).
        // (OZ's MerkleProof._hashPair sorts by lexicographic byte order.)
        bytes32 root = _hashPair(leafA, leafB);

        vm.prank(oracle);
        lb.closeEpoch(root, 7 days);

        // Alice's proof is just [leafB]; Bob's is [leafA].
        bytes32[] memory proofA = new bytes32[](1);
        proofA[0] = leafB;
        bytes32[] memory proofB = new bytes32[](1);
        proofB[0] = leafA;

        uint256 aBefore = usdc.balanceOf(alice);
        vm.prank(alice);
        lb.claim(0, alicePrize, proofA);
        assertEq(usdc.balanceOf(alice) - aBefore, alicePrize);

        uint256 bBefore = usdc.balanceOf(bob);
        vm.prank(bob);
        lb.claim(0, bobPrize, proofB);
        assertEq(usdc.balanceOf(bob) - bBefore, bobPrize);

        LeaderboardRewards.Epoch memory ep = lb.epoch(0);
        assertEq(ep.totalClaimed, alicePrize + bobPrize, "all prizes claimed");
        assertEq(lb.lockedInClosedEpochs(), 0, "pool fully released");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 7. ROLLOVER
    // ═══════════════════════════════════════════════════════════════════════

    function test_Rollover_ReturnsUnclaimedToOpenPool() public {
        usdc.mint(address(lb), 1000e6);
        bytes32 root = _singleLeafRoot(alice, 500e6);
        vm.prank(oracle);
        lb.closeEpoch(root, 7 days);

        // Nobody claims. Warp past expiry.
        vm.warp(block.timestamp + 7 days + 1);

        uint256 rolled = lb.rolloverEpoch(0);
        assertEq(rolled, 1000e6, "full pool rolled");
        assertEq(lb.lockedInClosedEpochs(), 0);
        assertEq(lb.openPrizePool(), 1000e6, "released into open pool");

        // A second close picks up the rolled-over balance.
        bytes32 root2 = _singleLeafRoot(bob, 1000e6);
        vm.prank(oracle);
        lb.closeEpoch(root2, 1 days);

        LeaderboardRewards.Epoch memory ep2 = lb.epoch(1);
        assertEq(ep2.prizePool, 1000e6, "next epoch inherits rolled funds");
    }

    function test_Revert_Rollover_BeforeExpiry() public {
        usdc.mint(address(lb), 1000e6);
        bytes32 root = _singleLeafRoot(alice, 500e6);
        vm.prank(oracle);
        lb.closeEpoch(root, 7 days);

        vm.expectRevert();
        lb.rolloverEpoch(0);
    }

    function test_Rollover_PartiallyClaimed() public {
        usdc.mint(address(lb), 1000e6);
        bytes32 root = _singleLeafRoot(alice, 500e6);
        vm.prank(oracle);
        lb.closeEpoch(root, 7 days);

        bytes32[] memory proof = new bytes32[](0);
        vm.prank(alice);
        lb.claim(0, 500e6, proof);

        vm.warp(block.timestamp + 7 days + 1);
        uint256 rolled = lb.rolloverEpoch(0);
        assertEq(rolled, 500e6, "only the unclaimed remainder rolls");
        assertEq(lb.lockedInClosedEpochs(), 0);
        assertEq(lb.openPrizePool(), 500e6);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 8. PAUSE
    // ═══════════════════════════════════════════════════════════════════════

    function test_Pause_BlocksRecordWin() public {
        vm.prank(admin);
        lb.emergencyPause();

        vm.prank(matchA);
        vm.expectRevert();
        lb.recordWin(alice, 100e6);
    }

    function test_Pause_BlocksClaim() public {
        usdc.mint(address(lb), 1000e6);
        bytes32 root = _singleLeafRoot(alice, 500e6);
        vm.prank(oracle);
        lb.closeEpoch(root, 7 days);

        vm.prank(admin);
        lb.emergencyPause();

        bytes32[] memory proof = new bytes32[](0);
        vm.prank(alice);
        vm.expectRevert();
        lb.claim(0, 500e6, proof);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 9. ACCESS CONTROL
    // ═══════════════════════════════════════════════════════════════════════

    function test_Revert_SetMatchFactory_NotAdmin() public {
        vm.prank(stranger);
        vm.expectRevert();
        lb.setMatchFactory(address(mockFactory));
    }

    function test_Revert_SetMatchFactory_ZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert(LeaderboardRewards.ZeroAddress.selector);
        lb.setMatchFactory(address(0));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    /// @dev Single-leaf tree root: leaf is the root, proof is empty.
    function _singleLeafRoot(address user, uint256 amount) internal pure returns (bytes32) {
        return keccak256(bytes.concat(keccak256(abi.encode(user, amount))));
    }

    /// @dev OpenZeppelin MerkleProof._hashPair: lex-sorted concat then keccak.
    function _hashPair(bytes32 a, bytes32 b) internal pure returns (bytes32) {
        return a < b
            ? keccak256(abi.encodePacked(a, b))
            : keccak256(abi.encodePacked(b, a));
    }
}

/// @dev Tiny stub that mimics `PariMatchFactory.isMatch`. The leaderboard
///      reads this through the `IPariMatchFactoryView` interface, so the
///      stub doesn't need anything else.
contract MockMatchFactory {
    mapping(address => bool) public isMatch;
    function setMatch(address m, bool v) external { isMatch[m] = v; }
}
