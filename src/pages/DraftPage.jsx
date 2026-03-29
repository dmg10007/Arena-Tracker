import React, { useState, useEffect } from 'react';
import { useDraft } from '../hooks/useDraft';
import { getArenaSets } from '../utils/scryfallApi';
import { getCardImage } from '../utils/scryfallApi';

export default function DraftPage() {
  const [sets, setSets] = useState([]);
  const [selectedSetCode, setSelectedSetCode] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);
  const { startDraft, pick, autopick, resetDraft, loading, error, isDone, currentPack, picks, pickNumber, draftState } = useDraft();

  useEffect(() => {
    getArenaSets().then(setSets).catch(() => {});
  }, []);

  const packNum = draftState ? draftState.currentPackIndex + 1 : 0;

  return (
    <div style={{ maxWidth: '1100px' }}>
      <h1 style={{ marginBottom: 'var(--space-5)' }}>Draft Simulator</h1>

      {/* Setup */}
      {!draftState && !loading && (
        <div style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', maxWidth: '480px',
        }}>
          <h2 style={{ fontSize: '16px', marginBottom: 'var(--space-4)' }}>Choose a Set</h2>
          <select
            value={selectedSetCode}
            onChange={(e) => setSelectedSetCode(e.target.value)}
            style={{ ...inputStyle, width: '100%', marginBottom: 'var(--space-4)' }}
          >
            <option value="">Select an Arena set…</option>
            {sets.map((s) => (
              <option key={s.code} value={s.code}>{s.name} ({s.code.toUpperCase()})</option>
            ))}
          </select>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
            Simulates a full 8-player pod with real card data from Scryfall. Loading a large set may take a moment.
          </p>
          <button
            onClick={() => startDraft(selectedSetCode)}
            disabled={!selectedSetCode}
            style={{ ...btnStyle, opacity: selectedSetCode ? 1 : 0.4 }}
          >
            Start Draft
          </button>
          {error && <p style={{ color: '#e74c3c', fontSize: '13px', marginTop: 'var(--space-3)' }}>{error}</p>}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Loading set cards from Scryfall…</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: 'var(--space-2)' }}>This may take a few seconds for large sets.</p>
        </div>
      )}

      {/* Active draft */}
      {draftState && !isDone && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 'var(--space-5)' }}>
          {/* Pack */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                PACK {packNum} · PICK {((pickNumber - 1) % 15) + 1}/15
              </div>
              <button onClick={autopick} style={{ ...btnStyle, fontSize: '12px', padding: '4px 12px' }}>Auto-pick</button>
              <button onClick={resetDraft} style={{ ...btnStyle, fontSize: '12px', padding: '4px 12px', background: 'transparent' }}>Abandon Draft</button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              {currentPack.map((card) => {
                const img = getCardImage(card, 'normal');
                return (
                  <div key={card.id}
                    className="card-hover"
                    onClick={() => pick(card)}
                    onMouseEnter={() => setHoveredCard(card)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{ cursor: 'pointer', position: 'relative' }}
                  >
                    {img
                      ? <img src={img} alt={card.name} style={{ width: '130px', borderRadius: 'var(--radius-md)', display: 'block' }} />
                      : <CardPlaceholder card={card} />
                    }
                    <div style={{
                      position: 'absolute', bottom: 4, right: 4,
                      background: 'rgba(0,0,0,0.75)', borderRadius: '3px', padding: '2px 6px',
                      fontSize: '10px', color: rarityColor(card.rarity),
                      fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
                    }}>
                      {card.rarity[0].toUpperCase()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Picks sidebar */}
          <aside>
            <h3 style={{ fontSize: '12px', letterSpacing: '0.1em', marginBottom: 'var(--space-3)', color: 'var(--text-muted)' }}>
              YOUR PICKS ({picks.length})
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {picks.map((card, i) => {
                const img = getCardImage(card, 'small');
                return img
                  ? <img key={i} src={img} alt={card.name} title={card.name} style={{ width: '44px', borderRadius: '3px' }} />
                  : <div key={i} title={card.name} style={{ width: '44px', height: '62px', background: 'var(--bg-overlay)', borderRadius: '3px' }} />;
              })}
            </div>
          </aside>
        </div>
      )}

      {/* Draft done */}
      {isDone && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
            <h2 style={{ fontSize: '20px' }}>Draft Complete! 🎉</h2>
            <button onClick={resetDraft} style={btnStyle}>New Draft</button>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', fontSize: '14px' }}>
            You drafted {picks.length} cards. Build your deck from these picks below.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {picks.map((card, i) => {
              const img = getCardImage(card, 'normal');
              return img
                ? <img key={i} src={img} alt={card.name} title={card.name} style={{ width: '110px', borderRadius: 'var(--radius-sm)' }} className="card-hover" />
                : <CardPlaceholder key={i} card={card} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CardPlaceholder({ card }) {
  return (
    <div style={{
      width: '130px', height: '182px', background: 'var(--bg-overlay)',
      borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '8px', textAlign: 'center',
      fontSize: '12px', color: 'var(--text-muted)',
    }}>
      {card.name}
    </div>
  );
}

function rarityColor(rarity) {
  return { common: '#b0bec5', uncommon: '#90a4ae', rare: '#4a90d9', mythic: '#e67e22' }[rarity] ?? '#fff';
}

const inputStyle = {
  background: 'var(--bg-surface)', border: '1px solid var(--border-mid)',
  color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-2) var(--space-3)', fontSize: '14px', outline: 'none',
};
const btnStyle = {
  background: 'var(--bg-overlay)', border: '1px solid var(--border-mid)',
  color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
  padding: '8px 20px', cursor: 'pointer', fontSize: '13px',
  fontFamily: 'var(--font-display)', letterSpacing: '0.04em',
};
