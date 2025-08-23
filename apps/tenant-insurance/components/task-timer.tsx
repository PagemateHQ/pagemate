"use client"

import * as React from "react"
import { toast } from "@/components/ui/sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTaskStore } from "@/lib/task-store"

function formatElapsed(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const mm = String(minutes).padStart(2, "0")
  const ss = String(seconds).padStart(2, "0")
  return `${mm}:${ss}`
}

export function TaskTimer() {
  const running = useTaskStore((s) => s.running)
  const startedAt = useTaskStore((s) => s.startedAt)
  const finishedAt = useTaskStore((s) => s.finishedAt)
  const label = useTaskStore((s) => s.label)
  const start = useTaskStore((s) => s.start)

  const [open, setOpen] = React.useState(false)
  const [finalMs, setFinalMs] = React.useState(0)

  const idRef = React.useRef<string | number | null>(null)
  const intervalRef = React.useRef<number | null>(null)

  // Ensure a timer starts on first mount for the demo
  React.useEffect(() => {
    if (!running && !finishedAt) {
      start("Find the phone number of Austin, TX agent")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Create/update the Sonner timer toast when running
  React.useEffect(() => {
    if (running && startedAt) {
      // Create or update the long-lived toast
      if (idRef.current == null) {
        idRef.current = toast.info(`00:00`, {
          description: label ? `Task: ${label}` : "Complete a task to stop the timer.",
          duration: 1_000_000,
        })
      }
      // Start interval updates
      if (intervalRef.current == null) {
        intervalRef.current = window.setInterval(() => {
          if (idRef.current == null || !startedAt) return
          const elapsed = Date.now() - startedAt
          toast.info(`${formatElapsed(elapsed)}`, {
            id: idRef.current,
            description: label ? `Task: ${label}` : "Complete a task to stop the timer.",
            duration: 1_000_000,
          })
        }, 1000)
      }
    }

    return () => {
      if (!running) {
        if (intervalRef.current != null) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        if (idRef.current != null) {
          toast.dismiss(idRef.current)
          idRef.current = null
        }
      }
    }
  }, [running, startedAt, label])

  // When finished, stop timer and show dialog
  React.useEffect(() => {
    if (finishedAt && startedAt) {
      // Cleanup any running toast/interval
      if (intervalRef.current != null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (idRef.current != null) {
        toast.dismiss(idRef.current)
        idRef.current = null
      }
      setFinalMs(finishedAt - startedAt)
      setOpen(true)
    }
  }, [finishedAt, startedAt])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Congrats!</DialogTitle>
          <DialogDescription>
            {label ? (
              <span>
                You finished <span className="font-medium">{label}</span>.
              </span>
            ) : (
              <span>You finished the task.</span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="text-lg font-medium">It took {formatElapsed(finalMs)}.</div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
