import { expect, test } from '@playwright/test'

test('keeps licence checkboxes and topic filters accessible without clearing the active filter', async ({
  page,
}) => {
  await page.goto('./')
  const licence = page.getByRole('checkbox', {
    name: 'Категорія B',
    exact: true,
  })
  await page.locator('label').filter({ has: licence }).click()
  await expect(licence).toBeChecked()
  await expect(page.getByRole('article')).toHaveCount(51)

  const filters = page.getByRole('group', { name: 'Фільтр тем', exact: true })
  const all = filters.getByRole('button', { name: 'Усі теми', exact: true })
  const general = filters.getByRole('button', {
    name: 'Основні теми',
    exact: true,
  })
  const extra = filters.getByRole('button', {
    name: 'Додаткові категорії',
    exact: true,
  })
  await all.click()
  await expect(all).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('article')).toHaveCount(51)
  await all.focus()
  await page.keyboard.press('ArrowRight')
  await expect(general).toBeFocused()
  await page.keyboard.press('Space')
  await expect(general).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('article')).toHaveCount(47)
  await page.keyboard.press('ArrowRight')
  await expect(extra).toBeFocused()
  await page.keyboard.press('Space')
  await expect(page.getByRole('article')).toHaveCount(4)

  await page
    .getByRole('searchbox', { name: 'Знайти тему' })
    .fill('неможливий-запит')
  await expect(
    page.getByRole('heading', { name: 'Такої теми не знайшли' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Скинути пошук і фільтр' }).click()
  await expect(page.getByRole('article')).toHaveCount(51)
  await expect(licence).toBeChecked()
})

test('gives the random-practice description room on wide screens and fits mobile screens', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('./')
  const card = page.getByRole('region', {
    name: 'Випадкові 20 питань',
    exact: true,
  })
  const description = card.getByText(
    'Основні теми та обрані спеціальні категорії. Без таймера, з поясненнями.',
  )
  const cardBox = await card.boundingBox()
  const descriptionBox = await description.boundingBox()
  expect(cardBox).not.toBeNull()
  expect(descriptionBox).not.toBeNull()
  expect(descriptionBox.width).toBeGreaterThan(cardBox.width * 0.5)
  await card.screenshot({
    path: testInfo.outputPath('random-practice-wide.png'),
  })

  await expect(
    page.getByRole('img', { name: /Відповіді на 0% питань/ }),
  ).toBeVisible()
  await expect(
    page.locator('[data-slot="chart"] .recharts-radial-bar-background-sector'),
  ).toHaveCount(1)
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(description).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  }
})
