"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const items = [
  { href: "/claims", label: "File a Claim" },
  { href: "/faq", label: "FAQs" },
  { href: "/agents", label: "Find an Agent" },
  { href: "/contact", label: "Contact" },
]

export function SupportSidebar() {
  const pathname = usePathname()
  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-64 shrink-0 pr-4 pt-2 md:block">
      <nav className="grid gap-1 text-sm">
        {items.map((i) => {
          const active = pathname === i.href
          return (
            <Link
              key={i.href}
              href={i.href}
              className={`rounded px-2 py-1.5 ${active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {i.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
