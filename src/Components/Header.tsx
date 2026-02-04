import { useState } from 'react';
import './Header.css';
import MovyIcon from '../assets/result-icon.png';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Explore', to: '/explore' },
  { label: 'Image', to: '/image' },
  { label: 'Video', to: '/video' },
  { label: 'Edit', to: '/edit' },
];

const actionItems = [
  { label: 'Pricing', to: '/pricing', ghost: true },
  { label: 'Login', to: '/login', ghost: true },
  { label: 'Sign up', to: '/signup', ghost: false },
  { label: 'Profile', to: '/profile', ghost: true },
];

export default function Header() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="top-header">
      <div className="header-main">
        <div className="header-left">
          <Link to="/" className="logo-badge" aria-label="MovyAI home">
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
          {actionItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`header-btn ${item.ghost ? 'header-btn--ghost' : 'header-btn--primary'}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          className="header-hamburger"
          aria-label={menuOpen ? 'Închide meniul' : 'Deschide meniul'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </div>

      <div className={`header-mobile-menu ${menuOpen ? 'is-open' : ''}`}>
        <nav className="mobile-nav" aria-label="Navigare mobilă">
          {navItems.map((item) => {
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`mobile-link ${isActive ? 'is-active' : ''}`}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            );
          })}
          {actionItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`mobile-link mobile-link--action ${item.ghost ? '' : 'mobile-link--primary'}`}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
