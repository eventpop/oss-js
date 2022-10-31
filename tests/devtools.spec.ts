import { test, expect } from '@playwright/test'

test('Can show devtools UI', async ({ page }) => {
  await page.goto('/?demo=DevtoolsUi')
  await page.getByText('Enable devtools').check()
  await page.getByTestId('Developer tools button').click()
  await page.getByText('Turn off devtools').click()
  await expect(page.getByText('Enable devtools')).not.toBeChecked()
})
