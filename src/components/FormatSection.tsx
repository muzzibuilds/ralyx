import './FormatSection.css';

export default function FormatSection() {
  return (
    <section id="format" className="format-section section-spacing">
      <div className="container">
        <h2 className="format-title">THE CLIMB</h2>
        <p className="format-subtitle">
          Structured competitive court movement where performance matters and excellence is rewarded.
        </p>

        <div className="format-content">
          <div className="ladder-visual">
            <div className="court-slot">
              <div className="court-number">1</div>
              <div className="court-label">Elite</div>
            </div>
            <div className="movement-arrow">↓</div>
            <div className="court-slot">
              <div className="court-number">2</div>
              <div className="court-label">Strong</div>
            </div>
            <div className="movement-arrow">↓</div>
            <div className="court-slot">
              <div className="court-number">3</div>
              <div className="court-label">Competitive</div>
            </div>
            <div className="movement-arrow">↓</div>
            <div className="court-slot">
              <div className="court-number">4</div>
              <div className="court-label">Newcomer</div>
            </div>
          </div>

          <div className="format-flow">
            <h3>Each Saturday</h3>
            <div className="flow-steps">
              <div className="flow-step">
                <div className="step-number">SET 1</div>
                <div className="step-desc">3 games on your assigned court</div>
              </div>
              <div className="divider">→</div>
              <div className="flow-step">
                <div className="step-number">RESET</div>
                <div className="step-desc">Courts reshuffle based on performance</div>
              </div>
              <div className="divider">→</div>
              <div className="flow-step">
                <div className="step-number">SET 2</div>
                <div className="step-desc">3 games on new court assignment</div>
              </div>
            </div>
            <p className="format-note">
              <strong>6 guaranteed games per player.</strong> Excellence allows real movement within a single Saturday.
            </p>
          </div>
        </div>

        <div className="format-features">
          <div className="feature">
            <h4>Rotating Partners</h4>
            <p>Each set uses complete rotating-partner round-robin format. Play with and against every player on your court.</p>
          </div>
          <div className="feature">
            <h4>Dynamic Movement</h4>
            <p>Strong performance can elevate your court position. No permanently protected groups.</p>
          </div>
          <div className="feature">
            <h4>DUPR Eligible</h4>
            <p>Structured competitive play eligible for DUPR recording through our digital club setup.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
