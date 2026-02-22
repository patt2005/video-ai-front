import { Link } from 'react-router-dom';
import { paths } from '../routes/paths';
import '../styles/footer.css';

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <Link to={paths.root} className="footer-logo">
            MovyAI
          </Link>
          <nav className="footer-nav" aria-label="Footer navigation">
            <Link to={paths.root} className="footer-link">
              Explore
            </Link>
            <Link to={paths.image} className="footer-link">
              Image
            </Link>
            <Link to={paths.video} className="footer-link">
              Video
            </Link>
            <Link to={paths.edit} className="footer-link">
              Edit
            </Link>
            <Link to={paths.pricing} className="footer-link">
              Pricing
            </Link>
            <Link to={paths.login} className="footer-link">
              Login
            </Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">
            © {currentYear} MovyAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
