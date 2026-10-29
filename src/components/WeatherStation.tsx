import { ConditionDisplay } from './ConditionDisplay'
import { StationControls } from './StationControls'
import { useWeatherStation } from '../weather/useWeatherStation'

export function WeatherStation() {
  const { state, refresh, setUnits, forceFallback } = useWeatherStation()
  const loading = state.loadState === 'loading'

  return (
    <main
      className="weather-station"
      aria-label="Atmospheric instrument console"
      aria-busy={loading}
      data-source={state.snapshot.source}
    >
      <header className="station-header">
        <div>
          <p className="brand-kicker">Weatherworks · Atmospheric console</p>
          <h1>Weatherworks</h1>
          <h2>{state.snapshot.location.name}</h2>
          <p>
            {[state.snapshot.location.admin1, state.snapshot.location.country]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <div className={`source-lamp source-lamp--${state.loadState}`}>
          <span aria-hidden="true" />
          {state.snapshot.source === 'live' ? 'Live link' : 'Fallback link'}
        </div>
      </header>

      <p className={`station-status station-status--${state.loadState}`} role="status">
        {state.message}
      </p>

      <div className="station-layout">
        <ConditionDisplay snapshot={state.snapshot} units={state.units} />
        <aside className="station-notes" aria-label="Station notes">
          <p className="eyebrow">Instrument log</p>
          <h2>Upper-air desk</h2>
          <p>
            Readings arrive from Open-Meteo when the live link is available. The
            console keeps useful bundled readings visible during network failure.
          </p>
          <dl>
            <div><dt>Observed</dt><dd>{state.snapshot.observedAt}</dd></div>
            <div><dt>Timezone</dt><dd>{state.snapshot.location.timezone}</dd></div>
          </dl>
        </aside>
      </div>

      <StationControls
        units={state.units}
        loading={loading}
        onUnitsChange={setUnits}
        onRefresh={() => void refresh()}
        onFallback={forceFallback}
      />
    </main>
  )
}
