import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import './Hero.css';

export default function Hero() {
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-label">SEASON I // COLUMBUS</div>
          <h1 className="hero-title">
            <span>8 WEEKS.</span>
            <span>ONE LADDER.</span>
            <span className="accent">EARN YOUR COURT.</span>
          </h1>
          <p className="hero-description">
            RALYX is structured competitive pickleball for serious players where every game matters.
          </p>
          <div className="hero-capacity">
            <div className="capacity-badge">
              <span className="capacity-number">0</span>
              <span className="capacity-divider">/</span>
              <span className="capacity-total">16</span>
            </div>
            <span className="capacity-label">SPOTS LOCKED IN</span>
          </div>
          <div className="hero-cta">
            <button
              className="btn btn-primary"
              onClick={() => navigate(ROUTES.REGISTER)}
            >
              CLAIM YOUR SPOT
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => scrollToSection('format')}
            >
              SEE THE FORMAT
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
