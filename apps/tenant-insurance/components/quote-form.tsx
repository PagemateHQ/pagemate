"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTaskStore } from "@/lib/task-store"

function estimateMonthlyPremium({
  propertyValue,
  zip,
  plan,
}: {
  propertyValue: number
  zip: string
  plan: string
}) {
  const base = plan === "Plus" ? 24 : plan === "Standard" ? 16 : 10
  const risk = /^9/.test(zip) ? 1.1 : /^1/.test(zip) ? 0.95 : 1
  const propAdj = Math.min(1 + propertyValue / 100000, 1.5)
  const premium = Math.max(8, Math.round(base * risk * propAdj))
  return premium
}

export default function QuoteForm({ initialPlan }: { initialPlan: string }) {
  const [plan, setPlan] = React.useState(initialPlan)
  const [zip, setZip] = React.useState("")
  const [propertyValue, setPropertyValue] = React.useState(25000)
  const [email, setEmail] = React.useState("")
  const [notes, setNotes] = React.useState("")

  const premium = estimateMonthlyPremium({ propertyValue, zip, plan })

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, zip, propertyValue }),
      })
      const { premium: serverPremium } = await res.json()
      const quote = serverPremium ?? premium
      const { toast } = await import("@/components/ui/sonner")
      toast.success(`Quote sent to ${email}`, {
        description: `${plan} plan estimated at $${quote}/mo`,
      })
      // Stop the global demo timer when task completes
      useTaskStore.getState().stop()
    } catch (_err) {
      const { toast } = await import("@/components/ui/sonner")
      toast.error("Could not submit quote", {
        description: "Please try again in a moment.",
      })
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Get a Quote</h1>
        <p className="text-muted-foreground">
          Enter a few details to see your estimated monthly premium.
        </p>
      </div>

      <Card className="md:col-span-2">
        <CardContent className="p-6">
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="plan">Plan</Label>
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger id="plan" aria-label="Plan">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Essential">Essential</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Plus">Plus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="zip">ZIP code</Label>
              <Input
                id="zip"
                inputMode="numeric"
                maxLength={5}
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="94105"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="propertyValue">Personal property ($)</Label>
              <Input
                id="propertyValue"
                inputMode="numeric"
                value={propertyValue}
                onChange={(e) =>
                  setPropertyValue(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)
                }
                placeholder="25000"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special details about your rental"
              />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Estimated premium: <span className="font-medium">${premium}/mo</span>
              </div>
              <Button type="submit">Email me my quote</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
