import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import Button from './ui/Button';
import './Navigation.css';

export default function Navigation() {
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="navigation">
      <div className="container nav-container">
        <div className="nav-brand">
          <button onClick={() => navigate(ROUTES.HOME)} className="nav-brand-btn">
            <h1>RALYX</h1>
          </button>
        </div>
        <ul className="nav-links">
          <li>
            <button
              onClick={() => scrollToSection('format')}
              className="nav-link"
            >
              Format
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate(ROUTES.STANDINGS)}
              className="nav-link"
            >
              Standings
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection('founding-16')}
              className="nav-link"
            >
              Spots
            </button>
          </li>
          <li>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(ROUTES.REGISTER)}
            >
              Claim Your Spot
            </Button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
