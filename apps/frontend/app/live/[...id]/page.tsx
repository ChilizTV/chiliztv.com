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
        <main className="flex min-h-dvh flex-col bg-[#0A0A0A]">
            <Header />
            <div className="flex-1">
                <LiveDetailsPage id={id} />
            </div>
        </main>
    );
}
