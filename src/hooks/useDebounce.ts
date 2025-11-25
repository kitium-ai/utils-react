import { useEffect, useState } from 'react';

/**
 * Hook that debounces a value
 *
 * @template T - The type of the value
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * const SearchInput = () => {
 *   const [search, setSearch] = useState('');
 *   const debouncedSearch = useDebounce(search, 300);
 *
 *   useEffect(() => {
 *     // API call with debouncedSearch
 *   }, [debouncedSearch]);
 *
 *   return <input value={search} onChange={(e) => setSearch(e.target.value)} />;
 * };
 * ```
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
