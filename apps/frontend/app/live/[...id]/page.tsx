import { Header } from "@/components/Header";
import LiveDetailsPage from "@/components/live/LiveDetailsPage";

type LivePageProps = {
    params: Promise<{
        id: string[];
    }>;
};

export default async function LivePage({ params }: LivePageProps) {
    const { id } = await params;
    // `app/live/[...id]` is a catch-all route, so `id` resolves to `string[]`
    // at runtime (e.g. ["999999"]). LiveDetailsPage compares it with the
    // literal "999999" sentinel, so collapse to the first segment here —
    // otherwise `id === "999999"` is always false and the page falls into
    // the "No match found" panel.
    const matchId = Array.isArray(id) ? id[0] : id;

    if (!matchId) {
        return <div>Invalid match ID</div>;
    }

    return (
        <main className="flex min-h-dvh flex-col bg-[#0A0A0A]">
            <Header />
            <div className="flex-1">
                <LiveDetailsPage id={matchId} />
            </div>
        </main>
    );
}
