import { Header } from "@/components/Header";
import LiveDetailsPage from "@/components/live/LiveDetailsPage";

/**
 * Next 15 catch-all routes (`[...id]`) deliver `params.id` as an array of
 * path segments — `/live/999999` lands here as `["999999"]`. The wrapped
 * `LiveDetailsPage` expects a single string id, so we take the first segment.
 */
type LivePageProps = {
    params: Promise<{
        id: string[];
    }>;
};

export default async function LivePage({ params }: LivePageProps) {
    const { id } = await params;
    const matchId = Array.isArray(id) ? id[0] : id;

    if (!matchId) {
        return <div>Invalid match ID</div>;
    }

    return (
        <main className="flex flex-col h-dvh overflow-hidden">
            <Header />
            <div className="flex-1 min-h-0 overflow-hidden">
                <LiveDetailsPage id={matchId} />
            </div>
        </main>
    );
}
