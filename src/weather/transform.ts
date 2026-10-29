import type {
  DailyForecast,
  LocationChoice,
  UnitSystem,
  WeatherSnapshot,
} from './types'

export class WeatherPayloadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WeatherPayloadError'
  }
}

type UnknownRecord = Record<string, unknown>

const roundOne = (value: number) => Math.round(value * 10) / 10

function asRecord(value: unknown, label: string): UnknownRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new WeatherPayloadError(`${label} must be an object`)
  }
  return value as UnknownRecord
}

function asNumber(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new WeatherPayloadError(`${label} must be a finite number`)
  }
  return value
}

function asString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new WeatherPayloadError(`${label} must be a non-empty string`)
  }
  return value
}

function asArray(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new WeatherPayloadError(`${label} must be an array`)
  }
  return value
}

function parseDaily(raw: unknown): DailyForecast[] {
  const daily = asRecord(raw, 'daily')
  const arrays = {
    dates: asArray(daily.time, 'daily.time'),
    codes: asArray(daily.weather_code, 'daily.weather_code'),
    highs: asArray(daily.temperature_2m_max, 'daily.temperature_2m_max'),
    lows: asArray(daily.temperature_2m_min, 'daily.temperature_2m_min'),
    precipitation: asArray(
      daily.precipitation_probability_max,
      'daily.precipitation_probability_max',
    ),
    sunrises: asArray(daily.sunrise, 'daily.sunrise'),
    sunsets: asArray(daily.sunset, 'daily.sunset'),
  }
  const lengths = Object.values(arrays).map((values) => values.length)
  if (lengths.length === 0 || lengths.some((length) => length !== lengths[0])) {
    throw new WeatherPayloadError('Daily forecast arrays must have matching lengths')
  }
  if (lengths[0] === 0) {
    throw new WeatherPayloadError('Daily forecast must include at least one day')
  }

  return arrays.dates.map((date, index) => ({
    date: asString(date, `daily.time[${index}]`),
    weatherCode: asNumber(arrays.codes[index], `daily.weather_code[${index}]`),
    highC: roundOne(
      asNumber(arrays.highs[index], `daily.temperature_2m_max[${index}]`),
    ),
    lowC: roundOne(
      asNumber(arrays.lows[index], `daily.temperature_2m_min[${index}]`),
    ),
    precipitationProbability: asNumber(
      arrays.precipitation[index],
      `daily.precipitation_probability_max[${index}]`,
    ),
    sunrise: asString(arrays.sunrises[index], `daily.sunrise[${index}]`),
    sunset: asString(arrays.sunsets[index], `daily.sunset[${index}]`),
  }))
}

export function parseForecastResponse(
  raw: unknown,
  location: LocationChoice,
): WeatherSnapshot {
  const root = asRecord(raw, 'forecast response')
  const current = asRecord(root.current, 'current')

  return {
    location,
    observedAt: asString(current.time, 'current.time'),
    temperatureC: roundOne(
      asNumber(current.temperature_2m, 'current.temperature_2m'),
    ),
    apparentTemperatureC: roundOne(
      asNumber(current.apparent_temperature, 'current.apparent_temperature'),
    ),
    pressureHpa: roundOne(
      asNumber(current.surface_pressure, 'current.surface_pressure'),
    ),
    windSpeedKph: roundOne(
      asNumber(current.wind_speed_10m, 'current.wind_speed_10m'),
    ),
    windDirectionDegrees: asNumber(
      current.wind_direction_10m,
      'current.wind_direction_10m',
    ),
    humidityPercent: asNumber(
      current.relative_humidity_2m,
      'current.relative_humidity_2m',
    ),
    weatherCode: asNumber(current.weather_code, 'current.weather_code'),
    daily: parseDaily(root.daily),
    source: 'live',
  }
}

export function temperatureFor(valueC: number, units: UnitSystem): number {
  return roundOne(units === 'imperial' ? (valueC * 9) / 5 + 32 : valueC)
}

export function windSpeedFor(kph: number, units: UnitSystem): number {
  return roundOne(units === 'imperial' ? kph * 0.621371 : kph)
}

const WEATHER_CONDITIONS: Record<number, { label: string; symbol: string }> = {
  0: { label: 'Clear sky', symbol: '☀' },
  1: { label: 'Mainly clear', symbol: '◒' },
  2: { label: 'Partly cloudy', symbol: '◑' },
  3: { label: 'Overcast', symbol: '☁' },
  45: { label: 'Fog', symbol: '≋' },
  48: { label: 'Rime fog', symbol: '≋' },
  51: { label: 'Light drizzle', symbol: '⋰' },
  53: { label: 'Drizzle', symbol: '⋰' },
  55: { label: 'Heavy drizzle', symbol: '⋰' },
  61: { label: 'Light rain', symbol: '☂' },
  63: { label: 'Rain', symbol: '☂' },
  65: { label: 'Heavy rain', symbol: '☂' },
  71: { label: 'Light snow', symbol: '❄' },
  73: { label: 'Snow', symbol: '❄' },
  75: { label: 'Heavy snow', symbol: '❄' },
  80: { label: 'Rain showers', symbol: '☔' },
  81: { label: 'Rain showers', symbol: '☔' },
  82: { label: 'Heavy rain showers', symbol: '☔' },
  95: { label: 'Thunderstorm', symbol: 'ϟ' },
  96: { label: 'Thunderstorm with hail', symbol: 'ϟ' },
  99: { label: 'Severe thunderstorm with hail', symbol: 'ϟ' },
}

export function weatherConditionFor(code: number): {
  label: string
  symbol: string
} {
  return WEATHER_CONDITIONS[code] ?? {
    label: 'Unknown conditions',
    symbol: '?',
  }
}
