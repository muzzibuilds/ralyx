/**
 * Home Page
 * RALYX Season I landing page
 * Integrated with real-time database for season status
 */

import { useCurrentSeason, useConfirmedCount } from '../hooks';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import ProblemSection from '../components/ProblemSection';
import FormatSection from '../components/FormatSection';
import Founding16 from '../components/Founding16';
import CTASection from '../components/CTASection';

export default function HomePage() {
  const { data: season, isLoading: seasonLoading } = useCurrentSeason();
  const { data: confirmedCount = 0, isLoading: countLoading } = useConfirmedCount(
    season?.id || '',
  );

  // Default stats while loading or if no season
  const stats = {
    players: 16,
    courts: 4,
    gamesPerWeek: 6,
    weeks: season?.durationWeeks || 8,
    confirmedCount: season ? confirmedCount : 0,
  };

  return (
    <div className="home-page">
      <Hero />
      <Stats stats={stats} isLoading={seasonLoading || countLoading} />
      <ProblemSection />
      <FormatSection />
      <Founding16 />
      <CTASection season={season} confirmedCount={confirmedCount} isLoading={seasonLoading || countLoading} />
    </div>
  );
}
