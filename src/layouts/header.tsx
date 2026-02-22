import { useState } from 'react';
import '../styles/header.css';
import MovyIcon from '../assets/result-icon.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/themeContext';
import { useAuth } from '../contexts/authContext';
import { paths } from '../routes/paths';

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isLoggedIn, logout } = useAuth();

  const navItems = [
    { label: 'Explore', to: paths.root },
    { label: 'Image', to: paths.image },
    { label: 'Video', to: paths.video },
    { label: 'Edit', to: paths.edit },
  ];
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate(paths.root);
  };

  const content = (
    <div className="top-header" role="banner">
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
          {!isLoggedIn ? (
            <>
              <Link to={paths.pricing} className="header-btn header-btn--ghost">
                Pricing
              </Link>
              <Link to={paths.login} className="header-btn header-btn--ghost">
                Login
              </Link>
              <Link to={paths.signup} className="header-btn header-btn--primary">
                Sign up
              </Link>
            </>
          ) : (
            <>
              <Link to={paths.pricing} className="header-btn header-btn--ghost">
                Pricing
              </Link>
              <Link to={paths.profile} className="header-btn header-btn--ghost">
                Profile
              </Link>
              <button
                type="button"
                className="header-btn header-btn--ghost"
                onClick={handleLogout}
              >
                Log out
              </button>
            </>
          )}
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
          {!isLoggedIn ? (
            <>
              <Link to={paths.pricing} className="mobile-link mobile-link--action" onClick={closeMenu}>
                Pricing
              </Link>
              <Link to={paths.login} className="mobile-link mobile-link--action" onClick={closeMenu}>
                Login
              </Link>
              <Link to={paths.signup} className="mobile-link mobile-link--action mobile-link--primary" onClick={closeMenu}>
                Sign up
              </Link>
            </>
          ) : (
            <>
              <Link to={paths.pricing} className="mobile-link mobile-link--action" onClick={closeMenu}>
                Pricing
              </Link>
              <Link to={paths.profile} className="mobile-link mobile-link--action" onClick={closeMenu}>
                Profile
              </Link>
              <button
                type="button"
                className="mobile-link mobile-link--action"
                onClick={() => { handleLogout(); closeMenu(); }}
              >
                Log out
              </button>
            </>
          )}
        </nav>
      </div>
    </div>
  );

  return content;
}