import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { forecastFixture, handlers } from '../test/handlers'
import { server } from '../test/server'
import type { LocationChoice } from './types'
import {
  WeatherRequestError,
  fetchForecast,
  searchLocations,
} from './api'

const location: LocationChoice = {
  id: 'nairobi-ke',
  name: 'Nairobi',
  country: 'Kenya',
  latitude: -1.2864,
  longitude: 36.8172,
  timezone: 'Africa/Nairobi',
}

const signal = () => new AbortController().signal

describe('fetchForecast', () => {
  it('requests required coordinates and fields and returns a live snapshot', async () => {
    let requestUrl = ''
    server.use(
      http.get('https://api.open-meteo.com/v1/forecast', ({ request }) => {
        requestUrl = request.url
        return HttpResponse.json(forecastFixture)
      }),
    )

    const result = await fetchForecast(location, signal())
    const url = new URL(requestUrl)

    expect(url.searchParams.get('latitude')).toBe('-1.2864')
    expect(url.searchParams.get('longitude')).toBe('36.8172')
    expect(url.searchParams.get('timezone')).toBe('Africa/Nairobi')
    expect(url.searchParams.get('current')).toContain('temperature_2m')
    expect(url.searchParams.get('daily')).toContain('sunrise')
    expect(result.source).toBe('live')
    expect(result.location).toEqual(location)
  })

  it('throws a status-bearing request error for non-success responses', async () => {
    server.use(
      http.get('https://api.open-meteo.com/v1/forecast', () =>
        HttpResponse.json({ reason: 'rate limited' }, { status: 429 }),
      ),
    )

    await expect(fetchForecast(location, signal())).rejects.toMatchObject({
      name: 'WeatherRequestError',
      status: 429,
    } satisfies Partial<WeatherRequestError>)
  })

  it('rejects malformed JSON responses', async () => {
    server.use(
      http.get(
        'https://api.open-meteo.com/v1/forecast',
        () =>
          new HttpResponse('{not-json', {
            headers: { 'content-type': 'application/json' },
          }),
      ),
    )

    await expect(fetchForecast(location, signal())).rejects.toBeInstanceOf(
      WeatherRequestError,
    )
  })

  it('propagates AbortError without wrapping it', async () => {
    const controller = new AbortController()
    controller.abort()

    await expect(fetchForecast(location, controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    })
  })
})

describe('searchLocations', () => {
  it('trims and escapes a query and normalizes geocoding results', async () => {
    let receivedQuery = ''
    server.use(
      http.get('https://geocoding-api.open-meteo.com/v1/search', ({ request }) => {
        receivedQuery = new URL(request.url).searchParams.get('name') ?? ''
        return HttpResponse.json({
          results: [
            {
              id: 184745,
              name: 'Nairobi',
              admin1: 'Nairobi County',
              country: 'Kenya',
              latitude: -1.2864,
              longitude: 36.8172,
              timezone: 'Africa/Nairobi',
            },
          ],
        })
      }),
    )

    await expect(searchLocations('  Nairobi & area  ', signal())).resolves.toEqual([
      {
        id: '184745',
        name: 'Nairobi',
        admin1: 'Nairobi County',
        country: 'Kenya',
        latitude: -1.2864,
        longitude: 36.8172,
        timezone: 'Africa/Nairobi',
      },
    ])
    expect(receivedQuery).toBe('Nairobi & area')
  })

  it('returns no results without requesting for fewer than three characters', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    await expect(searchLocations(' na ', signal())).resolves.toEqual([])
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })

  it('keeps the default handlers available after per-test overrides reset', () => {
    expect(handlers).toHaveLength(2)
  })
})
