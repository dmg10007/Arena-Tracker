// Scryfall API utility — no API key required
const BASE_URL = 'https://api.scryfall.com';

// Rate-limit helper: Scryfall asks for 50–100ms between requests
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Search for cards by name or query string.
 * @param {string} query - Scryfall search query (e.g. "lightning bolt", "t:creature c:red")
 * @param {object} opts - { page: 1, arenaOnly: true }
 */
export async function searchCards(query, { page = 1, arenaOnly = true } = {}) {
  const q = arenaOnly ? `${query} game:arena` : query;
  const url = `${BASE_URL}/cards/search?q=${encodeURIComponent(q)}&page=${page}&order=name`;
  await delay(100);
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) return { data: [], has_more: false, total_cards: 0 };
    throw new Error(`Scryfall search failed: ${res.status}`);
  }
  return res.json();
}

/**
 * Fetch a single card by exact name.
 */
export async function getCardByName(name) {
  const url = `${BASE_URL}/cards/named?exact=${encodeURIComponent(name)}`;
  await delay(100);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Card not found: ${name}`);
  return res.json();
}

/**
 * Fetch all Arena-legal sets.
 */
export async function getArenaSets() {
  const url = `${BASE_URL}/sets`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch sets');
  const data = await res.json();
  // Filter to Arena-relevant set types
  return data.data.filter((s) =>
    ['expansion', 'core', 'draft_innovation', 'masters'].includes(s.set_type) && s.arena_code
  );
}

/**
 * Fetch all cards in a set (handles pagination automatically).
 * @param {string} setCode - e.g. "woe", "lci", "mkm"
 */
export async function getSetCards(setCode) {
  let cards = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${BASE_URL}/cards/search?q=set:${setCode}&page=${page}&order=collector_number`;
    await delay(100);
    const res = await fetch(url);
    if (!res.ok) break;
    const data = await res.json();
    cards = [...cards, ...data.data];
    hasMore = data.has_more;
    page++;
  }

  return cards;
}

/**
 * Get card image URI. Returns a fallback placeholder if unavailable.
 * @param {object} card - Scryfall card object
 * @param {'small'|'normal'|'large'|'png'|'art_crop'} size
 */
export function getCardImage(card, size = 'normal') {
  if (card.image_uris) return card.image_uris[size];
  // Double-faced cards
  if (card.card_faces?.[0]?.image_uris) return card.card_faces[0].image_uris[size];
  return null;
}

/**
 * Parse mana cost string into symbol array.
 * e.g. "{2}{R}{R}" => ["2", "R", "R"]
 */
export function parseManaCost(manaCost = '') {
  return [...manaCost.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);
}
