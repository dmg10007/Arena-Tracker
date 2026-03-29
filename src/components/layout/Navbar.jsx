import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/',           label: 'Home' },
  { to: '/decks',      label: 'Decks' },
  { to: '/collection', label: 'Collection' },
  { to: '/draft',      label: 'Draft' },
  { to: '/meta',       label: 'Meta' },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <header style={{
      height: 'var(--navbar-height)',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-dim)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--space-5)',
      gap: 'var(--space-6)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link to="/" style={{
        fontFamily: 'var(--font-display)',
        fontSize: '18px',
        fontWeight: 700,
        color: 'var(--gold-light)',
        letterSpacing: '0.08em',
        whiteSpace: 'nowrap',
      }}>
        ⬡ MTG Arena
      </Link>

      {/* Nav links */}
      <nav style={{ display: 'flex', gap: 'var(--space-4)' }}>
        {NAV_LINKS.map(({ to, label }) => {
          const active = pathname === to || (to !== '/' && pathname.startsWith(to));
          return (
            <Link key={to} to={to} style={{
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              letterSpacing: '0.06em',
              fontWeight: active ? 700 : 400,
              color: active ? 'var(--gold-light)' : 'var(--text-secondary)',
              borderBottom: active ? '2px solid var(--gold-mid)' : '2px solid transparent',
              paddingBottom: '2px',
              transition: 'color 0.15s, border-color 0.15s',
            }}>
              {label.toUpperCase()}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
