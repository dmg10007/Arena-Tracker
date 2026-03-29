/**
 * Deck utility functions
 */

export const MAX_COPIES = 4;
export const BASIC_LANDS = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Wastes'];
export const DECK_SIZE = 60;
export const SIDEBOARD_SIZE = 15;

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // fall through to fallback below
    }
  }
  return `deck-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Create a new empty deck.
 */
export function createDeck(name = 'New Deck') {
  return {
    id: generateId(),
    name,
    format: 'Standard',
    mainboard: {},   // { cardName: { card, count } }
    sideboard: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Add a card to a deck section.
 * @param {object} deck
 * @param {object} card - Scryfall card object
 * @param {'mainboard'|'sideboard'} section
 * @returns {object} updated deck
 */
export function addCard(deck, card, section = 'mainboard') {
  if (!deck) return deck; // guard: no-op if deck missing

  const key = card.name;
  const current = deck[section][key];
  const isBasic = BASIC_LANDS.includes(card.name);
  const maxCopies = isBasic ? Infinity : MAX_COPIES;

  if (current && current.count >= maxCopies) return deck;

  return {
    ...deck,
    [section]: {
      ...deck[section],
      [key]: {
        card,
        count: (current?.count ?? 0) + 1,
      },
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Remove one copy of a card from a section.
 */
export function removeCard(deck, cardName, section = 'mainboard') {
  if (!deck) return deck; // guard: no-op if deck missing

  const current = deck[section][cardName];
  if (!current) return deck;

  const updated = { ...deck[section] };
  if (current.count <= 1) {
    delete updated[cardName];
  } else {
    updated[cardName] = { ...current, count: current.count - 1 };
  }

  return {
    ...deck,
    [section]: updated,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get total card count in a section.
 */
export function countCards(section) {
  return Object.values(section).reduce((sum, { count }) => sum + count, 0);
}

/**
 * Get the mana curve (CMC breakdown) for the mainboard.
 * Returns array suitable for Recharts: [{ cmc: 0, count: N }, ...]
 */
export function getManaCurve(mainboard) {
  const curve = {};
  for (const { card, count } of Object.values(mainboard)) {
    const cmc = Math.min(card.cmc ?? 0, 7); // Cap at 7+
    curve[cmc] = (curve[cmc] ?? 0) + count;
  }
  return Array.from({ length: 8 }, (_, i) => ({
    cmc: i === 7 ? '7+' : String(i),
    count: curve[i] ?? 0,
  }));
}

/**
 * Get color distribution for the mainboard.
 */
export function getColorBreakdown(mainboard) {
  const colors = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
  for (const { card, count } of Object.values(mainboard)) {
    if (!card.colors || card.colors.length === 0) {
      colors.C += count;
    } else {
      for (const c of card.colors) colors[c] = (colors[c] ?? 0) + count;
    }
  }
  return colors;
}

/**
 * Export deck to MTGA text format.
 */
export function exportToArena(deck) {
  const lines = ['Deck'];
  for (const { card, count } of Object.values(deck.mainboard)) {
    lines.push(`${count} ${card.name}`);
  }
  const sbEntries = Object.values(deck.sideboard);
  if (sbEntries.length > 0) {
    lines.push('', 'Sideboard');
    for (const { card, count } of sbEntries) {
      lines.push(`${count} ${card.name}`);
    }
  }
  return lines.join('\n');
}

/**
 * Parse MTGA export text format into a card name/count map.
 * Returns { mainboard: { name: count }, sideboard: { name: count } }
 */
export function parseArenaExport(text) {
  const result = { mainboard: {}, sideboard: {} };
  let section = 'mainboard';

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line === 'Deck') continue;
    if (line === 'Sideboard') { section = 'sideboard'; continue; }

    const match = line.match(/^(\d+)\s+(.+)$/);
    if (match) {
      const count = parseInt(match[1], 10);
      const name = match[2].trim();
      result[section][name] = (result[section][name] ?? 0) + count;
    }
  }

  return result;
}
