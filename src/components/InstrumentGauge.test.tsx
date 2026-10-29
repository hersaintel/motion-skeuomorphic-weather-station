import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useReducedMotion } from 'motion/react'
import { InstrumentGauge } from './InstrumentGauge'

vi.mock('motion/react', async () => {
  const actual = await vi.importActual<typeof import('motion/react')>('motion/react')
  return { ...actual, useReducedMotion: vi.fn() }
})

beforeEach(() => {
  vi.mocked(useReducedMotion).mockReturnValue(false)
})

describe('InstrumentGauge', () => {
  it('exposes its value range and unit without requiring the SVG', () => {
    render(
      <InstrumentGauge
        label="Temperature"
        value={21.4}
        min={-10}
        max={45}
        unit="°C"
      />,
    )

    const meter = screen.getByRole('meter', { name: 'Temperature' })
    expect(meter).toHaveAttribute('aria-valuemin', '-10')
    expect(meter).toHaveAttribute('aria-valuemax', '45')
    expect(meter).toHaveAttribute('aria-valuenow', '21.4')
    expect(meter).toHaveAttribute('aria-valuetext', '21.4 °C')
    expect(screen.getByText('21.4 °C')).toBeInTheDocument()
    expect(screen.getByTestId('gauge-needle')).toHaveAttribute('aria-hidden', 'true')
  })

  it('clamps visual needle travel while displaying the supplied reading', () => {
    render(
      <InstrumentGauge label="Humidity" value={130} min={0} max={100} unit="%" />,
    )

    expect(screen.getByRole('meter', { name: 'Humidity' })).toHaveAttribute(
      'aria-valuenow',
      '100',
    )
    expect(screen.getByText('130 %')).toBeInTheDocument()
    expect(screen.getByTestId('gauge-needle')).toHaveAttribute(
      'data-rotation',
      '90',
    )
  })

  it('uses immediate non-travel updates when reduced motion is requested', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true)

    render(
      <InstrumentGauge label="Wind" value={12} min={0} max={60} unit="km/h" />,
    )

    expect(screen.getByRole('meter', { name: 'Wind' })).toHaveAttribute(
      'data-motion',
      'reduced',
    )
    expect(screen.getByTestId('gauge-needle')).toHaveAttribute(
      'data-transition',
      'instant',
    )
  })
})
