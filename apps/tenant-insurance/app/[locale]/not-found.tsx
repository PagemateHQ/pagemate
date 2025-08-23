import {getTranslations} from 'next-intl/server'
import {Link} from '@/i18n/routing'

export default async function NotFound() {
  const t = await getTranslations()
  return (
    <div className="grid place-items-center py-20 text-center">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">{t('NotFound.title')}</h1>
        <p className="text-muted-foreground">{t('NotFound.desc')}</p>
        <p>
          <Link href="/" className="underline">{t('NotFound.home')}</Link>
        </p>
      </div>
    </div>
  )
}

