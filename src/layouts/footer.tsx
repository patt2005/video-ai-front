import { Link } from 'react-router-dom';
import '../styles/Footer.css';
import MovyIcon from '../assets/result-icon.png';
import { paths } from '../routes/paths.ts';

const footerLinks = [
  { label: 'Explore', to: paths.root },
  { label: 'Image', to: paths.image },
  { label: 'Video', to: paths.video },
  { label: 'Edit', to: paths.edit },
  { label: 'Pricing', to: paths.pricing },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to={paths.root} className="footer-logo" aria-label="MovyAI home">
            <img src={MovyIcon} alt="" className="footer-logo-img" />
            <span className="footer-logo-text">MovyAI</span>
          </Link>
        </div>
        <nav className="footer-nav" aria-label="Footer navigation">
          {footerLinks.map((item) => (
            <Link key={item.to} to={item.to} className="footer-link">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="footer-bottom">
          <p className="footer-copy">
            © {year} MovyAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
