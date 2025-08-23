"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {Link} from "@/i18n/routing"
import {useTranslations} from 'next-intl'

export function CookieConsent() {
  const t = useTranslations()
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    // Always show on each page load regardless of prior choice
    setVisible(true)
  }, [])
  if (!visible) return null
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl rounded-md border bg-background p-4 shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {t.rich('Common.cookie.message', {
            privacy: (chunks) => <Link href="/privacy" className="underline">{chunks}</Link>
          })}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => { localStorage.setItem("cookie-consent:v1", "declined"); setVisible(false) }}>{t('Common.actions.decline')}</Button>
          <Button onClick={() => { localStorage.setItem("cookie-consent:v1", "accepted"); setVisible(false) }}>{t('Common.actions.accept')}</Button>
        </div>
      </div>
    </div>
  )
}
