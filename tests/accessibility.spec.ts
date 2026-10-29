import { expect, test } from '@playwright/test'

test('keyboard interaction covers search, forecast, and units', async ({ page }) => {
  await page.route('**/v1/forecast?**', (route) => route.abort())
  await page.route('**/v1/search?**', (route) => route.fulfill({ json: { results: [{ id: 1, name: 'Nairobi', admin1: 'Nairobi County', country: 'Kenya', latitude: -1.2864, longitude: 36.8172, timezone: 'Africa/Nairobi' }] } }))
  await page.goto('/')

  await page.getByRole('button', { name: 'Change location' }).focus()
  await page.keyboard.press('Enter')
  const search = page.getByRole('combobox', { name: 'Search locations' })
  await expect(search).toBeFocused()
  await search.fill('Nai')
  await expect(page.getByRole('option', { name: /Nairobi/ })).toBeVisible()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Change location' })).toBeFocused()

  const forecast = page.getByRole('button', { name: /Oct 30/ })
  await forecast.focus()
  await page.keyboard.press('Enter')
  await expect(forecast).toHaveAttribute('aria-pressed', 'true')

  const imperial = page.getByRole('radio', { name: 'Imperial' })
  await imperial.focus()
  await page.keyboard.press('Space')
  await expect(imperial).toBeChecked()
})

test('reduced motion remains functional', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.route('**/v1/forecast?**', (route) => route.abort())
  await page.goto('/')
  await expect(page.getByRole('main', { name: 'Atmospheric instrument console' })).toBeVisible()
  await page.getByRole('button', { name: /Oct 31/ }).click()
  await expect(page.getByRole('button', { name: /Oct 31/ })).toHaveAttribute('aria-pressed', 'true')
})
