import { test, expect } from '@playwright/test'

test('Render home route', async ({ page }) => {
  await page.goto('/?demo=MiniAppHost')
  const miniapp = page.frameLocator('iframe')
  await expect(miniapp.locator('text=This is the home route')).toBeVisible()
})

test('Navigate to another route', async ({ page }) => {
  await page.goto('/?demo=MiniAppHost')
  const miniapp = page.frameLocator('iframe')
  await miniapp.locator('text=Go to foo').click()
  await expect(miniapp.locator('text=This is the foo route')).toBeVisible()
})

test('Hash segment synchronization', async ({ page }) => {
  await page.goto('/?demo=MiniAppHost')
  const miniapp = page.frameLocator('iframe')
  await miniapp.locator('text=Go to foo').click()
  await expect(page).toHaveURL(/#!\/foo$/)
})

test('Back/forward navigation', async ({ page }) => {
  await page.goto('/?demo=MiniAppHost')
  const miniapp = page.frameLocator('iframe')
  await miniapp.locator('text=Go to foo').click()
  await expect(miniapp.locator('text=This is the foo route')).toBeVisible()
  await page.goBack()
  await expect(miniapp.locator('text=This is the home route')).toBeVisible()
  await page.goForward()
  await expect(miniapp.locator('text=This is the foo route')).toBeVisible()
})

test('Injecting hash upon loading', async ({ page }) => {
  await page.goto('/?demo=MiniAppHost#!/foo')
  const miniapp = page.frameLocator('iframe')
  await expect(miniapp.locator('text=This is the foo route')).toBeVisible()
})

test('Can get locale from miniapp host', async ({ page }) => {
  await page.goto('/?demo=MiniAppHost')
  const miniapp = page.frameLocator('iframe')
  await expect(miniapp.locator('text=locale is en')).toBeVisible()
})
