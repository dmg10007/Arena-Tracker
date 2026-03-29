import React from 'react';
import { Link } from 'react-router-dom';
import { useDeckStore, useCollectionStore } from '../store';
import { countCards } from '../utils/deckUtils';

const FEATURE_CARDS = [
  { to: '/decks',      icon: '🃏', title: 'Deck Builder',      desc: 'Build and manage Arena-legal decks. Search any card via Scryfall, track your mana curve, and export to MTG Arena format.' },
  { to: '/collection', icon: '📦', title: 'Collection Tracker', desc: 'Track which cards you own, manage wildcards, and quickly see what you need to complete a deck.' },
  { to: '/draft',      icon: '🎲', title: 'Draft Simulator',    desc: 'Practice drafting any Arena set. Simulate a full 8-player pod with real pack contents from Scryfall.' },
  { to: '/meta',       icon: '📊', title: 'Meta Dashboard',     desc: 'Browse the current Standard meta: tier lists, archetype win rates, and popular decklists.' },
];

export default function Home() {
  const decks = useDeckStore((s) => s.decks);
  const collection = useCollectionStore((s) => s.collection);

  const deckCount = Object.keys(decks).length;
  const cardCount = Object.values(collection).reduce((s, { count }) => s + count, 0);
  const totalMainboardCards = Object.values(decks).reduce((s, d) => s + countCards(d.mainboard), 0);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Hero */}
      <div style={{
        textAlign: 'center',
        padding: 'var(--space-8) 0 var(--space-7)',
        borderBottom: '1px solid var(--border-dim)',
        marginBottom: 'var(--space-7)',
      }}>
        <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', marginBottom: 'var(--space-3)' }}>
          MTG Arena Companion
        </h1>
        <p style={{
          fontSize: '18px',
          color: 'var(--text-secondary)',
          fontStyle: 'italic',
          maxWidth: '500px',
          margin: '0 auto var(--space-5)',
        }}>
          Build decks. Track your collection. Master the draft. Conquer the meta.
        </p>

        {/* Stats row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)' }}>
          {[
            { label: 'Decks', value: deckCount },
            { label: 'Cards Owned', value: cardCount },
            { label: 'Cards in Decks', value: totalMainboardCards },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontFamily: 'var(--font-display)', color: 'var(--gold-light)' }}>
                {value}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
                {label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: 'var(--space-4)',
      }}>
        {FEATURE_CARDS.map(({ to, icon, title, desc }) => (
          <Link key={to} to={to} style={{
            display: 'block',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-dim)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
            textDecoration: 'none',
            transition: 'border-color 0.2s, background 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold-dark)'; e.currentTarget.style.background = 'var(--bg-overlay)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-dim)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
          >
            <div style={{ fontSize: '28px', marginBottom: 'var(--space-3)' }}>{icon}</div>
            <h3 style={{ fontSize: '18px', marginBottom: 'var(--space-2)', color: 'var(--gold-light)' }}>
              {title}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
