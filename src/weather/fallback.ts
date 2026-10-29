import type { WeatherSnapshot } from './types'

export const FALLBACK_WEATHER: WeatherSnapshot = {
  location: {
    id: 'nairobi-demo',
    name: 'Nairobi',
    admin1: 'Demonstration data',
    country: 'Kenya',
    latitude: -1.2864,
    longitude: 36.8172,
    timezone: 'Africa/Nairobi',
  },
  observedAt: '2026-10-29T09:00',
  temperatureC: 21.4,
  apparentTemperatureC: 20.9,
  pressureHpa: 849.2,
  windSpeedKph: 11.8,
  windDirectionDegrees: 72,
  humidityPercent: 62,
  weatherCode: 2,
  source: 'fallback',
  daily: [
    ['2026-10-29', 2, 24.8, 14.3, 12, '2026-10-29T06:12', '2026-10-29T18:24'],
    ['2026-10-30', 61, 22.2, 13.9, 74, '2026-10-30T06:12', '2026-10-30T18:24'],
    ['2026-10-31', 3, 23.5, 13.4, 28, '2026-10-31T06:11', '2026-10-31T18:24'],
    ['2026-11-01', 1, 25.1, 14.1, 15, '2026-11-01T06:11', '2026-11-01T18:24'],
    ['2026-11-02', 80, 22.8, 13.8, 66, '2026-11-02T06:11', '2026-11-02T18:24'],
  ].map(([date, weatherCode, highC, lowC, precipitationProbability, sunrise, sunset]) => ({
    date: String(date),
    weatherCode: Number(weatherCode),
    highC: Number(highC),
    lowC: Number(lowC),
    precipitationProbability: Number(precipitationProbability),
    sunrise: String(sunrise),
    sunset: String(sunset),
  })),
}
