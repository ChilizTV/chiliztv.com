import type { BrowseLeagueDto } from "@chiliztv/shared/dto/matches/BrowseMatchesDto";

function minutesAgo(n: number): string {
  return new Date(Date.now() - n * 60_000).toISOString();
}
function hoursFromNow(n: number): string {
  return new Date(Date.now() + n * 3_600_000).toISOString();
}

export const MOCK_LEAGUES: BrowseLeagueDto[] = [
  {
    league: { id: 1, name: "UEFA Champions League", logoUrl: null, country: null },
    matches: [
      {
        id: 101,
        homeTeam: { name: "PSG", logoUrl: "https://media.api-sports.io/football/teams/85.png" },
        awayTeam: { name: "Juventus", logoUrl: "https://media.api-sports.io/football/teams/496.png" },
        kickoffAt: minutesAgo(67),
        status: "2H",
        score: { home: 2, away: 1 },
        odds: { home: 1.85, draw: 3.5, away: 4.2 },
        streamsPreview: [
          { streamId: "s-101-a", streamerName: "FootballKing", thumbnailUrl: null, viewers: 4821 },
          { streamId: "s-101-b", streamerName: "LivePredictionPro", thumbnailUrl: null, viewers: 2134 },
        ],
      },
      {
        id: 102,
        homeTeam: { name: "Barcelona", logoUrl: "https://media.api-sports.io/football/teams/529.png" },
        awayTeam: { name: "Real Madrid", logoUrl: "https://media.api-sports.io/football/teams/541.png" },
        kickoffAt: hoursFromNow(2),
        status: "NS",
        score: null,
        odds: { home: 2.1, draw: 3.2, away: 3.6 },
        streamsPreview: [],
      },
    ],
  },
  {
    league: { id: 2, name: "Premier League", logoUrl: null, country: "England" },
    matches: [
      {
        id: 201,
        homeTeam: { name: "Man City", logoUrl: "https://media.api-sports.io/football/teams/50.png" },
        awayTeam: { name: "Liverpool", logoUrl: "https://media.api-sports.io/football/teams/40.png" },
        kickoffAt: minutesAgo(34),
        status: "1H",
        score: { home: 1, away: 1 },
        odds: { home: 2.0, draw: 3.4, away: 3.8 },
        streamsPreview: [
          { streamId: "s-201-a", streamerName: "GoalPredictor", thumbnailUrl: null, viewers: 6540 },
        ],
      },
    ],
  },
];
