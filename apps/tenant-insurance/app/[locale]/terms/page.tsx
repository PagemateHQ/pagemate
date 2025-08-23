import {getTranslations} from 'next-intl/server'

export default async function TermsPage() {
  const t = await getTranslations()
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <h1>{t('Legal.termsTitle')}</h1>
      <p>{t('Legal.termsBody')}</p>
    </div>
  )
}

