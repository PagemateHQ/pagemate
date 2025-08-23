import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const plans = [
  {
    name: "Essential",
    price: 10,
    tagline: "Core protection for everyday renters",
    features: [
      "$10k personal property",
      "$100k liability",
      "$500 deductible",
      "Theft & fire coverage",
    ],
  },
  {
    name: "Standard",
    price: 18,
    tagline: "Best value for most tenants",
    popular: true,
    features: [
      "$25k personal property",
      "$300k liability",
      "$500 deductible",
      "Loss of use",
      "Medical payments",
    ],
  },
  {
    name: "Plus",
    price: 28,
    tagline: "Extra coverage and lower deductible",
    features: [
      "$50k personal property",
      "$500k liability",
      "$250 deductible",
      "Water damage",
      "Refrigerated property",
    ],
  },
]

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Plans</h1>
        <p className="text-muted-foreground">
          Choose the plan that fits your needs. You can adjust limits later.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => (
          <Link href={{ pathname: "/quote", query: { plan: p.name } }} key={p.name}>    
          <Card className="flex flex-col h-full">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle>{p.name}</CardTitle>
                  <CardDescription>{p.tagline}</CardDescription>
                </div>
                {p.popular ? <Badge variant="secondary">Popular</Badge> : null}
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <span className="text-2xl font-semibold">${p.price}</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
                {p.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            </CardContent>  
          </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
