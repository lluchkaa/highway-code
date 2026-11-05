import { expect, test } from '@playwright/test'

function answers(page) {
  return page
    .getByRole('list', { name: 'Варіанти відповіді' })
    .getByRole('button')
}

function session(page) {
  return page.evaluate(
    () =>
      JSON.parse(sessionStorage.getItem('highway-code:random-practice')).state
        .session,
  )
}

function questionNavigation(page) {
  return page.getByRole('navigation', {
    name: 'Перехід між питаннями',
    exact: true,
  })
}

test('draws from selected groups, saves answers and position, resumes, and restarts with the current selection', async ({
  page,
}) => {
  const errors = []
  page.on('pageerror', (error) => {
    errors.push(error.message)
  })
  page.on('console', (message) => {
    if (message.text().includes('Base UI:')) {
      errors.push(message.text())
    }
  })
  await page.goto('./')
  await page
    .getByRole('checkbox', { name: 'Категорія BE', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Почати 20 питань', exact: true })
    .click()
  await expect(page).toHaveURL(/#\/practice\?question=1$/)
  await expect(questionNavigation(page).getByRole('link')).toHaveCount(20)
  const initial = await session(page)
  expect(initial.items).toHaveLength(20)
  expect(new Set(initial.items.map((item) => item.question.id)).size).toBe(20)
  expect(new Set(initial.items.map((item) => item.summary.group))).toEqual(
    new Set(['general', 'B', 'E']),
  )
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    initial.items[0].question.question_text,
  )
  const first = initial.items[0].question
  await answers(page)
    .nth((first.correct_answer + 1) % first.options.length)
    .click()
  await expect(
    page.getByRole('status', { name: 'Результат і пояснення' }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Спробувати ще раз', exact: true })
    .click()
  await answers(page).nth(first.correct_answer).click()
  await expect(
    page.getByRole('heading', { name: 'Правильно! Так тримати.' }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Далі', exact: true }).click()
  await questionNavigation(page).getByRole('link').nth(7).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    initial.items[7].question.question_text,
  )
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    initial.items[7].question.question_text,
  )
  expect((await session(page)).position).toBe(7)
  expect((await session(page)).items[0].answer.correct).toBe(true)
  expect(
    await page.evaluate(() =>
      localStorage.getItem('highway-code:random-practice'),
    ),
  ).toBeNull()
  expect(
    await page.evaluate(
      () =>
        JSON.parse(
          localStorage.getItem('highway-code:progress') ??
            '{"state":{"answers":{}}}',
        ).state.answers,
    ),
  ).toEqual({})

  await page.getByRole('link', { name: 'Усі теми', exact: true }).click()
  await page
    .getByRole('checkbox', { name: 'Категорія BE', exact: true })
    .click()
  await page.getByRole('checkbox', { name: 'Категорія A', exact: true }).click()
  await page.getByRole('link', { name: 'Продовжити тест', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    initial.items[7].question.question_text,
  )
  expect((await session(page)).id).toBe(initial.id)
  await questionNavigation(page).getByRole('link').first().click()
  await expect(answers(page).first()).toBeDisabled()
  await page
    .getByRole('button', { name: 'Нові 20 питань', exact: true })
    .click()
  await expect(page).toHaveURL(/#\/practice\?question=1$/)
  await expect(answers(page).first()).toBeEnabled()
  const restarted = await session(page)
  expect(restarted.id).not.toBe(initial.id)
  expect(restarted.items.map((item) => item.question.id)).not.toEqual(
    initial.items.map((item) => item.question.id),
  )
  expect(restarted.licences).toEqual(['A'])
  expect(new Set(restarted.items.map((item) => item.summary.group))).toEqual(
    new Set(['general', 'A']),
  )
  expect(restarted.items.every((item) => item.answer === null)).toBe(true)
  expect(errors).toEqual([])
})

test('finishes all 20 questions, restores results, and reviews saved answers', async ({
  page,
  context,
}, testInfo) => {
  await page.goto('./')
  await page
    .getByRole('button', { name: 'Почати 20 питань', exact: true })
    .click()
  await expect(questionNavigation(page).getByRole('link')).toHaveCount(20)
  const initial = await session(page)
  expect(initial.items.every((item) => item.summary.group === 'general')).toBe(
    true,
  )
  for (const [index, item] of initial.items.entries()) {
    const question = item.question
    const option =
      index % 2 === 0
        ? question.correct_answer
        : (question.correct_answer + 1) % question.options.length
    await answers(page).nth(option).click()
    await page
      .getByRole('navigation', { name: 'Навігація питання', exact: true })
      .getByRole('link')
      .last()
      .click()
  }
  await expect(
    page.getByRole('heading', { level: 1, name: 'Твій результат' }),
  ).toBeVisible()
  await expect(page.getByText('10 із 20', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('list', { name: 'Результати тесту' }).getByRole('link'),
  ).toHaveCount(20)
  await page.reload()
  await expect(
    page.getByRole('heading', { level: 1, name: 'Твій результат' }),
  ).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('random-results.png') })
  await page.getByRole('link', { name: 'Усі теми', exact: true }).click()
  await page
    .getByRole('link', { name: 'Переглянути результат', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { level: 1, name: 'Твій результат' }),
  ).toBeVisible()
  await page
    .getByRole('list', { name: 'Результати тесту' })
    .getByRole('link')
    .first()
    .click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    initial.items[0].question.question_text,
  )
  await expect(answers(page).first()).toBeDisabled()

  const separateTab = await context.newPage()
  await separateTab.goto('./#/practice')
  await expect(
    separateTab.getByRole('heading', {
      name: 'Немає активного тесту',
      exact: true,
    }),
  ).toBeVisible()
  await separateTab.close()
  expect((await session(page)).id).toBe(initial.id)
})

test('keeps an existing session after a failed restart and can retry with a new set', async ({
  page,
}) => {
  await page.goto('./')
  await page
    .getByRole('button', { name: 'Почати 20 питань', exact: true })
    .click()
  await expect(questionNavigation(page).getByRole('link')).toHaveCount(20)
  const initial = await session(page)
  await page.getByRole('link', { name: 'Усі теми', exact: true }).click()
  await page.getByRole('checkbox', { name: 'Категорія T', exact: true }).click()
  await page.route('**/*-category.json', (route) => route.abort())
  await page
    .getByRole('button', { name: 'Нові 20 питань', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Не вдалося завантажити дані' }),
  ).toBeVisible()
  expect((await session(page)).id).toBe(initial.id)
  await page.unroute('**/*-category.json')
  await page.getByRole('link', { name: 'До списку тем', exact: true }).click()
  await page.getByRole('link', { name: 'Продовжити тест', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    initial.items[0].question.question_text,
  )
  await page
    .getByRole('button', { name: 'Нові 20 питань', exact: true })
    .click()
  await expect(questionNavigation(page).getByRole('link')).toHaveCount(20)
  await expect.poll(async () => (await session(page)).id).not.toBe(initial.id)
  expect(
    new Set((await session(page)).items.map((item) => item.summary.group)),
  ).toEqual(new Set(['general', 'T']))
})

test('supports unanswered review and responsive layouts with every licence selected', async ({
  page,
}, testInfo) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Обрати всі', exact: true }).click()
  await page.setViewportSize({ width: 320, height: 800 })
  await page
    .getByRole('button', { name: 'Почати 20 питань', exact: true })
    .click()
  await expect(questionNavigation(page).getByRole('link')).toHaveCount(20)
  const initial = await session(page)
  expect(new Set(initial.items.map((item) => item.summary.group))).toEqual(
    new Set(['general', 'A', 'B', 'C', 'D', 'E', 'T']),
  )
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await page.screenshot({
      path: testInfo.outputPath(`random-question-${String(width)}.png`),
    })
  }
  await questionNavigation(page).getByRole('link').last().click()
  await page.getByRole('link', { name: 'Підсумок', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Твій результат', exact: true }),
  ).toBeVisible()
  await expect(page.getByText(/Без відповіді: 20/)).toBeVisible()
  await page
    .getByRole('list', { name: 'Результати тесту' })
    .getByRole('link')
    .nth(5)
    .click()
  await expect(answers(page).first()).toBeEnabled()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    initial.items[5].question.question_text,
  )
})

test('recovers from corrupt session data and keeps practice usable without session storage', async ({
  page,
}) => {
  await page.goto('./#/practice')
  await page.evaluate(() => {
    sessionStorage.setItem('highway-code:random-practice', '{broken')
  })
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Немає активного тесту', exact: true }),
  ).toBeVisible()
  await expect(page.getByText(/Збережений тест пошкоджено/)).toBeVisible()
  await page
    .getByRole('button', { name: 'Почати 20 питань', exact: true })
    .click()
  await expect(questionNavigation(page).getByRole('link')).toHaveCount(20)
  await expect(page.getByText(/Збережений тест пошкоджено/)).toHaveCount(0)

  await page.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', {
      get() {
        throw new DOMException('Blocked', 'SecurityError')
      },
    })
  })
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Немає активного тесту', exact: true }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Почати 20 питань', exact: true })
    .click()
  await expect(questionNavigation(page).getByRole('link')).toHaveCount(20)
  await expect(
    page.getByText(/Не вдалося зберегти тест у вкладці/),
  ).toBeVisible()
  await answers(page).first().click()
  await expect(answers(page).first()).toBeDisabled()
  await page.getByRole('link', { name: 'Усі теми', exact: true }).click()
  await page.getByRole('link', { name: 'Продовжити тест', exact: true }).click()
  await expect(answers(page).first()).toBeDisabled()
})
