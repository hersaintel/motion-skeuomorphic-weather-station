import { parseForecastResponse } from './transform'
import type { LocationChoice, WeatherSnapshot } from './types'

const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast'
const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search'

export class WeatherRequestError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'WeatherRequestError'
    this.status = status
  }
}

async function fetchJson(url: URL, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new WeatherRequestError(
      `Weather request failed with status ${response.status}`,
      response.status,
    )
  }

  try {
    return await response.json()
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }
    throw new WeatherRequestError('Weather service returned invalid JSON')
  }
}

export async function fetchForecast(
  location: LocationChoice,
  signal: AbortSignal,
): Promise<WeatherSnapshot> {
  const url = new URL(FORECAST_ENDPOINT)
  url.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    timezone: location.timezone,
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,surface_pressure,weather_code,wind_speed_10m,wind_direction_10m',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',
    forecast_days: '7',
  }).toString()

  return parseForecastResponse(await fetchJson(url, signal), location)
}

type GeocodingRecord = Record<string, unknown>

function parseLocation(value: unknown): LocationChoice | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null
  }
  const record = value as GeocodingRecord
  if (
    (typeof record.id !== 'string' && typeof record.id !== 'number') ||
    typeof record.name !== 'string' ||
    typeof record.country !== 'string' ||
    typeof record.latitude !== 'number' ||
    typeof record.longitude !== 'number' ||
    typeof record.timezone !== 'string'
  ) {
    return null
  }

  return {
    id: String(record.id),
    name: record.name,
    ...(typeof record.admin1 === 'string' ? { admin1: record.admin1 } : {}),
    country: record.country,
    latitude: record.latitude,
    longitude: record.longitude,
    timezone: record.timezone,
  }
}

export async function searchLocations(
  query: string,
  signal: AbortSignal,
): Promise<LocationChoice[]> {
  const normalizedQuery = query.trim()
  if (normalizedQuery.length < 3) {
    return []
  }

  const url = new URL(GEOCODING_ENDPOINT)
  url.search = new URLSearchParams({
    name: normalizedQuery,
    count: '6',
    language: 'en',
    format: 'json',
  }).toString()

  const raw = await fetchJson(url, signal)
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new WeatherRequestError('Geocoding service returned invalid data')
  }
  const results = (raw as GeocodingRecord).results
  if (results === undefined) {
    return []
  }
  if (!Array.isArray(results)) {
    throw new WeatherRequestError('Geocoding results must be an array')
  }

  return results.map(parseLocation).filter((item): item is LocationChoice => item !== null)
}
