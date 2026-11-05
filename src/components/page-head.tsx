import type * as React from 'react'

type Props = {
  title: string
  description: string
}

export const PageHead: React.FC<Props> = ({ title, description }) => {
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
