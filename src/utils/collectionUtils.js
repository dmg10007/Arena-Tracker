/**
 * Collection utility functions
 */

/**
 * Given a deck and a collection, return cards missing from the collection
 * needed to complete the deck.
 * @param {object} deck - Deck object with mainboard/sideboard
 * @param {object} collection - { cardId: { card, count } }
 * @returns {Array} Array of { card, needed, owned } objects
 */
export function getMissingCards(deck, collection) {
  const collectionByName = {};
  for (const { card, count } of Object.values(collection)) {
    collectionByName[card.name] = (collectionByName[card.name] ?? 0) + count;
  }

  const missing = [];
  const allCards = { ...deck.mainboard, ...deck.sideboard };

  for (const { card, count } of Object.values(allCards)) {
    const owned = collectionByName[card.name] ?? 0;
    if (owned < count) {
      missing.push({ card, needed: count - owned, owned });
    }
  }

  return missing;
}

/**
 * Calculate how many wildcards are needed to complete a deck.
 * @param {Array} missingCards - Output of getMissingCards
 * @returns {{ common: N, uncommon: N, rare: N, mythic: N }}
 */
export function getWildcardsNeeded(missingCards) {
  const wildcards = { common: 0, uncommon: 0, rare: 0, mythic: 0 };
  for (const { card, needed } of missingCards) {
    if (wildcards[card.rarity] !== undefined) {
      wildcards[card.rarity] += needed;
    }
  }
  return wildcards;
}

/**
 * Check if a collection has enough wildcards to complete a deck.
 */
export function canCompleteWithWildcards(missingCards, wildcards) {
  const needed = getWildcardsNeeded(missingCards);
  return (
    wildcards.common    >= needed.common &&
    wildcards.uncommon  >= needed.uncommon &&
    wildcards.rare      >= needed.rare &&
    wildcards.mythic    >= needed.mythic
  );
}

/**
 * Calculate collection completion percentage for a given deck.
 */
export function getDeckCompletion(deck, collection) {
  const collectionByName = {};
  for (const { card, count } of Object.values(collection)) {
    collectionByName[card.name] = (collectionByName[card.name] ?? 0) + count;
  }

  let totalNeeded = 0;
  let totalOwned = 0;

  for (const { card, count } of Object.values(deck.mainboard)) {
    totalNeeded += count;
    totalOwned += Math.min(collectionByName[card.name] ?? 0, count);
  }

  return totalNeeded === 0 ? 100 : Math.round((totalOwned / totalNeeded) * 100);
}
