import { createDeck, addCard, removeCard, exportToArena, parseArenaExport } from '../deckUtils';

describe('deckUtils', () => {
  test('createDeck returns object with id and timestamps', () => {
    const deck = createDeck('Test');
    expect(deck).toHaveProperty('id');
    expect(deck).toHaveProperty('createdAt');
    expect(deck).toHaveProperty('updatedAt');
    expect(deck.name).toBe('Test');
  });

  test('addCard increases count and respects MAX_COPIES for non-basic', () => {
    const card = { name: 'Test Creature', cmc: 2, colors: ['G'] };
    let deck = createDeck('T');
    deck = addCard(deck, card, 'mainboard');
    deck = addCard(deck, card, 'mainboard');
    expect(deck.mainboard['Test Creature'].count).toBe(2);
  });

  test('removeCard decreases count and removes when zero', () => {
    const card = { name: 'Test Creature', cmc: 2, colors: ['G'] };
    let deck = createDeck('T');
    deck = addCard(deck, card, 'mainboard');
    deck = removeCard(deck, 'Test Creature', 'mainboard');
    expect(deck.mainboard['Test Creature']).toBeUndefined();
  });

  test('exportToArena and parseArenaExport roundtrip', () => {
    let deck = createDeck('RT');
    const card = { name: 'One Two', cmc: 1 };
    deck = addCard(deck, card, 'mainboard');
    deck = addCard(deck, card, 'mainboard');
    const text = exportToArena(deck);
    const parsed = parseArenaExport(text);
    expect(parsed.mainboard['One Two']).toBe(2);
  });
});
