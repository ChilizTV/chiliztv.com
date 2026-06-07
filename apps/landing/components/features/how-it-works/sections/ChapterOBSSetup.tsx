import { ChapterShell } from "../components/ChapterShell";
import { ChapterHeading } from "../components/ChapterHeading";
import { ChapterLead } from "../components/ChapterLead";
import { StepsList, type Step } from "../components/StepsList";

const STEPS: Step[] = [
  {
    n: "01 →",
    title: "Open OBS Studio",
    body: (
      <p className="m-0">
        Launch OBS Studio, open <strong className="font-medium text-white">Settings → Stream</strong>. This is the only screen you need to touch — everything below lives in one panel.
      </p>
    ),
  },
  {
    n: "02 →",
    title: "Pick the Custom service",
    body: (
      <p className="m-0">
        Set <strong className="font-medium text-white">Service</strong> to <strong className="font-medium text-white">Custom…</strong> — don&apos;t use Twitch / YouTube presets. Betcast speaks RTMP directly, so the custom path is the right one.
      </p>
    ),
  },
  {
    n: "03 →",
    title: "Paste the Server URL",
    body: (
      <p className="m-0">
        Copy the <strong className="font-medium text-white">Server</strong> URL from your streamer dashboard and paste it into OBS&apos;s Server field. It looks like <code className="text-white/80">rtmps://…</code>.
      </p>
    ),
  },
  {
    n: "04 →",
    title: "Paste the Stream Key",
    body: (
      <p className="m-0">
        Same dashboard — copy the <strong className="font-medium text-white">Stream Key</strong> and paste it into OBS. Treat it like a password : anyone holding it can publish to your channel.
      </p>
    ),
  },
  {
    n: "05 →",
    title: "Start streaming",
    body: (
      <p className="m-0">
        Click <strong className="font-medium text-white">Apply</strong>, close Settings, then hit <strong className="font-medium text-white">Start Streaming</strong> in the main OBS window. Your feed is now en route to Cloudflare Stream.
      </p>
    ),
  },
  {
    n: "06 →",
    title: "Confirm you're live",
    body: (
      <p className="m-0">
        Open your stream page. The <span className="text-[#E8001D]">Live</span> badge appears within ~4 s of OBS connecting — that&apos;s the signal your viewers see too.
      </p>
    ),
  },
];

export function ChapterOBSSetup() {
  return (
    <ChapterShell num="04" metaTop="Stream a match" metaBottom="2 min OBS setup">
      <ChapterHeading>
        Go live with <span className="text-[#E8001D]">OBS Studio.</span>
      </ChapterHeading>
      <ChapterLead>
        Push your RTMP feed from OBS — the live page picks up the first frame within ~4 s. Server URL and Stream Key live in your streamer dashboard once you create a stream.
      </ChapterLead>
      <StepsList items={STEPS} />
    </ChapterShell>
  );
}
