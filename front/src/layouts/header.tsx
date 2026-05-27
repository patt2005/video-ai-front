import {useState} from 'react';
import '../styles/Header.css';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {Icon} from '@iconify/react';
import {useTheme} from '../contexts/themeContext.tsx';
import {useAuth} from '../contexts/authContext.tsx';
import {paths} from '../routes/paths.ts';
import {UserRole} from "../types/user/user.ts";

function ProtectedLink({
  to,
  className,
  children,
  onClick,
  guestOnly,
  authOnly,
  roles,
  excludeRoles,
}: {
  to: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  guestOnly?: boolean;
  authOnly?: boolean;
  roles?: UserRole[];
  excludeRoles?: UserRole[];
}) {
  const { isLoggedIn, user } = useAuth();

  if (guestOnly && isLoggedIn) return null;
  if (authOnly && !isLoggedIn) return null;
  if (roles && (!isLoggedIn || !user || !roles.includes(user.role))) return null;
  if (excludeRoles && isLoggedIn && user && excludeRoles.includes(user.role)) return null;

  return (
    <Link to={to} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

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

  return (
    <header className="top-header">
      <div className="header-main">
        <div className="header-left">
          <Link to={paths.root} className="logo-badge" aria-label="MovyAI explore page">
            <img src="/icon-512.png" alt="MovyAI" className="logo-image" />
            <span className="logo-text">MovyAI</span>
          </Link>
        </div>
        <nav className="header-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <ProtectedLink
              key={item.to}
              to={item.to}
              className={`header-link ${pathname === item.to ? 'is-active' : ''}`}
              excludeRoles={[UserRole.Admin]}
            >
              {item.label}
            </ProtectedLink>
          ))}
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
                <Icon icon="material-symbols:light-mode-outline" width="20" height="20" aria-hidden />
            ) : (
                <Icon icon="material-symbols:dark-mode-outline" width="20" height="20" aria-hidden />
            )}
          </button>
          <ProtectedLink to={paths.pricing} className="header-btn header-btn--ghost" excludeRoles={[UserRole.Admin]}>
            Pricing
          </ProtectedLink>
          <ProtectedLink to={paths.login} className="header-btn header-btn--ghost" guestOnly>
            Login
          </ProtectedLink>
          <ProtectedLink to={paths.signup} className="header-btn header-btn--primary" guestOnly>
            Sign up
          </ProtectedLink>
          <ProtectedLink to={paths.admin} className="header-btn header-btn--ghost" roles={[UserRole.Admin]}>
            Admin
          </ProtectedLink>
          <ProtectedLink to={paths.profile} className="header-btn header-btn--ghost" authOnly>
            Profile
          </ProtectedLink>
          {isLoggedIn && (
            <button
              type="button"
              className="header-btn header-btn--ghost"
              onClick={handleLogout}
            >
              Log out
            </button>
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
          {navItems.map((item) => (
            <ProtectedLink
              key={item.to}
              to={item.to}
              className={`mobile-link ${pathname === item.to ? 'is-active' : ''}`}
              onClick={closeMenu}
              excludeRoles={[UserRole.Admin]}
            >
              {item.label}
            </ProtectedLink>
          ))}
          <ProtectedLink to={paths.pricing} className="mobile-link mobile-link--action" onClick={closeMenu} excludeRoles={[UserRole.Admin]}>
            Pricing
          </ProtectedLink>
          <ProtectedLink to={paths.login} className="mobile-link mobile-link--action" onClick={closeMenu} guestOnly>
            Login
          </ProtectedLink>
          <ProtectedLink to={paths.signup} className="mobile-link mobile-link--action mobile-link--primary" onClick={closeMenu} guestOnly>
            Sign up
          </ProtectedLink>
          <ProtectedLink to={paths.admin} className="mobile-link mobile-link--action" onClick={closeMenu} roles={[UserRole.Admin]}>
            Admin
          </ProtectedLink>
          <ProtectedLink to={paths.profile} className="mobile-link mobile-link--action" onClick={closeMenu} authOnly>
            Profile
          </ProtectedLink>
          {isLoggedIn && (
            <button
              type="button"
              className="mobile-link mobile-link--action"
              onClick={handleLogout}
            >
              Log out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
