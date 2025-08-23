"use client"

import * as React from "react"
import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"

export function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <Link className="px-3 py-2" href="/">Home</Link>
        <Link className="px-3 py-2" href="/plans">Plans</Link>
        <Link className="px-3 py-2" href="/products">Products</Link>
        <Link className="px-3 py-2" href="/support">Support</Link>
      </NavigationMenuList>
    </NavigationMenu>
  )
}