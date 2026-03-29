import { useState, useEffect, useCallback, useRef } from 'react';
import { searchCards } from '../utils/scryfallApi';

/**
 * Hook for searching Scryfall cards with debounce and pagination.
 * @param {object} opts - { arenaOnly: true, debounceMs: 400 }
 */
export function useScryfallSearch({ arenaOnly = true, debounceMs = 400 } = {}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCards, setTotalCards] = useState(0);

  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  const doSearch = useCallback(
    async (q, p = 1) => {
      if (!q.trim()) {
        setResults([]);
        setHasMore(false);
        setTotalCards(0);
        return;
      }

      // Cancel previous request
      if (abortRef.current) abortRef.current.abort();

      setLoading(true);
      setError(null);

      try {
        const data = await searchCards(q, { page: p, arenaOnly });
        setResults(p === 1 ? data.data : (prev) => [...prev, ...data.data]);
        setHasMore(data.has_more ?? false);
        setTotalCards(data.total_cards ?? 0);
        setPage(p);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [arenaOnly]
  );

  // Debounced search on query change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query, 1);
    }, debounceMs);
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch, debounceMs]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) doSearch(query, page + 1);
  }, [hasMore, loading, query, page, doSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    setHasMore(false);
    setTotalCards(0);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    hasMore,
    totalCards,
    loadMore,
    clearSearch,
  };
}
