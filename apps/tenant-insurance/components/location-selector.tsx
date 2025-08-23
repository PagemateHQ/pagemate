"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"

const states = ["CA","NY","TX","IL","FL","WA","MA","GA","PA","AZ"]

export function LocationSelector() {
  const [state, setState] = useState<string>("CA")
  useEffect(() => {
    const v = localStorage.getItem("state-selector:v1")
    if (v) setState(v)
  }, [])
  function onChange(v: string) {
    setState(v)
    localStorage.setItem("state-selector:v1", v)
  }
  return (
    <Select value={state} onValueChange={onChange}>
      <SelectTrigger className="w-[120px]"><SelectValue placeholder="State" /></SelectTrigger>
      <SelectContent>
        {states.map((s) => (
          <SelectItem key={s} value={s}>{s}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

