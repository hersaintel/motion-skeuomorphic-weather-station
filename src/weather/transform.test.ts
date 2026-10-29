import { describe, expect, it } from 'vitest'
import type { LocationChoice } from './types'
import {
  WeatherPayloadError,
  parseForecastResponse,
  temperatureFor,
  weatherConditionFor,
  windSpeedFor,
} from './transform'

const location: LocationChoice = {
  id: 'nairobi-ke',
  name: 'Nairobi',
  admin1: 'Nairobi County',
  country: 'Kenya',
  latitude: -1.2864,
  longitude: 36.8172,
  timezone: 'Africa/Nairobi',
}

const validPayload = {
  current: {
    time: '2026-10-29T09:00',
    temperature_2m: 21.24,
    apparent_temperature: 20.76,
    surface_pressure: 848.6,
    wind_speed_10m: 12.34,
    wind_direction_10m: 76,
    relative_humidity_2m: 63,
    weather_code: 2,
  },
  daily: {
    time: ['2026-10-29', '2026-10-30'],
    weather_code: [2, 61],
    temperature_2m_max: [24.82, 22.17],
    temperature_2m_min: [14.26, 13.91],
    precipitation_probability_max: [12, 74],
    sunrise: ['2026-10-29T06:12', '2026-10-30T06:12'],
    sunset: ['2026-10-29T18:24', '2026-10-30T18:24'],
  },
}

describe('parseForecastResponse', () => {
  it('normalizes a valid Open-Meteo payload into a live snapshot', () => {
    expect(parseForecastResponse(validPayload, location)).toEqual({
      location,
      observedAt: '2026-10-29T09:00',
      temperatureC: 21.2,
      apparentTemperatureC: 20.8,
      pressureHpa: 848.6,
      windSpeedKph: 12.3,
      windDirectionDegrees: 76,
      humidityPercent: 63,
      weatherCode: 2,
      source: 'live',
      daily: [
        {
          date: '2026-10-29',
          weatherCode: 2,
          highC: 24.8,
          lowC: 14.3,
          precipitationProbability: 12,
          sunrise: '2026-10-29T06:12',
          sunset: '2026-10-29T18:24',
        },
        {
          date: '2026-10-30',
          weatherCode: 61,
          highC: 22.2,
          lowC: 13.9,
          precipitationProbability: 74,
          sunrise: '2026-10-30T06:12',
          sunset: '2026-10-30T18:24',
        },
      ],
    })
  })

  it('rejects a payload without current conditions', () => {
    expect(() =>
      parseForecastResponse({ daily: validPayload.daily }, location),
    ).toThrow(WeatherPayloadError)
  })

  it('rejects daily arrays with different lengths', () => {
    const malformed = {
      ...validPayload,
      daily: {
        ...validPayload.daily,
        weather_code: [2],
      },
    }

    expect(() => parseForecastResponse(malformed, location)).toThrow(
      'Daily forecast arrays must have matching lengths',
    )
  })
})

describe('display transformations', () => {
  it('converts and rounds temperatures for the selected unit system', () => {
    expect(temperatureFor(20, 'metric')).toBe(20)
    expect(temperatureFor(20, 'imperial')).toBe(68)
    expect(temperatureFor(21.24, 'metric')).toBe(21.2)
  })

  it('converts and rounds wind speed for the selected unit system', () => {
    expect(windSpeedFor(10, 'metric')).toBe(10)
    expect(windSpeedFor(10, 'imperial')).toBe(6.2)
  })

  it('provides an explicit fallback for unknown weather codes', () => {
    expect(weatherConditionFor(999)).toEqual({
      label: 'Unknown conditions',
      symbol: '?',
    })
  })
})
