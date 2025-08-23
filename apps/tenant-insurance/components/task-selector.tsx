"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTaskStore } from "@/lib/task-store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function TaskSelector() {
  const router = useRouter()
  const running = useTaskStore((s) => s.running)
  const finishedAt = useTaskStore((s) => s.finishedAt)
  const begin = useTaskStore((s) => s.begin)

  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    // Show on first load of the home page if nothing is running
    if (!running) setOpen(true)
  }, [running])

  function startTask(label: string, href: string) {
    begin(label)
    setOpen(false)
    // small delay so toast can render before route change
    setTimeout(() => router.push(href), 0)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select a Task</DialogTitle>
          <DialogDescription>Pick one to start the demo timer.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Button onClick={() => startTask("Find Austin Phone Number", "/agents")}>
            1) Find Austin Phone Number
          </Button>
          <Button onClick={() => startTask("Find which plan you need to cover $400 Liability", "/plans")}>
            3) Find which plan you need to cover $400 Liability
          </Button>
          <Button onClick={() => startTask("File a Claim in MA", "/claims")}>
            3) File a Claim in MA
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
