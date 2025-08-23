import {getTranslations} from 'next-intl/server'
import {Link} from '@/i18n/routing'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function ProductsPage() {
  const t = await getTranslations()
  const items = [
    { key: 'renters', href: '/quote' },
    { key: 'landlord', href: '/plans' },
    { key: 'liability', href: '/plans' }
  ] as const

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t('Products.title')}</h1>
        <p className="text-muted-foreground">{t('Products.desc')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <Card key={i.key} className="flex flex-col">
            <CardHeader>
              <CardTitle>{t(`Products.items.${i.key}.name`)}</CardTitle>
              <CardDescription>{t(`Products.items.${i.key}.desc`)}</CardDescription>
            </CardHeader>
            <CardContent />
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={i.href}>{t(`Products.items.${i.key}.cta`)}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

