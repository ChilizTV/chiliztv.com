import type { BrowseMatchDto, StreamPreviewDto } from "@chiliztv/shared/dto/matches/BrowseMatchesDto";
import type { LeagueDto } from "./types";

const minutesAgo = (n: number) =>
  new Date(Date.now() - n * 60_000).toISOString();
const minutesFrom = (n: number) =>
  new Date(Date.now() + n * 60_000).toISOString();

/** api-sports.io CDN — same source the real BrowseMatches API uses. */
const T = (id: number) =>
  `https://media.api-sports.io/football/teams/${id}.png`;
const L = (id: number) =>
  `https://media.api-sports.io/football/leagues/${id}.png`;

const stream = (
  id: string,
  name: string,
  viewers: number,
  thumb: string | null = null,
): StreamPreviewDto => ({
  streamId: id,
  streamerName: name,
  thumbnailUrl: thumb,
  viewers,
});

const mk = (
  id: number,
  status: string,
  kickoff: string,
  home: { name: string; logoUrl: string | null },
  away: { name: string; logoUrl: string | null },
  score: { home: number; away: number } | null,
  odds: { home: number | null; draw: number | null; away: number | null } | null,
  streamsPreview: StreamPreviewDto[],
): BrowseMatchDto => ({
  id,
  status,
  kickoffAt: kickoff,
  homeTeam: home,
  awayTeam: away,
  score,
  odds,
  streamsPreview,
});

/**
 * 14 mock matches across 5 leagues — 8 live, 6 upcoming. Used as a fallback
 * when the BrowseMatches API hasn't returned data yet, so the design always
 * has something to render.
 */
export const MOCK_LEAGUES: LeagueDto[] = [
  {
    league: {
      id: 2,
      name: "UEFA Champions League",
      logoUrl: L(2),
      country: "World",
    },
    matches: [
      mk(
        101,
        "2H",
        minutesAgo(67),
        { name: "PSG", logoUrl: T(85) },
        { name: "Juventus", logoUrl: T(496) },
        { home: 2, away: 1 },
        { home: 1.42, draw: 4.1, away: 5.8 },
        [
          stream("s101a", "FootballKing", 4821),
          stream("s101b", "OnchainOracle", 2134),
          stream("s101c", "ParcDesPrinces", 1402),
        ],
      ),
      mk(
        102,
        "1H",
        minutesAgo(34),
        { name: "Bayern", logoUrl: T(157) },
        { name: "Inter", logoUrl: T(505) },
        { home: 1, away: 0 },
        { home: 1.95, draw: 3.4, away: 3.8 },
        [
          stream("s102a", "AllianzAR", 6842),
          stream("s102b", "DegenFan.eth", 3210),
        ],
      ),
      mk(
        103,
        "NS",
        minutesFrom(95),
        { name: "Barcelona", logoUrl: T(529) },
        { name: "Real Madrid", logoUrl: T(541) },
        null,
        { home: 2.1, draw: 3.2, away: 3.6 },
        [],
      ),
      mk(
        104,
        "NS",
        minutesFrom(180),
        { name: "Atlético Madrid", logoUrl: T(530) },
        { name: "Napoli", logoUrl: T(492) },
        null,
        { home: 1.8, draw: 3.5, away: 4.4 },
        [],
      ),
    ],
  },
  {
    league: {
      id: 39,
      name: "Premier League",
      logoUrl: L(39),
      country: "England",
    },
    matches: [
      mk(
        201,
        "2H",
        minutesAgo(58),
        { name: "Man City", logoUrl: T(50) },
        { name: "Liverpool", logoUrl: T(40) },
        { home: 1, away: 1 },
        { home: 2.0, draw: 3.4, away: 3.8 },
        [
          stream("s201a", "GoalPredictor", 6540),
          stream("s201b", "EtihadCam", 2914),
        ],
      ),
      mk(
        202,
        "1H",
        minutesAgo(23),
        { name: "Arsenal", logoUrl: T(42) },
        { name: "Tottenham", logoUrl: T(47) },
        { home: 0, away: 0 },
        { home: 1.75, draw: 3.6, away: 4.5 },
        [stream("s202a", "EmiratesLive", 4185)],
      ),
      mk(
        203,
        "NS",
        minutesFrom(40),
        { name: "Chelsea", logoUrl: T(49) },
        { name: "Aston Villa", logoUrl: T(66) },
        null,
        { home: 1.62, draw: 4.0, away: 5.2 },
        [],
      ),
      mk(
        204,
        "NS",
        minutesFrom(140),
        { name: "Newcastle", logoUrl: T(34) },
        { name: "Brighton", logoUrl: T(51) },
        null,
        { home: 1.85, draw: 3.5, away: 4.2 },
        [],
      ),
    ],
  },
  {
    league: { id: 135, name: "Serie A", logoUrl: L(135), country: "Italy" },
    matches: [
      mk(
        301,
        "2H",
        minutesAgo(72),
        { name: "AC Milan", logoUrl: T(489) },
        { name: "Roma", logoUrl: T(497) },
        { home: 2, away: 2 },
        { home: 2.3, draw: 3.1, away: 3.2 },
        [
          stream("s301a", "SanSiroNight", 3504),
          stream("s301b", "RomaUltras", 1720),
        ],
      ),
      mk(
        302,
        "NS",
        minutesFrom(220),
        { name: "Lazio", logoUrl: T(487) },
        { name: "Juventus", logoUrl: T(496) },
        null,
        { home: 2.8, draw: 3.1, away: 2.5 },
        [],
      ),
    ],
  },
  {
    league: { id: 140, name: "La Liga", logoUrl: L(140), country: "Spain" },
    matches: [
      mk(
        401,
        "1H",
        minutesAgo(18),
        { name: "Sevilla", logoUrl: T(536) },
        { name: "Real Sociedad", logoUrl: T(548) },
        { home: 0, away: 1 },
        { home: 2.5, draw: 3.2, away: 2.9 },
        [stream("s401a", "PizjuanLive", 1604)],
      ),
      mk(
        402,
        "ET",
        minutesAgo(105),
        { name: "Athletic Bilbao", logoUrl: T(531) },
        { name: "Valencia", logoUrl: T(532) },
        { home: 1, away: 1 },
        { home: 1.9, draw: 3.4, away: 4.0 },
        [stream("s402a", "SanMamesCam", 982)],
      ),
    ],
  },
  {
    league: {
      id: 71,
      name: "Brasileirão",
      logoUrl: L(71),
      country: "Brazil",
    },
    matches: [
      mk(
        501,
        "2H",
        minutesAgo(63),
        { name: "Flamengo", logoUrl: T(127) },
        { name: "Palmeiras", logoUrl: T(121) },
        { home: 1, away: 0 },
        { home: 1.65, draw: 3.8, away: 5.0 },
        [
          stream("s501a", "MaracanaLive", 8243),
          stream("s501b", "MengoMaxi", 3508),
        ],
      ),
      mk(
        502,
        "NS",
        minutesFrom(75),
        { name: "Corinthians", logoUrl: T(131) },
        { name: "Santos", logoUrl: T(140) },
        null,
        { home: 2.1, draw: 3.2, away: 3.4 },
        [],
      ),
    ],
  },
];
