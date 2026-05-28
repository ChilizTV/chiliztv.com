import { Topbar } from "./sections/Topbar";
import { Hero } from "./sections/Hero";
import { ChapterProduct } from "./sections/ChapterProduct";
import { ChapterPredict } from "./sections/ChapterPredict";
import { ChapterParimutuel } from "./sections/ChapterParimutuel";
import { ChapterOBSSetup } from "./sections/ChapterOBSSetup";
import { EndCTA } from "./sections/EndCTA";
import { Aside } from "./components/Aside";

export function HowItWorksPage() {
  return (
    <section id="how-it-works" className="relative z-4 bg-[#0A0A0A] text-white">
      <Topbar />
      <Hero />
      <ChapterProduct />
      <ChapterPredict />
      <Aside label="// Aside — Where the probability comes from">
        Each outcome&apos;s implied probability is the share of total USDC staked on it. <span className="text-[#E8001D]">The crowd sets the odds.</span> Sharp-book references are shown only as a hint when no positions have been taken yet.
      </Aside>
      <ChapterParimutuel />
      <ChapterOBSSetup />
      <EndCTA />
    </section>
  );
}
