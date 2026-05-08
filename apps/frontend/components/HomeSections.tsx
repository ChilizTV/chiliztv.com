import { LiveTicker } from "./landing/LiveTicker";
import { StatsStrip } from "./landing/StatsStrip";
import { HowItWorks } from "./landing/HowItWorks";
import { FeatureBento } from "./landing/FeatureBento";
import { FanTokenWall } from "./landing/FanTokenWall";
import { FinalCTA } from "./landing/FinalCTA";

export function HomeSections() {
  return (
    <div className="relative bg-[#0A0A0A] text-white">
      <LiveTicker />
      <StatsStrip />
      <HowItWorks />
      <FeatureBento />
      <FanTokenWall />
      <FinalCTA />
    </div>
  );
}
