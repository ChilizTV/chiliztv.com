import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

import { Leaderboard } from '@/components/leaderboard/Leaderboard';

export default function LeaderboardPage() {
  return (
    <main>
      <Header />
      <Leaderboard />
      <Footer />
    </main>
  );
}