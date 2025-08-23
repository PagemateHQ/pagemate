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
import {useTranslations} from 'next-intl'

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
  const t = useTranslations()
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
      toast.success(t('Quote.toastOk.title', {email}), {
        description: t('Quote.toastOk.desc', {plan, price: quote}),
      })
      // Detect Task 3 completion via ZIP + notes
      const note = (notes || "").toLowerCase()
      const mentionsCar = /car/.test(note)
      const mentionsHome = /home/.test(note)
      const mentions20k = /(\$?\s*20k|\$?\s*20[, ]?000)/i.test(note)
      const mentions1m = /(\$?\s*1m|\$?\s*1[, ]?000[, ]?000)/i.test(note)
      const selectedState = typeof window !== "undefined" ? localStorage.getItem("state-selector:v1") : null
      const isMA = selectedState === "MA"
      const matched = isMA && mentionsCar && mentions20k && mentionsHome && mentions1m
      if (matched) {
        useTaskStore.getState().stop()
      }
    } catch (_err) {
      const { toast } = await import("@/components/ui/sonner")
      toast.error(t('Quote.toastErr.title'), {
        description: t('Quote.toastErr.desc'),
      })
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t('Quote.title')}</h1>
        <p className="text-muted-foreground">{t('Quote.desc')}</p>
      </div>

      <Card className="md:col-span-2">
        <CardContent className="p-6">
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="plan">{t('Common.labels.plan')}</Label>
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger id="plan" aria-label="Plan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Essential">{t('Home.plan.Essential')}</SelectItem>
                  <SelectItem value="Standard">{t('Home.plan.Standard')}</SelectItem>
                  <SelectItem value="Plus">{t('Home.plan.Plus')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="zip">{t('Common.labels.zip')}</Label>
              <Input
                id="zip"
                inputMode="numeric"
                maxLength={5}
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder={t('Common.placeholders.zip')}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="propertyValue">{t('Common.labels.personalProperty')}</Label>
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
              <Label htmlFor="email">{t('Common.labels.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('Common.placeholders.email')}
                required
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="notes">{t('Common.labels.notes')}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('Common.placeholders.notes')}
              />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {t('Common.labels.estimatedPremium')}: <span className="font-medium">${premium}{t('Home.plan.mo')}</span>
              </div>
              <Button type="submit">{t('Common.actions.emailQuote')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
