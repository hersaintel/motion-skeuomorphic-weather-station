import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the Weatherworks atmospheric instrument console', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Weatherworks' })).toBeInTheDocument()
    expect(
      screen.getByRole('main', { name: 'Atmospheric instrument console' }),
    ).toBeInTheDocument()
  })
})
