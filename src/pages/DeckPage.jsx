import React, { useState } from 'react';
import { useDeckStore } from '../store';
import { useScryfallSearch } from '../hooks/useScryfallSearch';
import { countCards, getManaCurve, exportToArena } from '../utils/deckUtils';
import { getCardImage, parseManaCost } from '../utils/scryfallApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DeckPage() {
  const { decks, activeDeckId, createDeck, setActiveDeck, addCardToDeck, removeCardFromDeck, renameDeck } = useDeckStore();
  const deck = activeDeckId ? decks[activeDeckId] : null;
  const { query, setQuery, results, loading } = useScryfallSearch();
  const [showExport, setShowExport] = useState(false);

  const deckList = Object.values(decks);
  const mainCount = deck ? countCards(deck.mainboard) : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 300px', gap: 'var(--space-4)', height: '100%' }}>

      {/* ── Left: deck list ── */}
      <aside>
        <div style={{ marginBottom: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '14px' }}>MY DECKS</h2>
          <button onClick={() => createDeck('New Deck')} style={btnStyle}>+ New</button>
        </div>
        {deckList.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No decks yet.</p>
        )}
        {deckList.map((d) => (
          <div key={d.id}
            onClick={() => setActiveDeck(d.id)}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              background: d.id === activeDeckId ? 'rgba(200,150,42,0.12)' : 'transparent',
              borderLeft: d.id === activeDeckId ? '3px solid var(--gold-mid)' : '3px solid transparent',
              marginBottom: 'var(--space-1)',
            }}
          >
            <div style={{ fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {d.name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {countCards(d.mainboard)} cards
            </div>
          </div>
        ))}
      </aside>

      {/* ── Center: deck contents + search ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', overflow: 'hidden' }}>
        {deck ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <h1 style={{ fontSize: '22px', flex: 1 }}>{deck.name}</h1>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{mainCount}/60</span>
              <button onClick={() => setShowExport(!showExport)} style={btnStyle}>Export</button>
            </div>

            {showExport && (
              <textarea
                readOnly
                value={exportToArena(deck)}
                style={{ ...inputStyle, height: '160px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              />
            )}

            {/* Mainboard */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {Object.values(deck.mainboard).length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Search for cards and add them to your deck.</p>
              )}
              {Object.values(deck.mainboard).map(({ card, count }) => (
                <DeckRow key={card.id} card={card} count={count}
                  onAdd={() => addCardToDeck(activeDeckId, card)}
                  onRemove={() => removeCardFromDeck(activeDeckId, card.name)}
                />
              ))}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <p style={{ color: 'var(--text-muted)' }}>Select a deck or create a new one →</p>
          </div>
        )}

        {/* Search */}
        <div>
          <input
            placeholder="Search cards (e.g. 'lightning bolt', 't:creature c:red')…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ ...inputStyle, width: '100%' }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-3)', maxHeight: '220px', overflowY: 'auto' }}>
            {loading && <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Searching…</p>}
            {results.map((card) => (
              <SearchResult key={card.id} card={card}
                onAdd={() => deck && addCardToDeck(activeDeckId, card)}
                disabled={!deck}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: stats ── */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {deck && (
          <>
            <div style={panelStyle}>
              <h3 style={{ fontSize: '12px', letterSpacing: '0.1em', marginBottom: 'var(--space-3)' }}>MANA CURVE</h3>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={getManaCurve(deck.mainboard)} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                  <XAxis dataKey="cmc" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', fontSize: 12 }} />
                  <Bar dataKey="count" fill="var(--gold-mid)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={panelStyle}>
              <h3 style={{ fontSize: '12px', letterSpacing: '0.1em', marginBottom: 'var(--space-3)' }}>DECK INFO</h3>
              <StatRow label="Mainboard" value={`${mainCount} / 60`} />
              <StatRow label="Sideboard" value={`${countCards(deck.sideboard)} / 15`} />
              <StatRow label="Format" value={deck.format} />
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function DeckRow({ card, count, onAdd, onRemove }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
      padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)',
      background: 'var(--bg-elevated)', marginBottom: 'var(--space-1)',
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--gold-light)', width: '20px' }}>{count}</span>
      <span style={{ flex: 1, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.name}</span>
      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{card.mana_cost}</span>
      <button onClick={onRemove} style={{ ...btnStyle, padding: '2px 8px', fontSize: '12px' }}>−</button>
      <button onClick={onAdd}    style={{ ...btnStyle, padding: '2px 8px', fontSize: '12px' }}>+</button>
    </div>
  );
}

function SearchResult({ card, onAdd, disabled }) {
  const img = getCardImage(card, 'small');
  return (
    <div className="card-hover" title={card.name} onClick={!disabled ? onAdd : undefined} style={{
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      position: 'relative',
    }}>
      {img
        ? <img src={img} alt={card.name} style={{ width: '60px', borderRadius: 'var(--radius-sm)' }} />
        : <div style={{ width: '60px', height: '84px', background: 'var(--bg-overlay)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', padding: '4px' }}>{card.name}</div>
      }
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)', fontSize: '13px' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{value}</span>
    </div>
  );
}

const btnStyle = {
  background: 'var(--bg-overlay)', border: '1px solid var(--border-mid)',
  color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
  padding: '4px 12px', cursor: 'pointer', fontSize: '13px',
  fontFamily: 'var(--font-display)', letterSpacing: '0.04em',
};
const inputStyle = {
  background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)',
  color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-2) var(--space-3)', fontSize: '14px', outline: 'none',
};
const panelStyle = {
  background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)',
  borderRadius: 'var(--radius-md)', padding: 'var(--space-4)',
};
