import { expect, test } from '@playwright/test'

const fixture = {
  current: { time: '2026-10-29T10:00', temperature_2m: 18.7, apparent_temperature: 18.1, surface_pressure: 851.2, wind_speed_10m: 9.4, wind_direction_10m: 80, relative_humidity_2m: 57, weather_code: 1 },
  daily: { time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'], weather_code: [1, 61, 3, 1, 80], temperature_2m_max: [23, 22, 21, 24, 22], temperature_2m_min: [13, 12, 12, 13, 12], precipitation_probability_max: [8, 62, 30, 12, 58], sunrise: ['2026-10-29T06:12', '2026-10-30T06:12', '2026-10-31T06:11', '2026-11-01T06:11', '2026-11-02T06:11'], sunset: ['2026-10-29T18:24', '2026-10-30T18:24', '2026-10-31T18:24', '2026-11-01T18:24', '2026-11-02T18:24'] },
}

const fileNames: Record<string, string> = {
  desktop: 'weatherworks-desktop.png',
  tablet: 'weatherworks-tablet.png',
  'iphone-15': 'weatherworks-iphone-15.png',
}

test('capture deterministic portfolio preview', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.route('**/v1/forecast?**', (route) => route.fulfill({ json: fixture }))
  await page.goto('/')
  await expect(page.getByText('Live link', { exact: true })).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(700)
  await page.screenshot({ path: `docs/images/${fileNames[testInfo.project.name]}`, fullPage: true })
})
