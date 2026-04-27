import { Link } from 'react-router-dom';
import '../styles/Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-left">
          <p className="footer-copy">
            © {year} MovyAI. All rights reserved.
          </p>
        </div>
        <nav className="footer-right" aria-label="Legal">
          <Link to="/privacy" className="footer-link">Privacy policy</Link>
          <Link to="/terms" className="footer-link">Terms of use</Link>
        </nav>
      </div>
    </footer>
  );
}
