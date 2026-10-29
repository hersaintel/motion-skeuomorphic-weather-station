import type { UnitSystem } from '../weather/types'
import { motion } from 'motion/react'

interface StationControlsProps {
  units: UnitSystem
  loading: boolean
  onUnitsChange(units: UnitSystem): void
  onRefresh(): void
  onFallback(): void
}

export function StationControls({
  units,
  loading,
  onUnitsChange,
  onRefresh,
  onFallback,
}: StationControlsProps) {
  return (
    <section className="station-controls" aria-label="Station controls">
      <fieldset className="unit-selector">
        <legend>Measurement units</legend>
        <label>
          <input
            type="radio"
            name="units"
            value="metric"
            checked={units === 'metric'}
            onChange={() => onUnitsChange('metric')}
          />
          <span>Metric</span>
        </label>
        <label>
          <input
            type="radio"
            name="units"
            value="imperial"
            checked={units === 'imperial'}
            onChange={() => onUnitsChange('imperial')}
          />
          <span>Imperial</span>
        </label>
      </fieldset>

      <div className="station-controls__actions">
        <motion.button
          type="button"
          aria-label="Refresh weather"
          disabled={loading}
          onClick={onRefresh}
          whileHover={loading ? undefined : { y: -1 }}
          whileTap={loading ? undefined : { y: 2, scale: 0.98 }}
        >
          {loading ? 'Refreshing…' : 'Refresh weather'}
        </motion.button>
        <motion.button
          type="button"
          className="secondary-control"
          onClick={onFallback}
          whileHover={{ y: -1 }}
          whileTap={{ y: 2, scale: 0.98 }}
        >
          Use demonstration data
        </motion.button>
      </div>
    </section>
  )
}
