import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const items = [
  {
    href: "/claims",
    title: "File a Claim",
    desc: "Start a new claim online in minutes.",
  },
  {
    href: "/faq",
    title: "FAQs",
    desc: "Answers to common questions about coverage and billing.",
  },
  {
    href: "/agents",
    title: "Find an Agent",
    desc: "Locate phone numbers and addresses for local offices.",
  },
  {
    href: "/contact",
    title: "Contact Support",
    desc: "Email or message our team for help.",
  },
]

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Support</h1>
        <p className="text-muted-foreground">Get help with claims, policies, and account questions.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
                <Link href={i.href} key={i.href}>
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle>{i.title}</CardTitle>
              <CardDescription>{i.desc}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
                </Link>
        ))}
      </div>
    </div>
  )
}
