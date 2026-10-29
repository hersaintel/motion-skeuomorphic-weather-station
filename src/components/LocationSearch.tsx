import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState } from 'react'
import type { SearchState } from '../weather/useWeatherStation'
import type { LocationChoice } from '../weather/types'

interface LocationSearchProps {
  results: LocationChoice[]
  searchState: SearchState
  onSearch(query: string): Promise<void>
  onSelect(location: LocationChoice): void
}

export function LocationSearch({
  results,
  searchState,
  onSearch,
  onSelect,
}: LocationSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listId = useId()
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const close = () => {
    setOpen(false)
    setActiveIndex(-1)
    triggerRef.current?.focus()
  }

  const selectActive = () => {
    const selected = results[activeIndex]
    if (!selected) return
    onSelect(selected)
    close()
  }

  const statusMessage =
    query.trim().length < 3
      ? 'Enter at least 3 characters'
      : searchState === 'loading'
        ? 'Searching locations…'
        : searchState === 'empty'
          ? 'No matching locations'
          : searchState === 'error'
            ? 'Location search failed'
            : searchState === 'ready'
              ? `${results.length} locations available`
              : ''

  return (
    <div className="location-search">
      <motion.button
        ref={triggerRef}
        type="button"
        className="location-search__trigger"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        whileTap={reducedMotion ? undefined : { y: 2, scale: 0.98 }}
      >
        Change location
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="location-search__panel"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -6 }}
          >
            <label htmlFor={`${listId}-input`}>Search locations</label>
            <input
              ref={inputRef}
              id={`${listId}-input`}
              role="combobox"
              aria-label="Search locations"
              aria-autocomplete="list"
              aria-controls={listId}
              aria-expanded={results.length > 0}
              aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
              value={query}
              onChange={(event) => {
                const next = event.target.value
                setQuery(next)
                setActiveIndex(-1)
                void onSearch(next)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  close()
                } else if (event.key === 'ArrowDown' && results.length > 0) {
                  event.preventDefault()
                  setActiveIndex((index) => (index + 1) % results.length)
                } else if (event.key === 'ArrowUp' && results.length > 0) {
                  event.preventDefault()
                  setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1))
                } else if (event.key === 'Enter' && activeIndex >= 0) {
                  event.preventDefault()
                  selectActive()
                }
              }}
            />
            <p role="status" className="location-search__status">{statusMessage}</p>
            {query.trim().length >= 3 && searchState === 'ready' && results.length > 0 && (
              <ul id={listId} role="listbox" aria-label="Location results">
                {results.map((location, index) => (
                  <li
                    id={`${listId}-${index}`}
                    key={location.id}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onSelect(location)
                      close()
                    }}
                  >
                    <strong>{location.name}</strong>
                    <span>{[location.admin1, location.country].filter(Boolean).join(', ')}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
