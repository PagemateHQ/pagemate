"use client"

import {Link} from "@/i18n/routing"
import { useState } from "react"
import { MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {useTranslations} from 'next-intl'

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const t = useTranslations()
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('Common.a11y.openMenu')}>
          <MenuIcon className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <nav className="grid gap-4">
          <Link onClick={() => setOpen(false)} className="py-1" href="/">
            {t('Common.nav.home')}
          </Link>
          <Link onClick={() => setOpen(false)} className="py-1" href="/plans">
            {t('Common.nav.plans')}
          </Link>
          <Link onClick={() => setOpen(false)} className="py-1" href="/plans/Standard">
            {t('Common.mobile.planDetails')}
          </Link>
          <Link onClick={() => setOpen(false)} className="py-1" href="/quote">
            {t('Common.actions.getQuote')}
          </Link>
          {/** Wizard is intentionally hidden from global nav */}
          <Link onClick={() => setOpen(false)} className="py-1" href="/claims">
            {t('Common.mobile.claims')}
          </Link>
          <Link onClick={() => setOpen(false)} className="py-1" href="/claims/track">
            {t('Common.mobile.trackClaim')}
          </Link>
          <Link onClick={() => setOpen(false)} className="py-1" href="/faq">
            {t('Common.mobile.faq')}
          </Link>
          <Link onClick={() => setOpen(false)} className="py-1" href="/agents">
            {t('Common.mobile.agents')}
          </Link>
          <Link onClick={() => setOpen(false)} className="py-1" href="/contact">
            {t('Common.mobile.contact')}
          </Link>
          <Link onClick={() => setOpen(false)} className="py-1" href="/(marketing)/disclosures">
            {t('Common.mobile.disclosures')}
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
