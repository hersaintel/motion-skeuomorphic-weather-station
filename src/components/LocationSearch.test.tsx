import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { LocationChoice } from '../weather/types'
import { LocationSearch } from './LocationSearch'

const results: LocationChoice[] = [
  {
    id: '1',
    name: 'Nairobi',
    admin1: 'Nairobi County',
    country: 'Kenya',
    latitude: -1.2864,
    longitude: 36.8172,
    timezone: 'Africa/Nairobi',
  },
  {
    id: '2',
    name: 'Nakuru',
    country: 'Kenya',
    latitude: -0.3031,
    longitude: 36.08,
    timezone: 'Africa/Nairobi',
  },
]

describe('LocationSearch', () => {
  it('focuses the search input and guides short queries', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn(async () => undefined)
    render(
      <LocationSearch
        results={[]}
        searchState="idle"
        onSearch={onSearch}
        onSelect={vi.fn()}
      />,
    )

    const trigger = screen.getByRole('button', { name: 'Change location' })
    await user.click(trigger)
    expect(screen.getByRole('combobox', { name: 'Search locations' })).toHaveFocus()

    await user.type(screen.getByRole('combobox'), 'na')
    expect(screen.getByRole('status')).toHaveTextContent('Enter at least 3 characters')
  })

  it('navigates results with arrows, selects with Enter, and restores trigger focus', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <LocationSearch
        results={results}
        searchState="ready"
        onSearch={vi.fn(async () => undefined)}
        onSelect={onSelect}
      />,
    )

    const trigger = screen.getByRole('button', { name: 'Change location' })
    await user.click(trigger)
    const input = screen.getByRole('combobox', { name: 'Search locations' })
    await user.type(input, 'Nai')
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}{Enter}')

    expect(onSelect).toHaveBeenCalledWith(results[0])
    expect(trigger).toHaveFocus()
    await waitForElementToBeRemoved(() => screen.queryByRole('combobox'))
  })

  it('closes with Escape and announces empty and error states', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <LocationSearch
        results={[]}
        searchState="empty"
        onSearch={vi.fn(async () => undefined)}
        onSelect={vi.fn()}
      />,
    )

    const trigger = screen.getByRole('button', { name: 'Change location' })
    await user.click(trigger)
    await user.type(screen.getByRole('combobox'), 'Nowhere')
    expect(screen.getByRole('status')).toHaveTextContent('No matching locations')

    rerender(
      <LocationSearch
        results={[]}
        searchState="error"
        onSearch={vi.fn(async () => undefined)}
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Location search failed')

    await user.keyboard('{Escape}')
    expect(trigger).toHaveFocus()
  })
})
