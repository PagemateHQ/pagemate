import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const products = [
  {
    name: "Renters Insurance",
    desc: "Protect personal property and liability at your rental.",
    cta: "Get a Quote",
    href: "/quote",
  },
  {
    name: "Landlord Insurance",
    desc: "Basic dwelling coverage for rental property owners.",
    cta: "Explore Plans",
    href: "/plans",
  },
  {
    name: "Personal Liability",
    desc: "Extra liability coverage for peace of mind.",
    cta: "Explore Plans",
    href: "/plans",
  },
]

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <p className="text-muted-foreground">Coverage options tailored for renters and property owners.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <Card key={p.name} className="flex flex-col">
            <CardHeader>
              <CardTitle>{p.name}</CardTitle>
              <CardDescription>{p.desc}</CardDescription>
            </CardHeader>
            <CardContent />
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={p.href}>{p.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
