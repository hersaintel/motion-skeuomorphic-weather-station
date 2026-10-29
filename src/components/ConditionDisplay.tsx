import { temperatureFor, weatherConditionFor, windSpeedFor } from '../weather/transform'
import type { UnitSystem, WeatherSnapshot } from '../weather/types'

interface ConditionDisplayProps {
  snapshot: WeatherSnapshot
  units: UnitSystem
}

export function ConditionDisplay({ snapshot, units }: ConditionDisplayProps) {
  const condition = weatherConditionFor(snapshot.weatherCode)
  const temperature = temperatureFor(snapshot.temperatureC, units)
  const feelsLike = temperatureFor(snapshot.apparentTemperatureC, units)
  const wind = windSpeedFor(snapshot.windSpeedKph, units)

  return (
    <section className="condition-display" aria-labelledby="condition-title">
      <div className="condition-display__glass">
        <span className="condition-display__symbol" aria-hidden="true">
          {condition.symbol}
        </span>
        <div>
          <p className="eyebrow">Current conditions</p>
          <h2 id="condition-title">{condition.label}</h2>
          <p>{snapshot.source === 'live' ? 'Live observation' : 'Demonstration reading'}</p>
        </div>
      </div>

      <dl className="reading-grid">
        <div className="reading-card reading-card--primary">
          <dt>Temperature</dt>
          <dd>{temperature}°{units === 'metric' ? 'C' : 'F'}</dd>
          <span>Feels like {feelsLike}°</span>
        </div>
        <div className="reading-card">
          <dt>Pressure</dt>
          <dd>{snapshot.pressureHpa} hPa</dd>
        </div>
        <div className="reading-card">
          <dt>Wind</dt>
          <dd>{wind} {units === 'metric' ? 'km/h' : 'mph'}</dd>
          <span>{snapshot.windDirectionDegrees}° bearing</span>
        </div>
        <div className="reading-card">
          <dt>Humidity</dt>
          <dd>{snapshot.humidityPercent}%</dd>
        </div>
      </dl>
    </section>
  )
}
