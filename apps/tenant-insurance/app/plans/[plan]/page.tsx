import Link from "next/link"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

const plans = {
  Essential: {
    tagline: "Core protection for everyday renters",
    coverages: ["$10k personal property", "$100k liability", "$500 deductible"],
    exclusions: ["Flood", "Earthquake"],
    endorsements: ["Scheduled jewelry", "Water backup"],
  },
  Standard: {
    tagline: "Best value for most tenants",
    coverages: ["$25k personal property", "$300k liability", "$500 deductible"],
    exclusions: ["Flood", "Earthquake"],
    endorsements: ["Scheduled jewelry", "Electronics", "Water backup"],
  },
  Plus: {
    tagline: "Extra coverage and lower deductible",
    coverages: ["$50k personal property", "$500k liability", "$250 deductible"],
    exclusions: ["Flood", "Earthquake"],
    endorsements: ["Scheduled jewelry", "Electronics", "Identity theft", "Water backup"],
  },
} as const

export default async function PlanDetail({ params }: { params: Promise<{ plan: string }> }) {
  const { plan: planKey } = await params
  if (!(planKey in plans)) return notFound()
  const plan = plans[planKey as keyof typeof plans]
  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/plans">Plans</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{planKey}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{planKey}</h1>
          <p className="text-muted-foreground">{plan.tagline}</p>
        </div>
        {planKey === "Standard" && <Badge variant="secondary">Popular</Badge>}
      </div>

      <Tabs defaultValue="coverage" className="w-full">
        <TabsList>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
          <TabsTrigger value="exclusions">Exclusions</TabsTrigger>
          <TabsTrigger value="endorsements">Endorsements</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>
        <TabsContent value="coverage">
          <ul className="list-disc pl-5 text-muted-foreground">
            {plan.coverages.map((c: string) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="exclusions">
          <ul className="list-disc pl-5 text-muted-foreground">
            {plan.exclusions.map((c: string) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="endorsements">
          <ul className="list-disc pl-5 text-muted-foreground">
            {plan.endorsements.map((c: string) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="faq">
          <p className="text-muted-foreground">See <Link href="/faq" className="underline">FAQs</Link> for more details.</p>
        </TabsContent>
      </Tabs>

      <div>
        <Button asChild>
          <Link href={{ pathname: "/quote/wizard", query: { plan: planKey } }}>Get a detailed quote</Link>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Coverage subject to policy terms, conditions, limits and exclusions. Availability varies by state. This isn’t a contract. Refer to your policy for actual terms.
      </p>
    </div>
  )
}
