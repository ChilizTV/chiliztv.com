import { Crown, Target, Zap } from "lucide-react";

const BADGES = [
  {
    icon: Crown,
    label: "Champion",
    sub: "Most wins this month",
    holder: "FootballKing",
    stat: "127 wins",
    iconColor: "#F5C518",
    glowColor: "rgba(245,197,24,0.06)",
    borderColor: "rgba(245,197,24,0.16)",
  },
  {
    icon: Target,
    label: "Sharpshooter",
    sub: "Highest accuracy",
    holder: "StrategyGuru",
    stat: "89.2% accuracy",
    iconColor: "#E8001D",
    glowColor: "rgba(232,0,29,0.05)",
    borderColor: "rgba(232,0,29,0.16)",
  },
  {
    icon: Zap,
    label: "Speed Demon",
    sub: "Fastest live predictions",
    holder: "LivePredictionPro",
    stat: "0.3s avg",
    iconColor: "#00C853",
    glowColor: "rgba(0,200,83,0.05)",
    borderColor: "rgba(0,200,83,0.16)",
  },
];

export function AchievementBadges() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
      {BADGES.map(({ icon: Icon, label, sub, holder, stat, iconColor, glowColor, borderColor }) => (
        <div
          key={label}
          className="flex items-center gap-4 px-5 py-4 rounded-lg"
          style={{ background: glowColor, border: `1px solid ${borderColor}` }}
        >
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${iconColor}18` }}
          >
            <Icon size={20} style={{ color: iconColor }} />
          </div>
          <div className="min-w-0">
            <div
              className="text-[10px] font-bold uppercase tracking-[0.12em] mb-0.5"
              style={{ color: iconColor, fontFamily: "'Barlow', sans-serif" }}
            >
              {label}
            </div>
            <div
              className="text-[14px] font-bold text-white truncate"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {holder}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: "#555" }}>
              {stat} · {sub}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
