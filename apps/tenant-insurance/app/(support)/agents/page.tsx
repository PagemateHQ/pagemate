"use client"

import { useCallback } from "react"
import { useTaskStore } from "@/lib/task-store"

const offices = [
  { city: "San Francisco, CA", zipPrefix: "94", phone: "(415) 555-0100", address: "100 Market St" },
  { city: "New York, NY", zipPrefix: "10", phone: "(212) 555-0101", address: "200 Broadway" },
  { city: "Austin, TX", zipPrefix: "78", phone: "(512) 555-0102", address: "300 Congress Ave" },
  { city: "Chicago, IL", zipPrefix: "60", phone: "(312) 555-0103", address: "400 Michigan Ave" },
  { city: "Miami, FL", zipPrefix: "33", phone: "(305) 555-0104", address: "500 Ocean Dr" },
]

export default function AgentsPage() {
  const stop = useTaskStore((s) => s.stop)

  const onAustinClick = useCallback(async () => {
    // Stop the global task timer using the current label
    stop()
    try {
      const mod = await import("canvas-confetti")
      const confetti = mod.default
      // Simple burst sequence
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } })
      setTimeout(() => confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } }), 200)
      setTimeout(() => confetti({ particleCount: 40, spread: 120, origin: { y: 0.7 } }), 400)
    } catch {
      // ignore if confetti fails
    }
  }, [stop])

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Find an Agent</h1>
        <p className="text-muted-foreground">Call or visit a local office for personalized help.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {offices.map((o) => {
          const clickable = o.city === "Austin, TX"
          return (
            <div
              key={o.city}
              className={`rounded-md border p-4 ${clickable ? "cursor-pointer hover:bg-muted/50 transition" : ""}`}
              onClick={clickable ? onAustinClick : undefined}
              role={clickable ? "button" : undefined}
              tabIndex={clickable ? 0 : undefined}
              onKeyDown={clickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onAustinClick() } } : undefined}
            >
              <div className="font-medium">{o.city}</div>
              <div className="text-sm text-muted-foreground">{o.address}</div>
              <div className="text-sm">{o.phone}</div>
              <div className="text-xs text-muted-foreground">ZIPs starting with {o.zipPrefix}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
