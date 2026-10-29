import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchForecast, searchLocations } from './api'
import { FALLBACK_WEATHER } from './fallback'
import type { LocationChoice, WeatherSnapshot } from './types'
import { useWeatherStation } from './useWeatherStation'

vi.mock('./api', () => ({
  fetchForecast: vi.fn(),
  searchLocations: vi.fn(),
}))

const mockedFetchForecast = vi.mocked(fetchForecast)
const mockedSearchLocations = vi.mocked(searchLocations)

const liveSnapshot: WeatherSnapshot = {
  ...FALLBACK_WEATHER,
  source: 'live',
  temperatureC: 23.7,
  location: {
    ...FALLBACK_WEATHER.location,
    id: 'nairobi-live',
    admin1: 'Nairobi County',
  },
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('useWeatherStation', () => {
  it('starts with bundled readings while loading and replaces them with live data', async () => {
    const request = deferred<WeatherSnapshot>()
    mockedFetchForecast.mockReturnValue(request.promise)

    const { result } = renderHook(() => useWeatherStation())

    await waitFor(() => expect(result.current.state.loadState).toBe('loading'))
    expect(result.current.state.snapshot).toEqual(FALLBACK_WEATHER)
    expect(result.current.state.message).toBe('Loading live weather…')

    await act(async () => request.resolve(liveSnapshot))

    expect(result.current.state.loadState).toBe('live')
    expect(result.current.state.snapshot).toEqual(liveSnapshot)
    expect(result.current.state.message).toBe('Live weather updated')
  })

  it('retains bundled data when the initial live request fails', async () => {
    mockedFetchForecast.mockRejectedValue(new Error('network unavailable'))

    const { result } = renderHook(() => useWeatherStation())

    await waitFor(() => expect(result.current.state.loadState).toBe('fallback'))
    expect(result.current.state.snapshot).toEqual(FALLBACK_WEATHER)
    expect(result.current.state.message).toContain('demonstration data')
  })

  it('retains the last successful live snapshot when refresh fails and can retry', async () => {
    mockedFetchForecast
      .mockResolvedValueOnce(liveSnapshot)
      .mockRejectedValueOnce(new Error('refresh failed'))
      .mockResolvedValueOnce({ ...liveSnapshot, temperatureC: 24.1 })

    const { result } = renderHook(() => useWeatherStation())
    await waitFor(() => expect(result.current.state.loadState).toBe('live'))

    await act(async () => result.current.refresh())
    expect(result.current.state.loadState).toBe('error')
    expect(result.current.state.snapshot).toEqual(liveSnapshot)
    expect(result.current.state.message).toContain('last live readings')

    await act(async () => result.current.refresh())
    expect(result.current.state.loadState).toBe('live')
    expect(result.current.state.snapshot.temperatureC).toBe(24.1)
  })

  it('ignores a stale location response and aborts its request', async () => {
    mockedFetchForecast.mockResolvedValueOnce(liveSnapshot)
    const first = deferred<WeatherSnapshot>()
    const second = deferred<WeatherSnapshot>()
    const signals: AbortSignal[] = []
    mockedFetchForecast.mockImplementation((location, signal) => {
      signals.push(signal)
      return location.id === 'first' ? first.promise : second.promise
    })

    const { result } = renderHook(() => useWeatherStation())
    await waitFor(() => expect(result.current.state.loadState).toBe('live'))

    const firstLocation: LocationChoice = {
      ...FALLBACK_WEATHER.location,
      id: 'first',
      name: 'First',
    }
    const secondLocation: LocationChoice = {
      ...FALLBACK_WEATHER.location,
      id: 'second',
      name: 'Second',
    }

    let firstSelection!: Promise<void>
    let secondSelection!: Promise<void>
    act(() => {
      firstSelection = result.current.selectLocation(firstLocation)
      secondSelection = result.current.selectLocation(secondLocation)
    })

    expect(signals[0].aborted).toBe(true)
    const secondSnapshot = {
      ...liveSnapshot,
      location: secondLocation,
      temperatureC: 18,
    }
    await act(async () => second.resolve(secondSnapshot))
    expect(result.current.state.snapshot.location.id).toBe('second')

    await act(async () => first.resolve({ ...liveSnapshot, location: firstLocation }))
    await Promise.all([firstSelection, secondSelection])
    expect(result.current.state.snapshot.location.id).toBe('second')
  })

  it('represents short and empty searches without unnecessary requests', async () => {
    mockedFetchForecast.mockResolvedValue(liveSnapshot)
    mockedSearchLocations.mockResolvedValue([])
    const { result } = renderHook(() => useWeatherStation())
    await waitFor(() => expect(result.current.state.loadState).toBe('live'))

    await act(async () => result.current.search('na'))
    expect(mockedSearchLocations).not.toHaveBeenCalled()
    expect(result.current.state.searchState).toBe('idle')

    await act(async () => result.current.search('Nowhere'))
    expect(result.current.state.searchState).toBe('empty')
    expect(result.current.state.searchResults).toEqual([])
  })

  it('updates selected day, unit system, and forced fallback state', async () => {
    mockedFetchForecast.mockResolvedValue(liveSnapshot)
    const { result } = renderHook(() => useWeatherStation())
    await waitFor(() => expect(result.current.state.loadState).toBe('live'))

    act(() => {
      result.current.setUnits('imperial')
      result.current.selectDay(liveSnapshot.daily[1].date)
      result.current.forceFallback()
    })

    expect(result.current.state.units).toBe('imperial')
    expect(result.current.state.snapshot.source).toBe('fallback')
    expect(result.current.state.message).toContain('demonstration mode')
  })
})
