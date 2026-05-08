import { StreamCard } from "../components";
import type { StreamerCard } from "../domain";
import { SectionHead } from "./SectionHead";

export function TopStreamersSection({ streams }: { streams: StreamerCard[] }) {
  if (streams.length === 0) return null;

  return (
    <section className="relative z-[4] mx-auto max-w-[1400px] px-8 pb-20 sm:px-14 sm:pb-28">
      <SectionHead
        eyebrow="Top streamers"
        title={
          <>
            Tipped
            <br />
            in <span className="text-[#E8001D]">CHZ.</span>
          </>
        }
        lead="Streamers run the broadcast booth. 0% platform cut — every donation lands directly in their on-chain wallet."
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {streams.map((s) => (
          <StreamCard key={s.streamId} stream={s} />
        ))}
      </div>
    </section>
  );
}
