import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DiscoverPage } from "@/components/features/discover";

export default function Home() {
  return (
    <main>
      <Header />
      <DiscoverPage />
      <Footer />
    </main>
  );
}
