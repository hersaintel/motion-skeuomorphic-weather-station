export type UnitSystem = 'metric' | 'imperial'

export type WeatherSource = 'fallback' | 'live'

export interface LocationChoice {
  id: string
  name: string
  admin1?: string
  country: string
  latitude: number
  longitude: number
  timezone: string
}

export interface DailyForecast {
  date: string
  weatherCode: number
  highC: number
  lowC: number
  precipitationProbability: number
  sunrise: string
  sunset: string
}

export interface WeatherSnapshot {
  location: LocationChoice
  observedAt: string
  temperatureC: number
  apparentTemperatureC: number
  pressureHpa: number
  windSpeedKph: number
  windDirectionDegrees: number
  humidityPercent: number
  weatherCode: number
  daily: DailyForecast[]
  source: WeatherSource
}
