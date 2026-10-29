import { motion, useReducedMotion } from 'motion/react'

interface InstrumentGaugeProps {
  label: string
  value: number
  min: number
  max: number
  unit: string
  formatValue?: (value: number) => string
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export function InstrumentGauge({
  label,
  value,
  min,
  max,
  unit,
  formatValue = (reading) => String(reading),
}: InstrumentGaugeProps) {
  const reducedMotion = useReducedMotion()
  const visualValue = clamp(value, min, max)
  const progress = max === min ? 0 : (visualValue - min) / (max - min)
  const rotation = Math.round(-90 + progress * 180)
  const display = `${formatValue(value)} ${unit}`

  return (
    <section
      className="instrument-gauge"
      role="meter"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={visualValue}
      aria-valuetext={display}
      data-motion={reducedMotion ? 'reduced' : 'full'}
    >
      <p className="instrument-gauge__label">{label}</p>
      <svg viewBox="0 0 160 104" role="presentation" aria-hidden="true">
        <path className="instrument-gauge__scale" d="M 24 84 A 58 58 0 0 1 136 84" />
        <circle className="instrument-gauge__hub" cx="80" cy="84" r="9" />
        <motion.g
          data-testid="gauge-needle"
          data-rotation={rotation}
          data-transition={reducedMotion ? 'instant' : 'spring'}
          aria-hidden="true"
          initial={false}
          animate={{ rotate: rotation }}
          transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 115, damping: 18 }}
          style={{ transformOrigin: '80px 84px' }}
        >
          <line className="instrument-gauge__needle" x1="80" y1="84" x2="80" y2="32" />
        </motion.g>
      </svg>
      <strong className="instrument-gauge__value">{display}</strong>
    </section>
  )
}
