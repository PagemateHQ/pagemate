import {getTranslations} from 'next-intl/server'
import {Link} from '@/i18n/routing'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { TaskSelector } from "@/components/task-selector"
import { CheckIcon, ShieldCheckIcon } from "lucide-react"

export default async function Home() {
  const t = await getTranslations()
  const bullets = (t.raw('Home.bullets') as string[]) ?? []
  const planFeatures = {
    Essential: t.raw('Home.plan.features.essential') as string[],
    Standard: t.raw('Home.plan.features.standard') as string[],
    Plus: t.raw('Home.plan.features.plus') as string[]
  }
  const plans = [
    { name: t('Home.plan.Essential'), key: 'Essential', price: 10, features: planFeatures.Essential },
    { name: t('Home.plan.Standard'), key: 'Standard', price: 18, features: planFeatures.Standard },
    { name: t('Home.plan.Plus'), key: 'Plus', price: 28, features: planFeatures.Plus }
  ] as const

  return (
    <div className="space-y-16">
      <TaskSelector />
      <section className="grid gap-6 md:grid-cols-2 md:gap-10">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t('Home.heroTitle')}
          </h1>
          <p className="text-muted-foreground">
            {t('Home.heroDesc')}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/quote">{t('Common.actions.getQuote')}</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/plans">{t('Common.actions.explorePlans')}</Link>
            </Button>
          </div>
          <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
            {bullets.map((i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckIcon className="size-4 text-primary" /> {i}
              </li>
            ))}
          </ul>
        </div>
        <Card className="relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <ShieldCheckIcon className="size-5" />
              </span>
              <div>
                <CardTitle>{t('Home.whyTitle')}</CardTitle>
                <CardDescription>{t('Home.whyDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                { key: 'flexible' as const },
                { key: 'fast' as const },
                { key: 'support' as const },
                { key: 'bundle' as const }
              ]).map(({ key }) => (
                <div key={key} className="rounded-md border p-4">
                  <div className="font-medium">{t(`Home.whyCards.${key}.title`)}</div>
                  <p className="text-sm text-muted-foreground">{t(`Home.whyCards.${key}.desc`)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6">
        <h2 className="text-xl font-semibold tracking-tight">{t('Home.popularPlans')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.key} className="flex flex-col">
              <CardHeader>
                <div className="flex items-baseline justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  <div>
                    <span className="text-2xl font-semibold">${plan.price}</span>
                    <span className="text-sm text-muted-foreground">{t('Home.plan.mo')}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2 text-sm text-muted-foreground">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckIcon className="size-4 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={{ pathname: "/quote", query: { plan: plan.key } }}>
                    {t('Common.actions.startWith', {plan: plan.name})}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

