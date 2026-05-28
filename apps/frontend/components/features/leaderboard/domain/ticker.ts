// Facts derived from the live DTO so the ticker can't drift when the admin
// rotates LEADERBOARD_TOP_N or LEADERBOARD_CLAIM_DURATION_DAYS on the CLI.

export function buildTickerItems(
    topN: number,
    claimDurationDays: number,
): ReadonlyArray<string> {
    return [
        'Live now',
        `Top ${topN} paid in USDC`,
        'Pro-rata by score',
        `Claim window ${claimDurationDays} days`,
        'On-chain payouts',
        'Predict to qualify',
        'Pool builds from every winning market',
    ];
}
