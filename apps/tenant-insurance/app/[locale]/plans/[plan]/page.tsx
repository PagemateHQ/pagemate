import {notFound} from 'next/navigation'
import {getTranslations} from 'next-intl/server'
import {Link} from '@/i18n/routing'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

type PlanKey = 'Essential' | 'Standard' | 'Plus'

export default async function PlanDetail({ params }: { params: Promise<{ plan: string }> }) {
  const t = await getTranslations()
  const { plan } = await params
  const key = plan as PlanKey
  const valid: PlanKey[] = ['Essential','Standard','Plus']
  if (!valid.includes(key)) return notFound()

  const tagline = t(`Plans.tagline.${key}`)
  const coverage = (t.raw(`Home.plan.features.${key === 'Essential' ? 'essential' : key === 'Standard' ? 'standard' : 'plus'}`) as string[]) ?? []
  const exclusions = ['Flood','Earthquake'] as const
  const endorsementsByPlan: Record<PlanKey, readonly string[]> = {
    Essential: ['Scheduled jewelry','Water backup'],
    Standard: ['Scheduled jewelry','Electronics','Water backup'],
    Plus: ['Scheduled jewelry','Electronics','Identity theft','Water backup']
  }
  const endorsements = endorsementsByPlan[key]

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">{t('Common.nav.home')}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/plans">{t('Common.nav.plans')}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t(`Home.plan.${key}`)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t(`Home.plan.${key}`)}</h1>
          <p className="text-muted-foreground">{tagline}</p>
        </div>
        {key === 'Standard' && <Badge variant="secondary">{t('Plans.popular')}</Badge>}
      </div>

      <Tabs defaultValue="coverage" className="w-full">
        <TabsList>
          <TabsTrigger value="coverage">{t('PlanDetails.tabs.coverage')}</TabsTrigger>
          <TabsTrigger value="exclusions">{t('PlanDetails.tabs.exclusions')}</TabsTrigger>
          <TabsTrigger value="endorsements">{t('PlanDetails.tabs.endorsements')}</TabsTrigger>
          <TabsTrigger value="faq">{t('PlanDetails.tabs.faq')}</TabsTrigger>
        </TabsList>
        <TabsContent value="coverage">
          <ul className="list-disc pl-5 text-muted-foreground">
            {coverage.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="exclusions">
          <ul className="list-disc pl-5 text-muted-foreground">
            {exclusions.map((c) => (
              <li key={c}>{t(`PlanDetails.terms.${c}`)}</li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="endorsements">
          <ul className="list-disc pl-5 text-muted-foreground">
            {endorsements.map((c) => (
              <li key={c}>{t(`PlanDetails.terms.${c}`)}</li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="faq">
          <p className="text-muted-foreground">{t('FAQ.title')} · <Link href="/faq" className="underline">{t('FAQ.title')}</Link></p>
        </TabsContent>
      </Tabs>

      <div>
        <Button asChild>
          <Link href={{ pathname: "/quote/wizard", query: { plan: key } }}>{t('Common.actions.getQuote')}</Link>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {t('Common.disclaimer.default')}
      </p>
    </div>
  )
}
