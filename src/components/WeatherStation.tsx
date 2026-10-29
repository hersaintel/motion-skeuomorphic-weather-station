import { ConditionDisplay } from './ConditionDisplay'
import { StationControls } from './StationControls'
import { useWeatherStation } from '../weather/useWeatherStation'
import { motion, useReducedMotion } from 'motion/react'
import { ForecastTray } from './ForecastTray'
import { LocationSearch } from './LocationSearch'

export function WeatherStation() {
  const {
    state,
    refresh,
    setUnits,
    forceFallback,
    search,
    selectLocation,
    selectDay,
  } = useWeatherStation()
  const loading = state.loadState === 'loading'
  const reducedMotion = useReducedMotion()

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
        <div className="station-header__tools">
          <div className={`source-lamp source-lamp--${state.loadState}`}>
            <span aria-hidden="true" />
            {state.snapshot.source === 'live' ? 'Live link' : 'Fallback link'}
          </div>
          <LocationSearch
            results={state.searchResults}
            searchState={state.searchState}
            onSearch={search}
            onSelect={(location) => void selectLocation(location)}
          />
        </div>
      </header>

      <motion.p
        className={`station-status station-status--${state.loadState}`}
        role="status"
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
      >
        {state.message}
      </motion.p>

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

      <ForecastTray
        days={state.snapshot.daily}
        selectedDate={state.selectedDay}
        onSelect={selectDay}
      />

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
