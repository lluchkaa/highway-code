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

for (const viewport of [
  { width: 390, height: 844 },
  { width: 1280, height: 720 },
]) {
  test(`question actions float and return to their place at ${String(viewport.width)}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport)
    await page.goto('./#/categories/0/questions/1')
    const navigation = page.getByRole('navigation', {
      name: 'Навігація питання',
      exact: true,
    })
    await expect(navigation.getByRole('link')).toHaveCount(2)
    await expect
      .poll(async () => {
        const box = await navigation.boundingBox()
        return box ? Math.round(box.y + box.height) : null
      })
      .toBe(viewport.height - 12)
    expect(
      await navigation.evaluate((element) => {
        const links = element.querySelectorAll('a')
        const back = links[0]?.getBoundingClientRect()
        const next = links[1]?.getBoundingClientRect()
        const bounds = element.getBoundingClientRect()
        return Boolean(
          back &&
          next &&
          !element.contains(
            document.elementFromPoint(
              (back.right + next.left) / 2,
              bounds.top + bounds.height / 2,
            ),
          ),
        )
      }),
    ).toBe(true)
    await page.screenshot({ path: testInfo.outputPath('actions-floating.png') })

    await answers(page).first().click()
    await expect(
      page.getByRole('status', { name: 'Результат і пояснення' }),
    ).toBeVisible()
    await page.evaluate(() => {
      scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'instant',
      })
    })
    await expect
      .poll(() =>
        navigation.evaluate((element) => {
          const parent = element.parentElement
          if (!parent) {
            return null
          }
          const style = getComputedStyle(parent)
          return Math.round(
            parent.getBoundingClientRect().bottom -
              Number.parseFloat(style.paddingBottom) -
              Number.parseFloat(style.borderBottomWidth) -
              element.getBoundingClientRect().bottom,
          )
        }),
      )
      .toBe(0)
    const docked = await navigation.boundingBox()
    expect(docked).not.toBeNull()
    expect(docked.y + docked.height).toBeLessThan(viewport.height - 30)
    await page.screenshot({ path: testInfo.outputPath('actions-in-place.png') })

    await page.evaluate(() => {
      scrollTo({ top: 0, behavior: 'instant' })
    })
    await expect
      .poll(async () => {
        const box = await navigation.boundingBox()
        return box ? Math.round(box.y + box.height) : null
      })
      .toBe(viewport.height - 12)
    await navigation.getByRole('link', { name: 'Далі', exact: true }).click()
    await expect(page).toHaveURL(/questions\/2$/)
    await page
      .getByRole('navigation', { name: 'Навігація питання', exact: true })
      .getByRole('link', { name: 'Назад', exact: true })
      .click()
    await expect(page).toHaveURL(/questions\/1$/)
  })
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

test('uses the question bar, advances to the next category, and handles missing explanations', async ({
  page,
}) => {
  await page.goto('./#/categories/0/questions/1')
  await expect(page.getByRole('spinbutton')).toHaveCount(0)
  await page
    .getByRole('navigation', { name: 'Перехід між питаннями', exact: true })
    .getByRole('link', {
      name: `Питання ${String(categoryA.questions.length)}: без відповіді`,
      exact: true,
    })
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
  await expect(page.getByRole('article')).toHaveCount(47)
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

test('selects multiple licences, deduplicates shared topics, and remembers the choice', async ({
  page,
}, testInfo) => {
  await page.goto('./')
  const selector = page.getByRole('region', { name: 'Які категорії вивчаєш?' })
  const licence = (value) =>
    selector.getByRole('button', { name: `Категорія ${value}`, exact: true })
  await expect(
    selector.getByRole('button', { name: /^Категорія / }),
  ).toHaveCount(14)
  await expect(page.getByRole('article')).toHaveCount(47)

  await licence('B').focus()
  await page.keyboard.press('Space')
  await expect(licence('B')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('article')).toHaveCount(51)
  await expect(
    page.getByRole('region', { name: 'Категорії B1, B', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('region', { name: 'Категорії A1, A', exact: true }),
  ).toHaveCount(0)

  await licence('A1').click()
  await licence('A').click()
  await expect(page.getByRole('article')).toHaveCount(55)
  await licence('BE').click()
  await expect(page.getByRole('article')).toHaveCount(59)
  await page.reload()
  for (const value of ['A1', 'A', 'B', 'BE']) {
    await expect(licence(value)).toHaveAttribute('aria-pressed', 'true')
  }
  await expect(page.getByRole('article')).toHaveCount(59)
  await licence('B').click()
  await expect(page.getByRole('article')).toHaveCount(59)
  await licence('BE').click()
  await expect(page.getByRole('article')).toHaveCount(51)

  await selector
    .getByRole('button', { name: 'Обрати всі', exact: true })
    .click()
  await expect(page.getByRole('article')).toHaveCount(71)
  await selector
    .getByRole('button', { name: 'Скинути вибір', exact: true })
    .click()
  await expect(page.getByRole('article')).toHaveCount(47)
  await page
    .getByRole('button', { name: 'Додаткові категорії', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Такої теми не знайшли' }),
  ).toBeVisible()
  await licence('B1').click()
  await expect(page.getByRole('article')).toHaveCount(4)
  await page
    .getByRole('searchbox', { name: 'Знайти тему' })
    .fill('неіснуюча тема')
  await page
    .getByRole('button', { name: 'Скинути пошук і фільтр', exact: true })
    .click()
  await expect(page.getByRole('article')).toHaveCount(51)
  await expect(licence('B1')).toHaveAttribute('aria-pressed', 'true')

  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    await selector.scrollIntoViewIfNeeded()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await page.screenshot({
      path: testInfo.outputPath(`licences-${String(width)}.png`),
    })
  }
})

test('matches every licence family and includes base topics for trailer licences', async ({
  page,
}) => {
  await page.goto('./')
  const selector = page.getByRole('region', { name: 'Які категорії вивчаєш?' })
  const families = [
    { licences: ['A1', 'A'], sections: ['Категорії A1, A'] },
    { licences: ['B1', 'B'], sections: ['Категорії B1, B'] },
    { licences: ['C1', 'C'], sections: ['Категорії C1, C'] },
    { licences: ['D1', 'D'], sections: ['Категорії D1, D'] },
    { licences: ['BE'], sections: ['Категорії B1, B', 'Категорії з причепом'] },
    {
      licences: ['C1E', 'CE'],
      sections: ['Категорії C1, C', 'Категорії з причепом'],
    },
    {
      licences: ['D1E', 'DE'],
      sections: ['Категорії D1, D', 'Категорії з причепом'],
    },
    { licences: ['T'], sections: ['Категорія T'] },
  ]
  for (const family of families) {
    for (const value of family.licences) {
      const toggle = selector.getByRole('button', {
        name: `Категорія ${value}`,
        exact: true,
      })
      await toggle.click()
      await expect(page.getByRole('article')).toHaveCount(
        47 + family.sections.length * 4,
      )
      for (const section of family.sections) {
        await expect(
          page.getByRole('region', { name: section, exact: true }),
        ).toBeVisible()
      }
      await toggle.click()
      await expect(page.getByRole('article')).toHaveCount(47)
    }
  }
})

test('uses selected topics for progress and category transitions without losing other answers', async ({
  page,
}) => {
  const catalog = JSON.parse(
    readFileSync(
      new URL('../public/assets/questions/catalog.json', import.meta.url),
      'utf8',
    ),
  ).categories
  const generalEnd = JSON.parse(
    readFileSync(
      new URL('../public/assets/questions/46-category.json', import.meta.url),
      'utf8',
    ),
  )
  const bEnd = JSON.parse(
    readFileSync(
      new URL('../public/assets/questions/54-category.json', import.meta.url),
      'utf8',
    ),
  )
  await page.goto(
    `./#/categories/55/questions/${String(categoryC.questions[0].id)}`,
  )
  await answers(page).first().click()
  await page.getByRole('link', { name: 'Усі теми', exact: true }).click()
  const overview = page.getByRole('complementary', {
    name: 'Прогрес обраних тем',
  })
  const totalGeneral = catalog
    .filter((category) => category.group === 'general')
    .reduce((sum, category) => sum + category.questionCount, 0)
  await expect(
    overview.getByText(String(totalGeneral), { exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Категорія C', exact: true }).click()
  await expect(overview.getByText('1', { exact: true })).toHaveCount(1)
  await page.getByRole('button', { name: 'Категорія C', exact: true }).click()
  await page.getByRole('button', { name: 'Категорія B', exact: true }).click()

  await page.goto(
    `./#/categories/46/questions/${String(generalEnd.questions.at(-1).id)}`,
  )
  await page
    .getByRole('link', { name: 'Наступна категорія', exact: true })
    .click()
  await expect(page).toHaveURL(
    new RegExp(
      `/categories/51/questions/${String(catalog[51].firstQuestionId)}$`,
    ),
  )
  await page.goto(
    `./#/categories/54/questions/${String(bEnd.questions.at(-1).id)}`,
  )
  await page.getByRole('link', { name: 'До списку тем', exact: true }).click()
  await expect(page.getByRole('article')).toHaveCount(51)

  await page.goto(
    `./#/categories/55/questions/${String(categoryC.questions[0].id)}`,
  )
  await expect(answers(page).first()).toBeDisabled()
  await page
    .getByRole('navigation', { name: 'Перехід між питаннями', exact: true })
    .getByRole('link')
    .last()
    .click()
  await page.getByRole('link', { name: 'До списку тем', exact: true }).click()
  await expect(page.getByRole('article')).toHaveCount(51)
})

test('recovers from malformed licence preferences', async ({ page }) => {
  await page.goto('./')
  for (const value of [
    '{invalid',
    JSON.stringify({ version: 1, state: { licences: ['invalid'] } }),
  ]) {
    await page.evaluate((raw) => {
      localStorage.setItem('highway-code:learning', raw)
    }, value)
    await page.reload()
    await expect(page.getByRole('article')).toHaveCount(47)
    await page.getByRole('button', { name: 'Категорія B', exact: true }).click()
    await expect(page.getByRole('article')).toHaveCount(51)
  }
})

test('persists explicit themes and resumes following the system when requested', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('./')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  const lightBackground = await page
    .locator('body')
    .evaluate((element) => getComputedStyle(element).backgroundColor)
  const lightText = await page
    .locator('body')
    .evaluate((element) => getComputedStyle(element).color)
  const lightCard = await page
    .getByRole('article')
    .first()
    .evaluate((element) => getComputedStyle(element).backgroundColor)
  await page.getByRole('combobox', { name: 'Тема оформлення' }).click()
  await page.getByRole('option', { name: 'Темна', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('body')).not.toHaveCSS(
    'background-color',
    lightBackground,
  )
  await expect(page.locator('body')).not.toHaveCSS('color', lightText)
  await expect(page.getByRole('article').first()).not.toHaveCSS(
    'background-color',
    lightCard,
  )
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('body')).not.toHaveCSS(
    'background-color',
    lightBackground,
  )
  await page.getByRole('combobox', { name: 'Тема оформлення' }).click()
  await page.getByRole('option', { name: 'Світла', exact: true }).click()
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    lightBackground,
  )
  await expect(page.getByRole('article').first()).toHaveCSS(
    'background-color',
    lightCard,
  )
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
  await page.getByRole('link', { name: 'Усі теми', exact: true }).click()
  await page.getByRole('button', { name: 'Категорія B', exact: true }).click()
  await expect(page.getByRole('article')).toHaveCount(51)
  await page.goto('./#/categories/0/questions/1')
  await page.getByRole('link', { name: 'Усі теми', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Категорія B', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
})
