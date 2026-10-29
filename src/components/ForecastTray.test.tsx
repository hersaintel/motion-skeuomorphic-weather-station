import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { FALLBACK_WEATHER } from '../weather/fallback'
import { ForecastTray } from './ForecastTray'

function Harness() {
  const [selected, setSelected] = useState(FALLBACK_WEATHER.daily[0].date)
  return (
    <ForecastTray
      days={FALLBACK_WEATHER.daily}
      selectedDate={selected}
      onSelect={setSelected}
      units="metric"
    />
  )
}

describe('ForecastTray', () => {
  it('selects forecast days with buttons and updates visible details', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const secondDay = screen.getByRole('button', { name: /Oct 30/i })
    expect(secondDay).toHaveAttribute('aria-pressed', 'false')

    await user.click(secondDay)

    expect(secondDay).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('region', { name: 'Selected forecast details' })).toHaveTextContent(
      '74% chance of precipitation',
    )
  })

  it('supports keyboard activation without requiring animation', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const thirdDay = screen.getByRole('button', { name: /Oct 31/i })
    thirdDay.focus()
    await user.keyboard('{Enter}')

    expect(thirdDay).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/Oct 31 forecast/i)).toBeInTheDocument()
  })

  it('converts forecast temperatures for imperial units', () => {
    render(
      <ForecastTray
        days={FALLBACK_WEATHER.daily}
        selectedDate={FALLBACK_WEATHER.daily[0].date}
        onSelect={() => undefined}
        units="imperial"
      />,
    )

    expect(screen.getByRole('button', { name: /Oct 29/i })).toHaveTextContent('76.6°F / 57.7°F')
  })
})
