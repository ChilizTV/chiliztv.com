import { PageHeader } from "@/components/layout/PageHeader";

export default function DashboardPage() {
  return (
    <div>
      <PageHeader eyebrow="Overview" title="Dashboard" />
      <p className="mt-4 text-[13px] font-light text-white/55">
        Moderation, players, markets and finance surfaces land lot by lot.
      </p>
    </div>
  );
}
