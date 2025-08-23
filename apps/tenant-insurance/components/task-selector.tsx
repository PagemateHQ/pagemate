"use client"

import * as React from "react"
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
  const running = useTaskStore((s) => s.running)
  const finishedAt = useTaskStore((s) => s.finishedAt)
  const begin = useTaskStore((s) => s.begin)

  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    // Show on first load of the home page if nothing is running
    if (!running) setOpen(true)
  }, [running])

  function startTask(label: string) {
    begin(label)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select a Task</DialogTitle>
          <DialogDescription>Pick one to start the demo timer.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Button onClick={() => startTask("Find Austin Phone Number")}>
            1) Find Austin Phone Number
          </Button>
          <Button onClick={() => startTask("Track a Claim ACM-123456")}>
            2) Track a Claim ACM-123456
          </Button>
          <Button onClick={() => startTask("Get a Quote with $20k Car and $1M Home in MA")}>
            3) Get a Quote with $20k Car and $1M Home in MA
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
