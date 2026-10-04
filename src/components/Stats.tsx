import './Stats.css';

interface StatsProps {
  stats?: {
    players: number;
    courts: number;
    gamesPerWeek: number;
    weeks: number;
    confirmedCount: number;
  };
  isLoading?: boolean;
}

const defaultStats = [
  { value: 16, label: 'PLAYERS' },
  { value: 4, label: 'COURTS' },
  { value: 6, label: 'GAMES / WEEK' },
  { value: 8, label: 'WEEKS' },
];

export default function Stats({ stats, isLoading = false }: StatsProps) {
  const displayStats = stats
    ? [
        { value: stats.players, label: 'PLAYERS' },
        { value: stats.courts, label: 'COURTS' },
        { value: stats.gamesPerWeek, label: 'GAMES / WEEK' },
        { value: stats.weeks, label: 'WEEKS' },
      ]
    : defaultStats;

  return (
    <section className="stats">
      <div className="container">
        <div className="stats-grid">
          {displayStats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-value">{isLoading ? '—' : stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
