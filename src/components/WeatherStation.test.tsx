import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FALLBACK_WEATHER } from '../weather/fallback'
import type { WeatherStationController } from '../weather/useWeatherStation'
import { useWeatherStation } from '../weather/useWeatherStation'
import { WeatherStation } from './WeatherStation'

vi.mock('../weather/useWeatherStation', () => ({
  useWeatherStation: vi.fn(),
}))

const actions = {
  refresh: vi.fn(async () => undefined),
  selectLocation: vi.fn(async () => undefined),
  search: vi.fn(async () => undefined),
  selectDay: vi.fn(),
  setUnits: vi.fn(),
  forceFallback: vi.fn(),
}

function controller(
  overrides: Partial<WeatherStationController['state']> = {},
): WeatherStationController {
  return {
    state: {
      snapshot: FALLBACK_WEATHER,
      units: 'metric',
      loadState: 'fallback',
      message: 'Bundled demonstration data ready',
      selectedDay: FALLBACK_WEATHER.daily[0].date,
      searchResults: [],
      searchState: 'idle',
      ...overrides,
    },
    ...actions,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useWeatherStation).mockReturnValue(controller())
})

describe('WeatherStation', () => {
  it('renders a named semantic console with labeled readings and controls', () => {
    render(<WeatherStation />)

    expect(
      screen.getByRole('main', { name: 'Atmospheric instrument console' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Bundled demonstration data ready',
    )
    expect(screen.getByRole('heading', { name: /Nairobi/ })).toBeInTheDocument()
    expect(screen.getByText('Temperature')).toBeInTheDocument()
    expect(screen.getByText('Pressure')).toBeInTheDocument()
    expect(screen.getByText('Wind')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Metric' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Imperial' })).not.toBeChecked()
    expect(screen.getByRole('button', { name: 'Refresh weather' })).toBeEnabled()
    expect(
      screen.getByRole('button', { name: 'Use demonstration data' }),
    ).toBeEnabled()
  })

  it('marks the console busy and disables refresh while loading', () => {
    vi.mocked(useWeatherStation).mockReturnValue(
      controller({ loadState: 'loading', message: 'Loading live weather…' }),
    )

    render(<WeatherStation />)

    expect(
      screen.getByRole('main', { name: 'Atmospheric instrument console' }),
    ).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('button', { name: 'Refresh weather' })).toBeDisabled()
  })

  it('presents refresh errors through the status region without hiding readings', () => {
    vi.mocked(useWeatherStation).mockReturnValue(
      controller({
        loadState: 'error',
        message: 'Refresh failed; showing the last live readings. Retry when ready.',
      }),
    )

    render(<WeatherStation />)

    expect(screen.getByRole('status')).toHaveTextContent('Refresh failed')
    expect(screen.getByText('Temperature')).toBeInTheDocument()
  })
})
