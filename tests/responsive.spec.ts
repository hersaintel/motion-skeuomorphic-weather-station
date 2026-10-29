import { expect, test } from '@playwright/test'

test('console reflows without horizontal overflow and keeps touch targets usable', async ({ page }, testInfo) => {
  await page.route('**/v1/forecast?**', (route) => route.abort())
  await page.goto('/')

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(overflow).toBe(false)

  const refreshBox = await page.getByRole('button', { name: 'Refresh weather' }).boundingBox()
  expect(refreshBox?.height ?? 0).toBeGreaterThanOrEqual(44)

  const columns = await page.locator('.station-layout').evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length)
  if (testInfo.project.name === 'desktop') expect(columns).toBe(2)
  if (testInfo.project.name === 'tablet') expect(columns).toBe(2)
  if (testInfo.project.name === 'iphone-15') expect(columns).toBe(1)
})
