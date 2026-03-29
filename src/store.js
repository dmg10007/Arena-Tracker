import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDeck, addCard, removeCard } from './utils/deckUtils';

// ─── Deck Store ───────────────────────────────────────────────────────────────
export const useDeckStore = create(
  persist(
    (set, get) => ({
      decks: {},           // { id: deck }
      activeDeckId: null,

      createDeck: (name) => {
        const deck = createDeck(name);
        set((s) => ({ decks: { ...s.decks, [deck.id]: deck }, activeDeckId: deck.id }));
        return deck.id;
      },

      deleteDeck: (id) =>
        set((s) => {
          const decks = { ...s.decks };
          delete decks[id];
          return { decks, activeDeckId: s.activeDeckId === id ? null : s.activeDeckId };
        }),

      setActiveDeck: (id) => set({ activeDeckId: id }),

      addCardToDeck: (deckId, card, section = 'mainboard') =>
        set((s) => {
          const deck = s.decks[deckId];
          if (!deck) return; // no-op if deck doesn't exist
          return {
            decks: {
              ...s.decks,
              [deckId]: addCard(deck, card, section),
            },
          };
        }),

      removeCardFromDeck: (deckId, cardName, section = 'mainboard') =>
        set((s) => {
          const deck = s.decks[deckId];
          if (!deck) return; // no-op if deck doesn't exist
          return {
            decks: {
              ...s.decks,
              [deckId]: removeCard(deck, cardName, section),
            },
          };
        }),

      renameDeck: (id, name) =>
        set((s) => ({
          decks: {
            ...s.decks,
            [id]: { ...s.decks[id], name, updatedAt: new Date().toISOString() },
          },
        })),

      getActiveDeck: () => {
        const { decks, activeDeckId } = get();
        return activeDeckId ? decks[activeDeckId] : null;
      },
    }),
    { name: 'mtg-decks' }
  )
);

// ─── Collection Store ──────────────────────────────────────────────────────────
export const useCollectionStore = create(
  persist(
    (set) => ({
      collection: {},   // { cardId: { card, count } }
      wildcards: { common: 0, uncommon: 0, rare: 0, mythic: 0 },

      addToCollection: (card, count = 1) =>
        set((s) => {
          const existing = s.collection[card.id];
          return {
            collection: {
              ...s.collection,
              [card.id]: {
                card,
                count: (existing?.count ?? 0) + count,
              },
            },
          };
        }),

      removeFromCollection: (cardId, count = 1) =>
        set((s) => {
          const existing = s.collection[cardId];
          if (!existing) return; // no-op if not present
          const updated = { ...s.collection };
          if (existing.count <= count) {
            delete updated[cardId];
          } else {
            updated[cardId] = { ...existing, count: existing.count - count };
          }
          return { collection: updated };
        }),

      setWildcards: (wildcards) => set({ wildcards }),

      clearCollection: () => set({ collection: {}, wildcards: { common: 0, uncommon: 0, rare: 0, mythic: 0 } }),
    }),
    { name: 'mtg-collection' }
  )
);
