"use client";

interface MatchScoreDisplayProps {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  isLive?: boolean;
}

export function MatchScoreDisplay({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
}: MatchScoreDisplayProps) {
  const isHomeWinning = homeScore > awayScore;
  const isAwayWinning = awayScore > homeScore;

  return (
    <div className="flex items-center justify-center gap-6 text-white py-3">
      {/* Home Team */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shrink-0">
          <span className="text-white font-bold text-base">
            {homeTeam.charAt(0)}
          </span>
        </div>
        <span className={`text-xl font-bold truncate max-w-64 ${isHomeWinning ? 'text-white' : 'text-white/70'}`}>
          {homeTeam}
        </span>
      </div>

      {/* Score */}
      <div className="flex items-center gap-3">
        <span className={`text-3xl font-bold tabular-nums ${isHomeWinning ? 'text-primary' : 'text-white/80'}`}>
          {homeScore}
        </span>
        <span className="text-white/30 text-xl">-</span>
        <span className={`text-3xl font-bold tabular-nums ${isAwayWinning ? 'text-primary' : 'text-white/80'}`}>
          {awayScore}
        </span>
      </div>

      {/* Away Team */}
      <div className="flex items-center gap-3">
        <span className={`text-xl font-bold truncate max-w-64 ${isAwayWinning ? 'text-white' : 'text-white/70'}`}>
          {awayTeam}
        </span>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shrink-0">
          <span className="text-white font-bold text-base">
            {awayTeam.charAt(0)}
          </span>
        </div>
      </div>
    </div>
  );
}
