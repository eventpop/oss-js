import { test, expect } from '@playwright/test'

test('Can show technologist', async ({ page }) => {
  await page.goto('/?demo=Technologist')
  await expect(page.getByTestId('Technologist button')).toBeVisible()

  await page.getByText('Enable technologist').uncheck()
  await expect(page.getByTestId('Technologist button')).not.toBeVisible()

  await page.getByText('Enable technologist').check()
  await expect(page.getByTestId('Technologist button')).toBeVisible()

  await page.getByTestId('Technologist button').click()
  await expect(page.getByTestId('Technologist menu')).toBeVisible()

  await page.getByText('Turn off technologist').click()
  await expect(page.getByText('Enable technologist')).not.toBeChecked()
  await expect(page.getByTestId('Technologist button')).not.toBeVisible()
})

test('Supports multiple commands', async ({ page }) => {
  await page.goto('/?demo=Technologist')
  await page.getByTestId('Technologist button').click()
  await page.getByTestId('Technologist command: Add a command').click()
  await page.getByTestId('Technologist button').click()
  await page.getByTestId('Technologist command: Add a command').click()
  await page.getByTestId('Technologist button').click()
  await page.getByTestId('Technologist command: Add a command').click()
  await page.getByTestId('Technologist button').click()
  await page.getByTestId('Technologist command: Add a command').click()
  await page.getByTestId('Technologist button').click()
  await page.getByTestId('Technologist command: Add a command').click()
  await page.getByTestId('Technologist button').click()
  await page.getByTestId('Technologist command: Dynamic command #3').click()
  await page.getByTestId('Technologist button').click()
  await page.getByTestId('Technologist command: Dynamic command #5').click()
  await page.getByTestId('Technologist button').click()
  const texts = await page
    .getByTestId('Technologist menu')
    .locator('button')
    .allInnerTexts()

  expect(texts).toEqual(
    expect.arrayContaining([
      'Dynamic command #1',
      'Dynamic command #2',
      'Dynamic command #4',
    ]),
  )
  expect(texts).not.toContain('Dynamic command #3')
  expect(texts).not.toContain('Dynamic command #5')
})
