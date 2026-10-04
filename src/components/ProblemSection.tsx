import './ProblemSection.css';

export default function ProblemSection() {
  return (
    <section className="problem-section section-spacing">
      <div className="container">
        <h2 className="problem-title">STOP SEARCHING FOR SERIOUS GAMES.</h2>
        <div className="problem-content">
          <div className="problem-grid">
            <div className="problem-card">
              <div className="problem-icon">🎯</div>
              <h3>Skill Consistency</h3>
              <p>Find appropriately matched opponents at your level. No wasted time with mismatched skill.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">🏆</div>
              <h3>Competitive Record</h3>
              <p>Every game counts. Build your record, climb the courts, and earn recognition.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">📊</div>
              <h3>DUPR Eligible Results</h3>
              <p>eligible structured play where results count toward your DUPR rating.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">🎪</div>
              <h3>Structured Scheduling</h3>
              <p>Predictable Saturday competition with a guaranteed schedule. No guessing when the next game is.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
