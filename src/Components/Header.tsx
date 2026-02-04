
import MovyIcon from '../assets/result-icon.png';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Explore', to: '/explore' },
  { label: 'Image', to: '/image' },
  { label: 'Video', to: '/video' },
  { label: 'Edit', to: '/edit' },

];

export default function Header() {
  const { pathname } = useLocation();
  return (
    <header className="top-header">
      <div className="header-main">
        <div className="header-left">
          <Link to="/" className="logo-badge" aria-label="MovyAI text">
            <img src={MovyIcon} alt="MovyAI icon" className="logo-image" />
            <span className="logo-text">MovyAI</span>
          </Link>
        </div>
        <nav className="header-nav" aria-label="Primary navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`header-link ${isActive ? 'is-active' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="header-actions">
          <Link to="/pricing" className="header-btn header-btn--ghost">
            Pricing
          </Link>
          <Link to="/login" className="header-btn header-btn--ghost">
            Login
          </Link>
          <Link to="/signup" className="header-btn header-btn--primary">
            Sign up
          </Link>
          <Link to="/profile" className="header-btn header-btn--ghost">
            Profile
          </Link>
        </div>
      </div>
    </header>
  );
}
