"use client"

import Link from "next/link"
import { useState } from "react"
import { MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open Menu">
          <MenuIcon className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <nav className="grid gap-4">
          <Link onClick={() => setOpen(false)} className="py-1" href="/">
            Home
          </Link>
          <Link onClick={() => setOpen(false)} className="py-1" href="/plans">
            Plans
          </Link>
          <Link onClick={() => setOpen(false)} className="py-1" href="/plans/Standard">
            Plan Details
          </Link>
          <Link onClick={() => setOpen(false)} className="py-1" href="/quote">
            Get a Quote
          </Link>
          {/** Wizard is intentionally hidden from global nav */}
          <Link onClick={() => setOpen(false)} className="py-1" href="/claims">
            Claims
          </Link>
          <Link onClick={() => setOpen(false)} className="py-1" href="/claims/track">
            Track Claim
          </Link>
          <Link onClick={() => setOpen(false)} className="py-1" href="/faq">
            FAQ
          </Link>
          <Link onClick={() => setOpen(false)} className="py-1" href="/agents">
            Find an Agent
          </Link>
          <Link onClick={() => setOpen(false)} className="py-1" href="/contact">
            Contact
          </Link>
          <Link onClick={() => setOpen(false)} className="py-1" href="/(marketing)/disclosures">
            Disclosures
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
