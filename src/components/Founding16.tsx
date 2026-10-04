import './Founding16.css';

const TOTAL_SPOTS = 16;
const FILLED_SPOTS = 0; // For V1, no registrations yet

export default function Founding16() {
  return (
    <section id="founding-16" className="founding-section section-spacing">
      <div className="container">
        <div className="founding-header">
          <h2>THE FOUNDING 16</h2>
          <p>Exclusive roster for Season I. Limited to 16 competitive players.</p>
          <div className="founding-capacity">
            <span className="capacity-filled">{FILLED_SPOTS}</span>
            <span className="capacity-sep">/</span>
            <span className="capacity-max">{TOTAL_SPOTS}</span>
            <span className="capacity-text">LOCKED IN</span>
          </div>
        </div>

        <div className="spots-grid">
          {Array.from({ length: TOTAL_SPOTS }).map((_, index) => (
            <div key={index} className="spot-card">
              <div className="spot-number">#{index + 1}</div>
              <div className="spot-status">AVAILABLE</div>
            </div>
          ))}
        </div>

        <p className="founding-note">
          When all 16 spots are claimed, RALYX Season I will be SOLD OUT.
        </p>
      </div>
    </section>
  );
}
