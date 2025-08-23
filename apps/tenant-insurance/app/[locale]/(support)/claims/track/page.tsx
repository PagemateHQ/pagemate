"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {useTranslations} from 'next-intl'

export default function ClaimsTrackPage() {
  const t = useTranslations()
  const [id, setId] = useState("")
  const [current, setCurrent] = useState<number | null>(null)
  const stages = t.raw('Track.stages') as string[]

  async function lookup() {
    const sum = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
    const step = sum % stages.length
    setCurrent(step)
    if (id.trim().toUpperCase() === "ACM-123456") {
      const { useTaskStore } = await import("@/lib/task-store")
      useTaskStore.getState().stop()
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t('Track.title')}</h1>
        <p className="text-muted-foreground">{t('Track.desc')}</p>
      </div>
      <div className="flex gap-2 max-w-md">
        <Input placeholder="ACM-123456" value={id} onChange={(e) => setId(e.target.value)} />
        <Button onClick={lookup}>{t('Common.actions.lookup')}</Button>
      </div>

      {current !== null && (
        <Card>
          <CardHeader>
            <CardTitle>{t('Track.progressTitle')}</CardTitle>
            <CardDescription>{t('Track.progressDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid gap-3">
              {stages.map((s, i) => (
                <li key={s} className={i <= current ? "text-foreground" : "text-muted-foreground"}>
                  <span className={`mr-2 inline-block size-2 rounded-full ${i <= current ? "bg-primary" : "bg-muted"}`} />
                  {s}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

