"use client"

import { useEffect, useState } from "react"

const messages: Record<string, string> = {
  CA: "CA: Not available in designated wildfire zones.",
  NY: "NY: Some endorsements not available.",
  TX: "TX: Wind/hail deductible may apply in coastal counties.",
  FL: "FL: Hurricane deductible may apply.",
}

export function DisclaimerBar() {
  const [state, setState] = useState<string>("CA")
  useEffect(() => {
    const v = localStorage.getItem("state-selector:v1")
    if (v) setState(v)
  }, [])
  const msg = messages[state] || "Coverage subject to terms. Availability varies by state."
  return (
    <div className="border-b bg-muted/30 py-2 text-center text-xs text-muted-foreground">
      {msg}
    </div>
  )
}

