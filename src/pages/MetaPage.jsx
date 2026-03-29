import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

// ── Seeded meta data (update with community sources) ─────────────────────────
const META_ARCHETYPES = [
  { name: 'Domain Ramp',      tier: 'S', winRate: 57.4, playRate: 14.2, colors: ['W','U','B','R','G'], tags: ['Ramp','Control'] },
  { name: 'Esper Midrange',   tier: 'S', winRate: 56.1, playRate: 11.8, colors: ['W','U','B'],         tags: ['Midrange'] },
  { name: 'Mono-Red Aggro',   tier: 'A', winRate: 54.8, playRate: 9.3,  colors: ['R'],                 tags: ['Aggro','Burn'] },
  { name: 'Azorius Soldiers', tier: 'A', winRate: 53.2, playRate: 8.7,  colors: ['W','U'],             tags: ['Aggro','Tribal'] },
  { name: 'Golgari Midrange', tier: 'A', winRate: 52.9, playRate: 8.1,  colors: ['B','G'],             tags: ['Midrange','Value'] },
  { name: 'Rakdos Reanimator',tier: 'B', winRate: 51.6, playRate: 6.4,  colors: ['B','R'],             tags: ['Combo','Graveyard'] },
  { name: 'Selesnya Tokens',  tier: 'B', winRate: 50.4, playRate: 5.9,  colors: ['W','G'],             tags: ['Aggro','Go-Wide'] },
  { name: 'Dimir Control',    tier: 'B', winRate: 49.8, playRate: 5.2,  colors: ['U','B'],             tags: ['Control'] },
  { name: 'Izzet Spells',     tier: 'B', winRate: 49.1, playRate: 4.8,  colors: ['U','R'],             tags: ['Spells','Tempo'] },
  { name: 'Mono-White Lifegain', tier: 'C', winRate: 47.3, playRate: 3.6, colors: ['W'],              tags: ['Aggro','Lifegain'] },
  { name: 'Sultai Graveyard', tier: 'C', winRate: 46.8, playRate: 3.1,  colors: ['U','B','G'],        tags: ['Graveyard','Value'] },
  { name: 'Temur Midrange',   tier: 'C', winRate: 45.9, playRate: 2.7,  colors: ['U','R','G'],        tags: ['Midrange'] },
];

const TIER_LABELS = { S: 'Top Tier', A: 'Strong', B: 'Viable', C: 'Fringe' };
const TIER_COLORS = { S: '#f0c060', A: '#4a90d9', B: '#27ae60', C: '#95a5a6' };
const MANA_COLORS = { W: '#f8f5d8', U: '#4a90d9', B: '#9b59b6', R: '#e74c3c', G: '#27ae60' };

const RADAR_DATA = [
  { subject: 'Speed',     'Domain Ramp': 30, 'Mono-Red Aggro': 95, 'Esper Midrange': 50 },
  { subject: 'Resilience',     'Domain Ramp': 85, 'Mono-Red Aggro': 40, 'Esper Midrange': 80 },
  { subject: 'Card Advantage', 'Domain Ramp': 90, 'Mono-Red Aggro': 45, 'Esper Midrange': 88 },
  { subject: 'Disruption',     'Domain Ramp': 60, 'Mono-Red Aggro': 30, 'Esper Midrange': 85 },
  { subject: 'Consistency',    'Domain Ramp': 75, 'Mono-Red Aggro': 82, 'Esper Midrange': 78 },
  { subject: 'Ceiling',        'Domain Ramp': 92, 'Mono-Red Aggro': 70, 'Esper Midrange': 88 },
];

