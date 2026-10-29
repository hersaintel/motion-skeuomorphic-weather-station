import { http, HttpResponse } from 'msw'

export const forecastFixture = {
  current: {
    time: '2026-10-29T09:00',
    temperature_2m: 21.2,
    apparent_temperature: 20.8,
    surface_pressure: 848.6,
    wind_speed_10m: 12.3,
    wind_direction_10m: 76,
    relative_humidity_2m: 63,
    weather_code: 2,
  },
  daily: {
    time: ['2026-10-29'],
    weather_code: [2],
    temperature_2m_max: [24.8],
    temperature_2m_min: [14.3],
    precipitation_probability_max: [12],
    sunrise: ['2026-10-29T06:12'],
    sunset: ['2026-10-29T18:24'],
  },
}

export const handlers = [
  http.get('https://api.open-meteo.com/v1/forecast', () =>
    HttpResponse.json(forecastFixture),
  ),
  http.get('https://geocoding-api.open-meteo.com/v1/search', () =>
    HttpResponse.json({
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
    }),
  ),
]
