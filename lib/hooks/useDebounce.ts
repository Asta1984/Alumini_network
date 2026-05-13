import { useState, useEffect } from 'react'

/**
 * useDebounce Hook
 * 
 * Debounces a value to avoid excessive API calls during rapid input changes.
 * Useful for search bars, autocomplete, and filter inputs.
 * 
 * @param value - The value to debounce (usually from input state)
 * @param delay - Delay in milliseconds before updating (default: 300ms)
 * @returns The debounced value
 * 
 * @example
 * const [searchQuery, setSearchQuery] = useState('')
 * const debouncedQuery = useDebounce(searchQuery, 500)
 * 
 * useEffect(() => {
 *   if (debouncedQuery) {
 *     searchUsers(debouncedQuery)
 *   }
 * }, [debouncedQuery])
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

/**
 * useAsyncSearch Hook
 * 
 * Combines debouncing with async search functionality.
 * Automatically handles loading and error states.
 * 
 * @param searchFn - Async function that performs the search
 * @param delay - Delay in milliseconds before searching (default: 300ms)
 * @returns Object with { results, isLoading, error, hasSearched }
 * 
 * @example
 * const { results, isLoading, error } = useAsyncSearch(async (query) => {
 *   const res = await fetch(`/api/students/list?search=${query}`)
 *   return res.json()
 * }, 400)
 */
interface UseAsyncSearchReturn<T> {
  results: T[]
  isLoading: boolean
  error: string | null
  hasSearched: boolean
}

export function useAsyncSearch<T>(
  searchQuery: string,
  searchFn: (query: string) => Promise<T[]>,
  delay: number = 300,
): UseAsyncSearchReturn<T> {
  const debouncedQuery = useDebounce(searchQuery, delay)
  const [results, setResults] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      setError(null)
      setHasSearched(false)
      return
    }

    const performSearch = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setHasSearched(true)
        const data = await searchFn(debouncedQuery)
        setResults(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed')
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [debouncedQuery, searchFn])

  return { results, isLoading, error, hasSearched }
}
