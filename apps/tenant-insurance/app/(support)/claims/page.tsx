"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ClaimsPage() {
  const [submitted, setSubmitted] = React.useState(false)
  const [claimId, setClaimId] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(form.entries())),
      })
      const data = await res.json()
      setClaimId(data.id ?? null)
      setSubmitted(true)
      const { toast } = await import("@/components/ui/sonner")
      toast.success("Claim submitted", {
        description: data.id ? `Your claim number is ${data.id}` : undefined,
      })
    } catch {
      const { toast } = await import("@/components/ui/sonner")
      toast.error("Could not submit claim", {
        description: "Please try again shortly.",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">File a Claim</h1>
        <p className="text-muted-foreground">
          We’re here to help 24/7. Submit your details and an agent will reach out.
        </p>
      </div>

      <Card>
        {submitted ? (
          <>
            <CardHeader>
              <CardTitle>Thanks — we’ve got it.</CardTitle>
              <CardDescription>
                Your claim number is <span className="font-mono">{claimId ?? "pending"}</span>. An adjuster will contact you shortly.
              </CardDescription>
            </CardHeader>
            <CardContent />
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Claim Details</CardTitle>
              <CardDescription>Tell us what happened and how to reach you.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" required placeholder="Jane Doe" />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required placeholder="you@example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" inputMode="tel" placeholder="(555) 123-4567" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date of incident</Label>
                <Input id="date" type="date" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type of loss</Label>
                <Input id="type" placeholder="Water, fire, theft, etc." required />
              </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="desc">What happened?</Label>
                  <Textarea id="desc" required placeholder="Briefly describe the incident" />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit">Submit claim</Button>
                </div>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
