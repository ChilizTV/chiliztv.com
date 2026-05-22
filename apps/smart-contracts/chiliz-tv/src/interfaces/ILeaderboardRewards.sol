// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title ILeaderboardRewards
 * @notice Minimal sink interface used by PariMatchBase to notify the
 *         leaderboard contract every time a winner claims their payout.
 *
 *         The match calls `recordWin(user, payout)` from `_processClaim`
 *         AFTER the USDC transfer to the user has succeeded. The call is
 *         wrapped in `try/catch` on the match side, so a misbehaving or
 *         paused leaderboard cannot block claims.
 */
interface ILeaderboardRewards {
    /**
     * @notice Credit `payout` USDC to `user`'s cumulative leaderboard score.
     * @dev    Called by authorized `PariMatch` proxies (`RECORDER_ROLE`).
     *         Reverts must be caught by the caller — never propagated.
     */
    function recordWin(address user, uint256 payout) external;
}
