"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const stages = ["Submitted", "Assigned", "In Review", "Approved", "Closed"]

export default function ClaimsTrackPage() {
  const [id, setId] = useState("")
  const [current, setCurrent] = useState<number | null>(null)

  async function lookup() {
    // Fake progression by hashing ID
    const sum = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
    const step = sum % stages.length
    setCurrent(step)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Track a Claim</h1>
        <p className="text-muted-foreground">Enter your claim number to see the current status.</p>
      </div>
      <div className="flex gap-2 max-w-md">
        <Input placeholder="ACM-123456" value={id} onChange={(e) => setId(e.target.value)} />
        <Button onClick={lookup}>Lookup</Button>
      </div>

      {current !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Claim Progress</CardTitle>
            <CardDescription>Where your claim is in the process.</CardDescription>
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
