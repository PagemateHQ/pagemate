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
import { fireConfetti } from "@/lib/confetti"
import { useTaskStore } from "@/lib/task-store"
import {useTranslations} from 'next-intl'

function formatElapsed(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const mm = String(minutes).padStart(2, "0")
  const ss = String(seconds).padStart(2, "0")
  return `${mm}:${ss}`
}

export function TaskTimer() {
  const t = useTranslations()
  const running = useTaskStore((s) => s.running)
  const startedAt = useTaskStore((s) => s.startedAt)
  const finishedAt = useTaskStore((s) => s.finishedAt)
  const label = useTaskStore((s) => s.label)
  const start = useTaskStore((s) => s.start)

  const [open, setOpen] = React.useState(false)
  const [finalMs, setFinalMs] = React.useState(0)

  const idRef = React.useRef<string | number | null>(null)
  const intervalRef = React.useRef<number | null>(null)

  // Do not auto-start; Task selection kicks off the timer.

  // Create/update the Sonner timer toast when running
  React.useEffect(() => {
    if (running && startedAt) {
      // Create or update the long-lived toast
      if (idRef.current == null) {
        idRef.current = toast.info(`00:00`, {
          description: label ? t('Timer.task', {label}) : t('Timer.runningDesc'),
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
            description: label ? t('Timer.task', {label}) : t('Timer.runningDesc'),
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
      // Celebrate task completion 🎉
      fireConfetti()
    }
  }, [finishedAt, startedAt])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('Timer.elapsed', {time: formatElapsed(finalMs)})}</DialogTitle>
          {label && (
            <DialogDescription>
              {t('Timer.task', {label})}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>{t('Common.actions.close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
