import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckIcon, ShieldCheckIcon } from "lucide-react"

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="grid gap-6 md:grid-cols-2 md:gap-10">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Protect what matters most.
          </h1>
          <p className="text-muted-foreground">
            Affordable tenant insurance with fast claims, flexible coverage, and
            great support. Get a personalized quote in minutes.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/quote">Get a Quote</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/plans">Explore Plans</Link>
            </Button>
          </div>
          <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
            {[
              "Coverage from $10/month",
              "Cancel anytime",
              "24/7 claims support",
            ].map((i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckIcon className="size-4 text-primary" /> {i}
              </li>
            ))}
          </ul>
        </div>
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <ShieldCheckIcon className="size-5" />
              </span>
              <div>
                <h3 className="font-medium">Why Acme Insurance?</h3>
                <p className="text-sm text-muted-foreground">
                  Simple coverage for renters and tenants.
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                {
                  title: "Flexible plans",
                  desc: "Choose coverage levels that fit your life.",
                },
                {
                  title: "Fast claims",
                  desc: "File online and track your claim status.",
                },
                {
                  title: "Trusted support",
                  desc: "Talk to licensed agents when you need help.",
                },
                {
                  title: "Bundle & save",
                  desc: "Discounts when you add additional products.",
                },
              ].map(({ title, desc }) => (
                <div key={title} className="rounded-md border p-4">
                  <div className="font-medium">{title}</div>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6">
        <h2 className="text-xl font-semibold tracking-tight">Popular Plans</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Essential",
              price: 10,
              features: ["$10k personal property", "$100k liability", "$500 deductible"],
            },
            {
              name: "Standard",
              price: 18,
              features: ["$25k personal property", "$300k liability", "$500 deductible"],
            },
            {
              name: "Plus",
              price: 28,
              features: ["$50k personal property", "$500k liability", "$250 deductible"],
            },
          ].map((plan) => (
            <Card key={plan.name} className="flex flex-col">
              <CardContent className="p-6">
                <div className="flex items-baseline justify-between">
                  <div className="text-lg font-medium">{plan.name}</div>
                  <div>
                    <span className="text-2xl font-semibold">${plan.price}</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                </div>
                <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckIcon className="size-4 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Button asChild className="w-full">
                    <Link href={{ pathname: "/quote", query: { plan: plan.name } }}>
                      Start with {plan.name}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
