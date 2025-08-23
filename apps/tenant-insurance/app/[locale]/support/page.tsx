import {getTranslations, setRequestLocale} from 'next-intl/server'
import {Link} from '@/i18n/routing'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default async function SupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations()
  const items = [
    { href: "/claims", key: 'fileClaim' },
    { href: "/faq", key: 'faq' },
    { href: "/agents", key: 'agents' },
    { href: "/contact", key: 'contact' },
  ] as const

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t('Support.title')}</h1>
        <p className="text-muted-foreground">{t('Support.desc')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <Link href={i.href} key={i.href}>
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle>{t(`Support.items.${i.key}.title`)}</CardTitle>
                <CardDescription>{t(`Support.items.${i.key}.desc`)}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
