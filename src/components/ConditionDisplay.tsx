import { temperatureFor, weatherConditionFor, windSpeedFor } from '../weather/transform'
import type { UnitSystem, WeatherSnapshot } from '../weather/types'
import { InstrumentGauge } from './InstrumentGauge'

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

      <div className="instrument-cluster" aria-label="Primary instruments">
        <InstrumentGauge
          label="Temperature gauge"
          value={temperature}
          min={units === 'metric' ? -10 : 14}
          max={units === 'metric' ? 45 : 113}
          unit={units === 'metric' ? '°C' : '°F'}
        />
        <InstrumentGauge
          label="Pressure gauge"
          value={snapshot.pressureHpa}
          min={800}
          max={1060}
          unit="hPa"
        />
        <InstrumentGauge
          label="Wind gauge"
          value={wind}
          min={0}
          max={units === 'metric' ? 120 : 75}
          unit={units === 'metric' ? 'km/h' : 'mph'}
        />
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
