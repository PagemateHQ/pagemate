"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const v = localStorage.getItem("cookie-consent:v1")
    if (!v) setVisible(true)
  }, [])
  if (!visible) return null
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl rounded-md border bg-background p-4 shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We use cookies to improve your experience. See our <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => { localStorage.setItem("cookie-consent:v1", "declined"); setVisible(false) }}>Decline</Button>
          <Button onClick={() => { localStorage.setItem("cookie-consent:v1", "accepted"); setVisible(false) }}>Accept</Button>
        </div>
      </div>
    </div>
  )
}

