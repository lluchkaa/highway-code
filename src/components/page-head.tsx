export function PageHead({
  title,
  description,
}: {
  title: string
  description: string
}) {
  const pageTitle = `${title} · ПДР Практика`
  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="uk_UA" />
    </>
  )
}
