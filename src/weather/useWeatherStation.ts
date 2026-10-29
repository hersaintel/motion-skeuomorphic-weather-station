import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchForecast, searchLocations } from './api'
import { FALLBACK_WEATHER } from './fallback'
import type {
  LocationChoice,
  UnitSystem,
  WeatherSnapshot,
} from './types'

export type LoadState = 'idle' | 'loading' | 'live' | 'fallback' | 'error'
export type SearchState = 'idle' | 'loading' | 'ready' | 'empty' | 'error'

export interface WeatherStationState {
  snapshot: WeatherSnapshot
  units: UnitSystem
  loadState: LoadState
  message: string
  selectedDay: string
  searchResults: LocationChoice[]
  searchState: SearchState
}

export interface WeatherStationController {
  state: WeatherStationState
  refresh(): Promise<void>
  selectLocation(location: LocationChoice): Promise<void>
  search(query: string): Promise<void>
  selectDay(date: string): void
  setUnits(units: UnitSystem): void
  forceFallback(): void
}

const initialState: WeatherStationState = {
  snapshot: FALLBACK_WEATHER,
  units: 'metric',
  loadState: 'idle',
  message: 'Bundled demonstration data ready',
  selectedDay: FALLBACK_WEATHER.daily[0].date,
  searchResults: [],
  searchState: 'idle',
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export function useWeatherStation(): WeatherStationController {
  const [state, setState] = useState(initialState)
  const stateRef = useRef(state)
  const requestSequence = useRef(0)
  const weatherRequest = useRef<AbortController | null>(null)
  const searchRequest = useRef<AbortController | null>(null)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const loadLocation = useCallback(async (location: LocationChoice) => {
    const sequence = ++requestSequence.current
    weatherRequest.current?.abort()
    const controller = new AbortController()
    weatherRequest.current = controller

    setState((current) => ({
      ...current,
      loadState: 'loading',
      message: 'Loading live weather…',
    }))

    try {
      const snapshot = await fetchForecast(location, controller.signal)
      if (sequence !== requestSequence.current) return
      setState((current) => ({
        ...current,
        snapshot,
        selectedDay: snapshot.daily[0]?.date ?? current.selectedDay,
        loadState: 'live',
        message: 'Live weather updated',
      }))
    } catch (error) {
      if (isAbortError(error) || sequence !== requestSequence.current) return
      const hasLiveSnapshot = stateRef.current.snapshot.source === 'live'
      setState((current) => ({
        ...current,
        snapshot: hasLiveSnapshot ? current.snapshot : FALLBACK_WEATHER,
        selectedDay: hasLiveSnapshot
          ? current.selectedDay
          : FALLBACK_WEATHER.daily[0].date,
        loadState: hasLiveSnapshot ? 'error' : 'fallback',
        message: hasLiveSnapshot
          ? 'Refresh failed; showing the last live readings. Retry when ready.'
          : 'Live weather unavailable; showing bundled demonstration data.',
      }))
    }
  }, [])

  useEffect(() => {
    void loadLocation(FALLBACK_WEATHER.location)
    return () => {
      weatherRequest.current?.abort()
      searchRequest.current?.abort()
    }
  }, [loadLocation])

  const refresh = useCallback(
    () => loadLocation(stateRef.current.snapshot.location),
    [loadLocation],
  )

  const selectLocation = useCallback(
    (location: LocationChoice) => loadLocation(location),
    [loadLocation],
  )

  const search = useCallback(async (query: string) => {
    const normalizedQuery = query.trim()
    searchRequest.current?.abort()
    if (normalizedQuery.length < 3) {
      setState((current) => ({
        ...current,
        searchResults: [],
        searchState: 'idle',
      }))
      return
    }

    const controller = new AbortController()
    searchRequest.current = controller
    setState((current) => ({ ...current, searchState: 'loading' }))

    try {
      const results = await searchLocations(normalizedQuery, controller.signal)
      if (controller.signal.aborted) return
      setState((current) => ({
        ...current,
        searchResults: results,
        searchState: results.length > 0 ? 'ready' : 'empty',
      }))
    } catch (error) {
      if (isAbortError(error)) return
      setState((current) => ({
        ...current,
        searchResults: [],
        searchState: 'error',
      }))
    }
  }, [])

  const selectDay = useCallback((date: string) => {
    setState((current) => ({ ...current, selectedDay: date }))
  }, [])

  const setUnits = useCallback((units: UnitSystem) => {
    setState((current) => ({ ...current, units }))
  }, [])

  const forceFallback = useCallback(() => {
    requestSequence.current += 1
    weatherRequest.current?.abort()
    setState((current) => ({
      ...current,
      snapshot: FALLBACK_WEATHER,
      selectedDay: FALLBACK_WEATHER.daily[0].date,
      loadState: 'fallback',
      message: 'Bundled demonstration mode enabled',
    }))
  }, [])

  return {
    state,
    refresh,
    selectLocation,
    search,
    selectDay,
    setUnits,
    forceFallback,
  }
}
