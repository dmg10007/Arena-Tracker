import { useDeckStore } from '../store';

describe('deck store', () => {
  beforeEach(() => {
    // reset store
    useDeckStore.setState({ decks: {}, activeDeckId: null });
  });

  test('createDeck creates a deck and sets activeDeckId', () => {
    const id = useDeckStore.getState().createDeck('StoreTest');
    const state = useDeckStore.getState();
    expect(state.decks[id]).toBeDefined();
    expect(state.activeDeckId).toBe(id);
  });

  test('addCardToDeck is no-op when deck missing', () => {
    const before = JSON.stringify(useDeckStore.getState().decks);
    useDeckStore.getState().addCardToDeck('nope', { name: 'X' }, 'mainboard');
    const after = JSON.stringify(useDeckStore.getState().decks);
    expect(after).toBe(before);
  });
});
