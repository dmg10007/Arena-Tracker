/**
 * Draft simulator utilities
 * Simulates a standard booster draft (3 packs, 15 cards each, 8 players)
 */

const PACK_SIZE = 15;
const NUM_PACKS = 3;
const NUM_PLAYERS = 8;

/**
 * Simulate pack opening: distributes cards into packs of 15.
 * @param {Array} setCards - All cards in a set (from Scryfall)
 * @returns {Array} Array of NUM_PLAYERS * NUM_PACKS packs
 */
export function generatePacks(setCards) {
  // Separate by rarity
  const byRarity = { mythic: [], rare: [], uncommon: [], common: [] };
  for (const card of setCards) {
    if (byRarity[card.rarity]) byRarity[card.rarity].push(card);
  }

  const allPacks = [];

  for (let player = 0; player < NUM_PLAYERS; player++) {
    for (let pack = 0; pack < NUM_PACKS; pack++) {
      allPacks.push(openPack(byRarity));
    }
  }

  return allPacks;
}

/**
 * Open a single simulated pack.
 * Standard WotC pack: 1 rare/mythic, 3 uncommons, 10 commons, 1 basic land (simplified)
 */
function openPack(byRarity) {
  const cards = [];

  // 1 rare or mythic (~1 in 8 chance of mythic)
  const rarePool = Math.random() < 0.125 ? byRarity.mythic : byRarity.rare;
  const rareSource = rarePool.length > 0 ? rarePool : byRarity.rare;
  cards.push(pickRandom(rareSource));

  // 3 uncommons
  const uncommons = pickMultipleRandom(byRarity.uncommon, 3);
  cards.push(...uncommons);

  // 10 commons (+ 1 slot, skip basic land for simplicity)
  const commons = pickMultipleRandom(byRarity.common, PACK_SIZE - 4);
  cards.push(...commons);

  return cards;
}

/**
 * Pick a random item from an array.
 */
function pickRandom(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Pick N unique random items from an array (no repeats within a single pick).
 */
function pickMultipleRandom(arr, n) {
  if (!arr || arr.length === 0) return [];
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

/**
 * Build the draft state for a player.
 * @param {Array} allPacks - Output of generatePacks()
 * @param {number} playerIndex - 0-indexed player seat
 */
export function buildDraftState(allPacks, playerIndex = 0) {
  // Player's packs are at indices: playerIndex, playerIndex + NUM_PLAYERS, playerIndex + 2*NUM_PLAYERS
  return {
    packs: [
      allPacks[playerIndex],
      allPacks[playerIndex + NUM_PLAYERS],
      allPacks[playerIndex + NUM_PLAYERS * 2],
    ],
    currentPackIndex: 0,
    currentPack: allPacks[playerIndex],
    picks: [],       // Cards the player has picked
    pickNumber: 1,   // 1–15
  };
}

/**
 * Make a pick from the current pack.
 * @param {object} draftState
 * @param {object} pickedCard - The card the player chose
 */
export function makePick(draftState, pickedCard) {
  const { currentPack, currentPackIndex, picks, packs, pickNumber } = draftState;
  const remainingPack = currentPack.filter((c) => c.id !== pickedCard.id);
  const newPicks = [...picks, pickedCard];

  // Move to next pack if this pack is exhausted
  if (remainingPack.length === 0) {
    const nextPackIndex = currentPackIndex + 1;
    const nextPack = packs[nextPackIndex] ?? [];
    return {
      ...draftState,
      currentPack: nextPack,
      currentPackIndex: nextPackIndex,
      picks: newPicks,
      pickNumber: pickNumber + 1,
      isDone: nextPack.length === 0 && nextPackIndex >= NUM_PACKS,
    };
  }

  return {
    ...draftState,
    currentPack: remainingPack,
    picks: newPicks,
    pickNumber: pickNumber + 1,
    isDone: false,
  };
}

/**
 * Get a simple auto-pick suggestion based on basic heuristics.
 * Prefers higher rarity, then lower CMC.
 */
export function suggestPick(pack) {
  const rarityOrder = { mythic: 4, rare: 3, uncommon: 2, common: 1 };
  return [...pack].sort((a, b) => {
    const rarityDiff = (rarityOrder[b.rarity] ?? 0) - (rarityOrder[a.rarity] ?? 0);
    if (rarityDiff !== 0) return rarityDiff;
    return (a.cmc ?? 0) - (b.cmc ?? 0);
  })[0];
}