export default function MetaPage() {
  const [view, setView] = useState('tier');   // 'tier' | 'winrate' | 'radar'
  const [filterTier, setFilterTier] = useState('all');

  const filtered = META_ARCHETYPES.filter((a) => filterTier === 'all' || a.tier === filterTier);

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
        <h1>Meta Dashboard</h1>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Standard · Updated manually — edit <code>MetaPage.jsx</code>
        </span>
      </div>

      {/* View switcher */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
        {[['tier', 'Tier List'], ['winrate', 'Win Rates'], ['radar', 'Archetype Radar']].map(([v, label]) => (
          <button key={v} onClick={() => setView(v)} style={{
            ...btnStyle,
            background: view === v ? 'var(--gold-dark)' : 'var(--bg-overlay)',
            borderColor: view === v ? 'var(--gold-mid)' : 'var(--border-mid)',
            color: view === v ? 'var(--gold-light)' : 'var(--text-secondary)',
          }}>{label}</button>
        ))}
        <div style={{ flex: 1 }} />
        <select value={filterTier} onChange={(e) => setFilterTier(e.target.value)} style={selectStyle}>
          <option value="all">All Tiers</option>
          {['S','A','B','C'].map((t) => <option key={t} value={t}>Tier {t}</option>)}
        </select>
      </div>

      {/* ── Tier list view ── */}
      {view === 'tier' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {['S','A','B','C'].filter((t) => filterTier === 'all' || filterTier === t).map((tier) => {
            const archetypes = filtered.filter((a) => a.tier === tier);
            if (!archetypes.length) return null;
            return (
              <div key={tier} style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)',
                borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              }}>
                <div style={{
                  background: `${TIER_COLORS[tier]}18`,
                  borderBottom: `1px solid ${TIER_COLORS[tier]}33`,
                  padding: 'var(--space-2) var(--space-4)',
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: TIER_COLORS[tier], fontWeight: 900, width: '24px' }}>{tier}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>{TIER_LABELS[tier].toUpperCase()}</span>
                </div>
                {archetypes.map((a) => (
                  <ArchetypeRow key={a.name} archetype={a} />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Win rate bar chart ── */}
      {view === 'winrate' && (
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: '13px', letterSpacing: '0.08em', marginBottom: 'var(--space-4)', color: 'var(--text-muted)' }}>WIN RATE BY ARCHETYPE</h3>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart
              data={[...filtered].sort((a, b) => b.winRate - a.winRate)}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 120, bottom: 0 }}
            >
              <XAxis type="number" domain={[40, 62]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={115} />
              <Tooltip
                formatter={(v) => [`${v}%`, 'Win Rate']}
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', fontSize: 12 }}
              />
              <Bar dataKey="winRate" radius={[0, 4, 4, 0]}>
                {filtered.sort((a, b) => b.winRate - a.winRate).map((a) => (
                  <rect key={a.name} fill={TIER_COLORS[a.tier]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Radar chart ── */}
      {view === 'radar' && (
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: '13px', letterSpacing: '0.08em', marginBottom: 'var(--space-2)', color: 'var(--text-muted)' }}>ARCHETYPE COMPARISON (TOP 3)</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>Domain Ramp vs Esper Midrange vs Mono-Red Aggro</p>
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="var(--border-dim)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Domain Ramp"    dataKey="Domain Ramp"    stroke={TIER_COLORS.S} fill={TIER_COLORS.S} fillOpacity={0.15} />
              <Radar name="Esper Midrange" dataKey="Esper Midrange" stroke={TIER_COLORS.A} fill={TIER_COLORS.A} fillOpacity={0.15} />
              <Radar name="Mono-Red Aggro" dataKey="Mono-Red Aggro" stroke={TIER_COLORS.B} fill={TIER_COLORS.B} fillOpacity={0.15} />
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', marginTop: 'var(--space-3)' }}>
            {[['Domain Ramp', TIER_COLORS.S], ['Esper Midrange', TIER_COLORS.A], ['Mono-Red Aggro', TIER_COLORS.B]].map(([name, color]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: color }} />
                {name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Play rate summary */}
      <div style={{
        marginTop: 'var(--space-5)',
        background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
      }}>
        <h3 style={{ fontSize: '12px', letterSpacing: '0.1em', marginBottom: 'var(--space-3)', color: 'var(--text-muted)' }}>METAGAME SHARE</h3>
        <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', gap: '1px' }}>
          {META_ARCHETYPES.map((a) => (
            <div key={a.name} title={`${a.name}: ${a.playRate}%`}
              style={{ flex: a.playRate, background: TIER_COLORS[a.tier], opacity: 0.85 }} />
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
          {META_ARCHETYPES.map((a) => (
            <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: TIER_COLORS[a.tier] }} />
              {a.name} <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{a.playRate}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArchetypeRow({ archetype }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
      padding: 'var(--space-3) var(--space-4)',
      borderBottom: '1px solid var(--border-dim)',
    }}>
      {/* Color pips */}
      <div style={{ display: 'flex', gap: '3px', width: '80px', flexShrink: 0 }}>
        {archetype.colors.map((c) => (
          <span key={c} className={`mana-badge mana-${c}`} style={{ background: MANA_COLORS[c] }}>{c}</span>
        ))}
      </div>

      {/* Name */}
      <span style={{ flex: 1, fontSize: '15px', fontFamily: 'var(--font-body)' }}>{archetype.name}</span>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        {archetype.tags.map((tag) => (
          <span key={tag} style={{
            fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
            background: 'var(--bg-overlay)', color: 'var(--text-muted)',
            border: '1px solid var(--border-dim)', fontFamily: 'var(--font-mono)',
            letterSpacing: '0.06em',
          }}>{tag}</span>
        ))}
      </div>

      {/* Win rate */}
      <div style={{ textAlign: 'right', minWidth: '80px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: archetype.winRate >= 53 ? 'var(--gold-light)' : 'var(--text-primary)' }}>
          {archetype.winRate}%
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{archetype.playRate}% play</div>
      </div>
    </div>
  );
}

const btnStyle = {
  background: 'var(--bg-overlay)', border: '1px solid var(--border-mid)',
  color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)',
  padding: '6px 16px', cursor: 'pointer', fontSize: '13px',
  fontFamily: 'var(--font-display)', letterSpacing: '0.04em', transition: 'all 0.15s',
};
const selectStyle = {
  background: 'var(--bg-surface)', border: '1px solid var(--border-mid)',
  color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
  padding: '6px 12px', fontSize: '13px', cursor: 'pointer', outline: 'none',
};
