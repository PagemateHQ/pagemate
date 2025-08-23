"use client"

import Link from "next/link"
import { NavigationMenuDemo } from "@/components/site-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { MobileNav } from "@/components/site-mobile-nav"
import { LocationSelector } from "@/components/location-selector"

export function SiteHeader() {
  return (
    <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block size-6 rounded-full bg-primary" />
          <span className="text-base">Acme Insurance</span>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="hidden md:block">
            <NavigationMenuDemo />
          </nav>
          <div className="hidden sm:block">
            <LocationSelector />
          </div>
          <ModeToggle />
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  )
}
