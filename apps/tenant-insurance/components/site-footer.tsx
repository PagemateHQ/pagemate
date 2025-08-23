import {Link} from "@/i18n/routing"
import {getTranslations} from 'next-intl/server'

export async function SiteFooter() {
  const t = await getTranslations()
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-sm text-muted-foreground">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {t('Common.footer.copyright', {year: new Date().getFullYear()})}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:underline">
              {t('Common.footer.privacy')}
            </Link>
            <Link href="/terms" className="hover:underline">
              {t('Common.footer.terms')}
            </Link>
            <Link href="/contact" className="hover:underline">
              {t('Common.footer.contact')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
