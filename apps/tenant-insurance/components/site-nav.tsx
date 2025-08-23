"use client"

import * as React from "react"
import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

export function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
            <NavigationMenuLink className="px-3 py-2" href="/">Home</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className="px-3 py-2" href="/plans">
            Plans</NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[520px] grid-cols-2 gap-4 p-4">
              <div>
                <div className="mb-2 text-xs font-medium text-muted-foreground">Quotes</div>
                <div className="grid gap-1">
                  <NavigationMenuLink className="px-3 py-2" href="/quote">Quick Quote</NavigationMenuLink>
                  <NavigationMenuLink className="px-3 py-2" href="/plans/Standard">Plan Details</NavigationMenuLink>
                  {/** Wizard intentionally not listed here; it’s only accessible from plan pages */}
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-medium text-muted-foreground">Coverage</div>
                <div className="grid gap-1">
                  <NavigationMenuLink className="px-3 py-2" href="/plans">All Plans</NavigationMenuLink>
                  <NavigationMenuLink className="px-3 py-2" href="/plans/Plus">Plus Plan</NavigationMenuLink>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Support</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[520px] grid-cols-2 gap-4 p-4">
              <div>
                <div className="mb-2 text-xs font-medium text-muted-foreground">Claims</div>
                <div className="grid gap-1">
                  <NavigationMenuLink className="px-3 py-2" href="/claims">File a Claim</NavigationMenuLink>
                  <NavigationMenuLink className="px-3 py-2" href="/claims/track">Track Claim</NavigationMenuLink>
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-medium text-muted-foreground">Help</div>
                <div className="grid gap-1">
                  <NavigationMenuLink className="px-3 py-2" href="/faq">FAQs</NavigationMenuLink>
                  <NavigationMenuLink className="px-3 py-2" href="/agents">Find an Agent</NavigationMenuLink>
                  <NavigationMenuLink className="px-3 py-2" href="/contact">Contact</NavigationMenuLink>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
