import { useState } from 'react';
import './Header.css';
import MovyIcon from '../assets/result-icon.png';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from './ThemeContext.tsx';

const navItems = [
  { label: 'Explore', to: '/' },
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
  const { theme, toggleTheme } = useTheme();

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="top-header">
      <div className="header-main">
        <div className="header-left">
          <Link to="/" className="logo-badge" aria-label="MovyAI explore page">
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
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Comută la temă deschisă' : 'Comută la temă întunecată'}
            title={theme === 'dark' ? 'Temă deschisă' : 'Temă întunecată'}
          >
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
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
          <button
            type="button"
            className="mobile-theme-toggle"
            onClick={() => { toggleTheme(); closeMenu(); }}
            aria-label={theme === 'dark' ? 'Comută la temă deschisă' : 'Comută la temă întunecată'}
          >
            {theme === 'dark' ? '☀️ Temă deschisă' : '🌙 Temă întunecată'}
          </button>
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
