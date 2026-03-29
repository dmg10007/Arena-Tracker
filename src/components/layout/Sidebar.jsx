import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDeckStore } from '../../store';

const SECTIONS = [
  {
    heading: 'PLAY',
    links: [
      { to: '/draft', icon: '🎲', label: 'Draft Simulator' },
      { to: '/meta',  icon: '📊', label: 'Meta Dashboard' },
    ],
  },
  {
    heading: 'BUILD',
    links: [
      { to: '/decks',      icon: '🃏', label: 'Deck Builder' },
      { to: '/collection', icon: '📦', label: 'Collection' },
    ],
  },
];

export default function Sidebar() {
  const decks = useDeckStore((s) => s.decks);
  const deckList = Object.values(decks).slice(0, 5);

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-dim)',
      display: 'flex',
      flexDirection: 'column',
      padding: 'var(--space-4) 0',
      overflowY: 'auto',
      flexShrink: 0,
    }}>
      {SECTIONS.map(({ heading, links }) => (
        <div key={heading} style={{ marginBottom: 'var(--space-5)' }}>
          <p style={{
            fontSize: '10px',
            letterSpacing: '0.12em',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            padding: '0 var(--space-4)',
            marginBottom: 'var(--space-2)',
          }}>
            {heading}
          </p>
          {links.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-2) var(--space-4)',
              fontSize: '14px',
              color: isActive ? 'var(--gold-light)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(200,150,42,0.08)' : 'transparent',
              borderRight: isActive ? '2px solid var(--gold-mid)' : '2px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.15s',
            })}>
              <span>{icon}</span>
              <span style={{ fontFamily: 'var(--font-body)' }}>{label}</span>
            </NavLink>
          ))}
        </div>
      ))}

      {/* Recent decks */}
      {deckList.length > 0 && (
        <div>
          <p style={{
            fontSize: '10px',
            letterSpacing: '0.12em',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            padding: '0 var(--space-4)',
            marginBottom: 'var(--space-2)',
          }}>
            RECENT DECKS
          </p>
          {deckList.map((deck) => (
            <NavLink key={deck.id} to="/decks" style={{
              display: 'block',
              padding: 'var(--space-2) var(--space-4)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            onClick={() => useDeckStore.getState().setActiveDeck(deck.id)}
            >
              🃏 {deck.name}
            </NavLink>
          ))}
        </div>
      )}
    </aside>
  );
}
