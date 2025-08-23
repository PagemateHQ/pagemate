"use client"

import * as React from "react"
import {Link} from "@/i18n/routing"
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {useTranslations} from 'next-intl'

export function NavigationMenuDemo() {
  const t = useTranslations()
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <Link className="px-3 py-2" href="/">{t('Common.nav.home')}</Link>
        <Link className="px-3 py-2" href="/plans">{t('Common.nav.plans')}</Link>
        <Link className="px-3 py-2" href="/products">{t('Common.nav.products')}</Link>
        <Link className="px-3 py-2" href="/support">{t('Common.nav.support')}</Link>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
