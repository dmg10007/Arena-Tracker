import { useState, useCallback } from 'react';
import { generatePacks, buildDraftState, makePick, suggestPick } from '../utils/draftUtils';
import { getSetCards } from '../utils/scryfallApi';

export function useDraft() {
  const [draftState, setDraftState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSet, setSelectedSet] = useState(null);

  const startDraft = useCallback(async (setCode) => {
    setLoading(true);
    setError(null);
    try {
      const cards = await getSetCards(setCode);
      if (cards.length < 45) throw new Error('Not enough cards in set to simulate a draft.');
      const allPacks = generatePacks(cards);
      const state = buildDraftState(allPacks, 0);
      setDraftState(state);
      setSelectedSet(setCode);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const pick = useCallback((card) => {
    if (!draftState) return;
    setDraftState((prev) => makePick(prev, card));
  }, [draftState]);

  const autopick = useCallback(() => {
    if (!draftState?.currentPack?.length) return;
    const suggestion = suggestPick(draftState.currentPack);
    if (suggestion) pick(suggestion);
  }, [draftState, pick]);

  const resetDraft = useCallback(() => {
    setDraftState(null);
    setSelectedSet(null);
    setError(null);
  }, []);

  return {
    draftState,
    loading,
    error,
    selectedSet,
    startDraft,
    pick,
    autopick,
    resetDraft,
    isDone: draftState?.isDone ?? false,
    currentPack: draftState?.currentPack ?? [],
    picks: draftState?.picks ?? [],
    pickNumber: draftState?.pickNumber ?? 1,
  };
}
