import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import type { Season } from '../types';
import './CTASection.css';

interface CTASectionProps {
  season?: Season | null;
  confirmedCount?: number;
  isLoading?: boolean;
}

export default function CTASection({ season, confirmedCount = 0, isLoading = false }: CTASectionProps) {
  const navigate = useNavigate();

  return (
    <section id="cta" className="cta-section">
      <div className="container">
        <div className="cta-content">
          <div className="cta-label">{season?.name || 'SEASON I'}</div>
          <h2 className="cta-heading">
            THINK YOU BELONG HERE?
          </h2>
          <p className="cta-text">
            Sixteen spots. Structured competitive play. No casual games.
          </p>
          <p className="cta-subtext">
            {isLoading ? 'LOADING...' : `${confirmedCount}/16 LOCKED IN. EVERY GAME MATTERS.`}
          </p>
          <button className="btn btn-cta" onClick={() => navigate(ROUTES.REGISTER)}>
            I WANT IN
          </button>
        </div>
      </div>
    </section>
  );
}
