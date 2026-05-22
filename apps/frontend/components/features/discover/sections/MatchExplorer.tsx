"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    EmptyState,
    FilterBar,
    LeagueSection,
    leagueKey,
    type TabDescriptor,
} from "../components";
import {
    groupByLeague,
    isLive,
    sortMatches,
    type FlatMatch,
    type LeagueDto,
    type MatchTab,
    type SortMode,
} from "../domain";
import { useMatchesByPoolStatus } from "../hooks";
import { BeFirstStrip } from "./BeFirstStrip";

const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);

export function MatchExplorer({
    matches,
    leagues,
    now,
    isLoading = false,
}: {
    matches: FlatMatch[];
    leagues: LeagueDto[];
    /** `null` until the client clock has been initialised post-hydration. */
    now: Date | null;
    isLoading?: boolean;
}) {
    const router = useRouter();
    const [tab, setTab] = useState<MatchTab>("all");
    const [league, setLeague] = useState<string | null>(null);
    const [sort, setSort] = useState<SortMode>("time_asc");
    const [showFinished, setShowFinished] = useState(true);

    const liveCount = useMemo(
        () => matches.filter((m) => isLive(m.status)).length,
        [matches],
    );
    const upcomingCount = useMemo(
        () => matches.filter((m) => m.status === "NS").length,
        [matches],
    );

    const filtered = useMemo(() => {
        let arr = matches;
        if (!showFinished) arr = arr.filter((m) => !FINISHED_STATUSES.has(m.status));
        if (tab === "live") arr = arr.filter((m) => isLive(m.status));
        if (tab === "upcoming") arr = arr.filter((m) => m.status === "NS");
        if (league) arr = arr.filter((m) => `${m.leagueId}_${m.leagueName}` === league);
        return sortMatches(arr, sort);
    }, [matches, tab, league, sort, showFinished]);

    // Batched pool snapshot for every visible match — drives the league
    // header "Total staked $X" + the empty/pooled partition consumed by
    // BeFirstStrip. Re-uses the same React Query cache as the per-card
    // `useMarketPools` calls, so no duplicated network requests.
    const { pooled, empty, poolByContract } = useMatchesByPoolStatus(filtered);

    // Leagues are now the default layout. Sort direction stays under user
    // control via the FilterBar — `league_desc` flips group order.
    const groups = useMemo(() => {
        const direction = sort === "league_desc" ? "desc" : "asc";
        return groupByLeague(pooled, direction);
    }, [pooled, sort]);

    // BeFirstStrip targets pre-kickoff matches — staking on a live or
    // finished market is rejected on-chain anyway (`StateNotOpen` revert).
    const seedable = useMemo(
        () => empty.filter((m) => m.status === "NS"),
        [empty],
    );

    const goToMatch = useCallback(
        (m: FlatMatch) => router.push(`/live/${m.id}`),
        [router],
    );

    const tabs: TabDescriptor[] = [
        { key: "all", label: "All", count: matches.length },
        { key: "live", label: "Live", count: liveCount },
        { key: "upcoming", label: "Upcoming", count: upcomingCount },
    ];

    const nothingFiltered = filtered.length === 0;
    const nothingToShow = groups.length === 0 && seedable.length === 0;

    return (
        <section id="explorer" className="relative z-[4]">
            <FilterBar
                tabs={tabs}
                activeTab={tab}
                onTab={setTab}
                leagues={leagues}
                activeLeague={league}
                onLeague={setLeague}
                sortMode={sort}
                onSort={setSort}
                showFinished={showFinished}
                onToggleFinished={() => setShowFinished((v) => !v)}
            />

            <div className="mx-auto max-w-[1400px] px-8 pb-20 pt-12 sm:px-14 sm:pb-28 sm:pt-16">
                {nothingFiltered ? (
                    isLoading ? (
                        <EmptyState
                            label="Loading matches"
                            hint="Fetching live fixtures from the network…"
                        />
                    ) : matches.length === 0 ? (
                        <EmptyState
                            label="No matches available"
                            hint="Live data is unavailable. Check back at kickoff."
                        />
                    ) : (
                        <EmptyState
                            label={
                                tab === "live"
                                    ? "No live matches right now"
                                    : "Nothing matches that filter"
                            }
                            hint="Try clearing the league or switching tab."
                        />
                    )
                ) : nothingToShow ? (
                    <EmptyState
                        label="Quiet pools"
                        hint="Pool snapshots are still loading — refresh in a few seconds."
                    />
                ) : (
                    groups.map((g) => {
                        const total = g.matches.reduce((sum, m) => {
                            const addr = m.contractAddress?.toLowerCase();
                            return sum + (addr ? (poolByContract.get(addr) ?? BigInt(0)) : BigInt(0));
                        }, BigInt(0));
                        return (
                            <LeagueSection
                                key={g.leagueId}
                                league={g.leagueName}
                                logo={g.leagueLogo}
                                matches={g.matches}
                                now={now}
                                totalPool={total}
                                onPredict={goToMatch}
                                onWatch={goToMatch}
                            />
                        );
                    })
                )}
            </div>

            <BeFirstStrip matches={seedable} now={now} onPredict={goToMatch} />
        </section>
    );
}

// Re-export leagueKey for tests / parents that need to derive a key.
export { leagueKey };
