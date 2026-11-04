import { readFileSync } from 'node:fs'

import { expect, test } from '@playwright/test'

const categoryA = JSON.parse(
  readFileSync(
    new URL('../public/assets/questions/0-category.json', import.meta.url),
    'utf8',
  ),
)
const categoryB = JSON.parse(
  readFileSync(
    new URL('../public/assets/questions/1-category.json', import.meta.url),
    'utf8',
  ),
)
const categoryC = JSON.parse(
  readFileSync(
    new URL('../public/assets/questions/55-category.json', import.meta.url),
    'utf8',
  ),
)
const categoryT = JSON.parse(
  readFileSync(
    new URL('../public/assets/questions/70-category.json', import.meta.url),
    'utf8',
  ),
)

function answers(page) {
  return page
    .getByRole('list', { name: 'Варіанти відповіді' })
    .getByRole('button')
}

test('answers immediately, renders explanations, retries, and restores a direct question link', async ({
  page,
}) => {
  const warnings = []
  page.on('console', (message) => {
    if (message.text().includes('Base UI:')) {
      warnings.push(message.text())
    }
  })
  page.on('pageerror', (error) => {
    warnings.push(error.message)
  })
  await page.goto('./#/categories/0/questions/1')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    categoryA.questions[0].question_text,
  )
  await expect(page.locator('title')).toHaveCount(1)
  await expect(page.locator('meta[name="description"]')).toHaveCount(1)
  await expect(
    page.getByRole('img', { name: /Ілюстрація дорожньої ситуації/ }),
  ).toBeVisible()
  await expect(answers(page).first()).toBeEnabled()
  await answers(page).first().click()
  await expect(page.getByRole('heading', { name: /Не зовсім/ })).toBeVisible()
  await expect(page.getByText(categoryA.questions[0].explanation)).toBeVisible()
  await expect(answers(page).first()).toBeDisabled()
  await page.reload()
  await expect(page.getByRole('heading', { name: /Не зовсім/ })).toBeVisible()
  await page
    .getByRole('button', { name: 'Спробувати ще раз', exact: true })
    .click()
  await expect(answers(page).first()).toBeEnabled()
  await answers(page).nth(categoryA.questions[0].correct_answer).click()
  await expect(
    page.getByRole('heading', { name: 'Правильно! Так тримати.' }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Далі', exact: true }).click()
  await expect(page).toHaveURL(/questions\/2$/)
  await page.getByRole('link', { name: 'Усі теми', exact: true }).click()
  await page
    .getByRole('link', { name: 'Продовжити: Загальні положення' })
    .click()
  await expect(page).toHaveURL(/questions\/2$/)
  await page.goto('./#/categories/0/questions/9')
  await answers(page).first().click()
  await expect(
    page
      .getByRole('status', { name: 'Результат і пояснення' })
      .locator('strong'),
  ).toHaveText('пішохід')
  expect(warnings).toEqual([])
})

test('jumps to a question, advances to the next category, and handles missing explanations', async ({
  page,
}) => {
  await page.goto('./#/categories/0/questions/1')
  await page
    .getByLabel('До питання', { exact: true })
    .fill(String(categoryA.questions.length))
  await page
    .getByRole('button', { name: 'Перейти до питання', exact: true })
    .click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    categoryA.questions.at(-1).question_text,
  )
  await answers(page).first().click()
  await expect(
    page.getByRole('status', { name: 'Результат і пояснення' }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Наступна категорія' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    categoryB.questions[0].question_text,
  )

  await page.goto(
    `./#/categories/55/questions/${String(categoryC.questions[0].id)}`,
  )
  await answers(page).first().click()
  await expect(
    page.getByText('Пояснення для цього питання поки відсутнє.'),
  ).toBeVisible()

  await page.goto(
    `./#/categories/70/questions/${String(categoryT.questions.at(-1).id)}`,
  )
  await answers(page).first().click()
  await page.getByRole('link', { name: 'До списку тем', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Вивчай правила.',
  )
})

test('confirms category and global resets without clearing unrelated browser data', async ({
  page,
}) => {
  await page.goto('./#/categories/0/questions/1')
  await page.evaluate(() => {
    localStorage.setItem('unrelated', 'preserve')
  })
  await answers(page).first().click()
  await page.goto('./#/categories/1/questions/608')
  await answers(page).first().click()
  await page.goto('./#/categories/0/questions/1')
  await page
    .getByRole('button', { name: 'Скинути прогрес теми', exact: true })
    .click()
  await page.getByRole('button', { name: 'Залишити прогрес' }).click()
  await expect(answers(page).first()).toBeDisabled()
  await page
    .getByRole('button', { name: 'Скинути прогрес теми', exact: true })
    .click()
  await page.getByRole('button', { name: 'Так, скинути' }).click()
  await expect(answers(page).first()).toBeEnabled()
  await page.goto('./#/categories/1/questions/608')
  await expect(answers(page).first()).toBeDisabled()
  await page.getByRole('link', { name: 'Усі теми', exact: true }).click()
  await page
    .getByRole('button', { name: 'Скинути весь прогрес', exact: true })
    .click()
  await page.getByRole('button', { name: 'Так, скинути' }).click()
  await page.goto('./#/categories/1/questions/608')
  await expect(answers(page).first()).toBeEnabled()
  expect(await page.evaluate(() => localStorage.getItem('unrelated'))).toBe(
    'preserve',
  )
})

test('filters topics and follows the system theme without horizontal page overflow', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('./')
  await expect(page.getByRole('article')).toHaveCount(71)
  await page.getByRole('button', { name: 'Обрати тему', exact: true }).click()
  await expect(page).not.toHaveURL(/#topics/)
  await page
    .getByRole('searchbox', { name: 'Знайти тему' })
    .fill('Європротокол')
  await expect(page.getByRole('article')).toHaveCount(1)
  await page.getByRole('searchbox', { name: 'Знайти тему' }).fill('')
  await page.getByRole('searchbox', { name: 'Знайти тему' }).blur()
  await page.evaluate(() => {
    scrollTo({ top: 0, behavior: 'instant' })
  })
  await page.mouse.move(0, 0)
  await page.screenshot({
    path: testInfo.outputPath('home-light.png'),
    fullPage: false,
  })
  const lightBackground = await page
    .locator('body')
    .evaluate((element) => getComputedStyle(element).backgroundColor)
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('body')).not.toHaveCSS(
    'background-color',
    lightBackground,
  )
  await page.screenshot({
    path: testInfo.outputPath('home-dark.png'),
    fullPage: false,
  })
  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.goto('./#/categories/0/questions/1')
  await answers(page).first().click()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.evaluate(() => {
    scrollTo({ top: 0, behavior: 'instant' })
  })
  await page.screenshot({
    path: testInfo.outputPath('question-mobile-dark.png'),
    fullPage: true,
  })
  await page.setViewportSize({ width: 320, height: 700 })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.setViewportSize({ width: 768, height: 1024 })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})

test('persists explicit themes and resumes following the system when requested', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('./')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.getByRole('combobox', { name: 'Тема оформлення' }).click()
  await page.getByRole('option', { name: 'Темна', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.getByRole('combobox', { name: 'Тема оформлення' }).click()
  await page.getByRole('option', { name: 'Світла', exact: true }).click()
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.getByRole('combobox', { name: 'Тема оформлення' }).click()
  await page.getByRole('option', { name: 'Як у системі', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.evaluate(() => {
    localStorage.setItem('highway-code:theme', '{invalid')
  })
  await page.reload()
  await expect(
    page.getByRole('combobox', { name: 'Тема оформлення' }),
  ).toContainText('Як у системі')
})

test('recovers from a route data failure and shows a missing-question state', async ({
  page,
}) => {
  await page.route('**/0-category.json', (route) => route.abort())
  await page.goto('./#/categories/0/questions/1')
  await expect(
    page.getByRole('heading', { name: 'Не вдалося завантажити дані' }),
  ).toBeVisible()
  await page.unroute('**/0-category.json')
  await page
    .getByRole('button', { name: 'Спробувати ще раз', exact: true })
    .click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    categoryA.questions[0].question_text,
  )
  await page.goto('./#/categories/0/questions/99999')
  await expect(
    page.getByRole('heading', { name: 'Такого питання немає' }),
  ).toBeVisible()
})

test('keeps the quiz usable when localStorage is unavailable', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Blocked', 'SecurityError')
      },
    })
  })
  await page.goto('./#/categories/0/questions/1')
  await expect(
    page.getByText(/Не вдалося зберегти прогрес у браузері/),
  ).toBeVisible()
  await answers(page).nth(categoryA.questions[0].correct_answer).click()
  await expect(
    page.getByRole('heading', { name: 'Правильно! Так тримати.' }),
  ).toBeVisible()
})
