import { Dashboard } from "@/components/dashboard/Dashboard";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function DashboardPage() {
    return (
        <main>
            <Header />
            <Dashboard />
            <Footer />
        </main>
    );
}