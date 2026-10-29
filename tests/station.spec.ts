import { expect, test } from '@playwright/test'

const liveForecast = {
  current: { time: '2026-10-29T10:00', temperature_2m: 18.7, apparent_temperature: 18.1, surface_pressure: 851.2, wind_speed_10m: 9.4, wind_direction_10m: 80, relative_humidity_2m: 57, weather_code: 1 },
  daily: { time: ['2026-10-29'], weather_code: [1], temperature_2m_max: [23], temperature_2m_min: [13], precipitation_probability_max: [8], sunrise: ['2026-10-29T06:12'], sunset: ['2026-10-29T18:24'] },
}

test('bundled reading is replaced by deterministic live weather', async ({ page }) => {
  await page.route('**/v1/forecast?**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await route.fulfill({ json: liveForecast })
  })
  await page.goto('/')
  await expect(page.getByText('21.4 °C', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Live link', { exact: true })).toBeVisible()
  await expect(page.getByText('18.7 °C', { exact: true }).first()).toBeVisible()
})

test('initial failure keeps bundled data available', async ({ page }) => {
  await page.route('**/v1/forecast?**', (route) => route.abort())
  await page.goto('/')
  await expect(page.getByText('Fallback link')).toBeVisible()
  await expect(page.getByText('21.4 °C', { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('status')).toContainText(/demonstration|fallback|live weather unavailable/i)
})

test('refresh failure preserves the latest live reading', async ({ page }) => {
  let requests = 0
  await page.route('**/v1/forecast?**', (route) => {
    requests += 1
    return requests === 1 ? route.fulfill({ json: liveForecast }) : route.abort()
  })
  await page.goto('/')
  await expect(page.getByText('18.7 °C', { exact: true }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Refresh weather' }).click()
  await expect(page.getByRole('status')).toContainText(/refresh failed|last live/i)
  await expect(page.getByText('18.7 °C', { exact: true }).first()).toBeVisible()
})
