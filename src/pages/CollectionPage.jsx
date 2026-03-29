import React, { useState } from 'react';
import { useCollectionStore } from '../store';
import { useScryfallSearch } from '../hooks/useScryfallSearch';
import { getCardImage } from '../utils/scryfallApi';

const RARITIES = ['common', 'uncommon', 'rare', 'mythic'];
const RARITY_COLORS = { common: 'var(--rarity-common)', uncommon: 'var(--rarity-uncommon)', rare: 'var(--rarity-blue)', mythic: 'var(--rarity-mythic)' };

export default function CollectionPage() {
  const { collection, wildcards, addToCollection, removeFromCollection, setWildcards } = useCollectionStore();
  const { query, setQuery, results, loading } = useScryfallSearch();
  const [filterRarity, setFilterRarity] = useState('all');

  const collectionList = Object.values(collection).filter(({ card }) =>
    filterRarity === 'all' ? true : card.rarity === filterRarity
  );

  const totalByRarity = RARITIES.reduce((acc, r) => {
    acc[r] = Object.values(collection).filter(({ card }) => card.rarity === r).reduce((s, { count }) => s + count, 0);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: '1100px' }}>
      <h1 style={{ marginBottom: 'var(--space-5)' }}>Collection</h1>

      {/* Wildcards */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        {RARITIES.map((r) => (
          <div key={r} style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)',
            borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)',
            display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', minWidth: '100px',
          }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{r}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className={`rarity-dot rarity-${r}`} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', color: 'var(--text-primary)' }}>{wildcards[r]}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>wildcards</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{totalByRarity[r]} owned</span>
          </div>
        ))}
      </div>

      {/* Filter + search */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        <input
          placeholder="Search to add cards…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ ...inputStyle, flex: '1 1 300px' }}
        />
        <select
          value={filterRarity}
          onChange={(e) => setFilterRarity(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="all">All Rarities</option>
          {RARITIES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
      </div>

      {/* Search results */}
      {query && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 'var(--space-2)', fontFamily: 'var(--font-mono)' }}>
            SEARCH RESULTS — click to add to collection
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {loading && <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Searching…</span>}
            {results.slice(0, 20).map((card) => {
              const img = getCardImage(card, 'small');
              return (
                <div key={card.id} className="card-hover" onClick={() => addToCollection(card, 1)}
                  title={`Add ${card.name}`}
                  style={{ cursor: 'pointer', position: 'relative' }}
                >
                  {img
                    ? <img src={img} alt={card.name} style={{ width: '70px', borderRadius: 'var(--radius-sm)' }} />
                    : <div style={{ width: '70px', height: '98px', background: 'var(--bg-overlay)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', padding: '4px' }}>{card.name}</div>
                  }
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Collection grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 'var(--space-3)',
      }}>
        {collectionList.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', gridColumn: '1/-1' }}>
            No cards yet. Search above to add cards to your collection.
          </p>
        )}
        {collectionList.map(({ card, count }) => {
          const img = getCardImage(card, 'normal');
          return (
            <div key={card.id} style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)',
              borderRadius: 'var(--radius-md)', overflow: 'hidden',
            }}>
              {img
                ? <img src={img} alt={card.name} style={{ width: '100%', display: 'block' }} />
                : <div style={{ height: '196px', background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>{card.name}</div>
              }
              <div style={{ padding: 'var(--space-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`rarity-dot rarity-${card.rarity}`} />
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <button onClick={() => removeFromCollection(card.id)} style={smallBtnStyle}>−</button>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', minWidth: '20px', textAlign: 'center' }}>{count}</span>
                    <button onClick={() => addToCollection(card)} style={smallBtnStyle}>+</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const inputStyle = {
  background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)',
  color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-2) var(--space-3)', fontSize: '14px', outline: 'none',
};
const smallBtnStyle = {
  background: 'var(--bg-overlay)', border: '1px solid var(--border-mid)',
  color: 'var(--text-primary)', borderRadius: '3px', width: '22px', height: '22px',
  cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 0,
};
