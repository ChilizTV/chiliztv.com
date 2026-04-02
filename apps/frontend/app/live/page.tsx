import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import LiveMatches from "@/components/live/LiveMatches";

export default function LivePage() {
    return (
        <main>
            <Header />
            <LiveMatches />
            <Footer />
        </main>
    );
}