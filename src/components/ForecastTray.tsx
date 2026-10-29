import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { weatherConditionFor } from '../weather/transform'
import type { DailyForecast } from '../weather/types'

interface ForecastTrayProps {
  days: DailyForecast[]
  selectedDate: string
  onSelect(date: string): void
}

const dayLabel = (date: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${date}T12:00:00Z`),
  )

export function ForecastTray({ days, selectedDate, onSelect }: ForecastTrayProps) {
  const reducedMotion = useReducedMotion()
  const selected = days.find((day) => day.date === selectedDate) ?? days[0]

  return (
    <section className="forecast-tray" aria-labelledby="forecast-title">
      <div className="forecast-tray__header">
        <p className="eyebrow">Forecast archive</p>
        <h2 id="forecast-title">Seven-day outlook</h2>
      </div>
      <div className="forecast-days">
        {days.map((day) => {
          const active = day.date === selected?.date
          const condition = weatherConditionFor(day.weatherCode)
          return (
            <motion.button
              layout
              key={day.date}
              type="button"
              aria-pressed={active}
              aria-label={`${dayLabel(day.date)} · ${condition.label}`}
              className="forecast-day"
              onClick={() => onSelect(day.date)}
              whileTap={reducedMotion ? undefined : { y: 2, scale: 0.98 }}
            >
              {active && (
                <motion.span
                  className="forecast-day__selection"
                  layoutId="selected-forecast-day"
                  transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 280, damping: 28 }}
                />
              )}
              <span>{dayLabel(day.date)}</span>
              <strong aria-hidden="true">{condition.symbol}</strong>
              <small>{day.highC}° / {day.lowC}°</small>
            </motion.button>
          )
        })}
      </div>
      <AnimatePresence initial={false}>
        {selected && (
          <motion.div
            className="forecast-detail"
            role="region"
            aria-label="Selected forecast details"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          >
            <strong>{dayLabel(selected.date)} forecast</strong>
            <span>{weatherConditionFor(selected.weatherCode).label}</span>
            <span>{selected.precipitationProbability}% chance of precipitation</span>
            <span>Sunrise {selected.sunrise.slice(11)} · Sunset {selected.sunset.slice(11)}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
