import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>RALYX</h3>
            <p>Premium competitive pickleball for serious players.</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>League</h4>
              <ul>
                <li><a href="#format">Format</a></li>
                <li><a href="#">About</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Terms</a></li>
                <li><a href="#">Privacy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 RALYX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
