import { Header } from "@/components/Header";
import LiveDetailsPage from "@/components/live/LiveDetailsPage";

type LivePageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function LivePage({ params }: LivePageProps) {
const { id } = await params;

if (!id) {
    return <div>Invalid match ID</div>;
}

    return (
        <main className="flex flex-col h-dvh overflow-hidden">
            <Header />
            <div className="flex-1 min-h-0 overflow-hidden">
                <LiveDetailsPage id={id} />
            </div>
        </main>
    );
}
