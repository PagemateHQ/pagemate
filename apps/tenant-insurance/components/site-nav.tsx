"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import {
	NavigationMenu,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Link } from "@/i18n/routing";

export function NavigationMenuDemo() {
	const t = useTranslations();
	return (
		<NavigationMenu aria-label="Main navigation menu">
			<NavigationMenuList aria-label="Navigation links">
				<Link className="px-3 py-2" href="/" aria-label="Navigate to home page">
					{t("Common.nav.home")}
				</Link>
				<Link className="px-3 py-2" href="/plans" aria-label="View insurance plans">
					{t("Common.nav.plans")}
				</Link>
				<Link className="px-3 py-2" href="/products" aria-label="Browse products">
					{t("Common.nav.products")}
				</Link>
				<Link className="px-3 py-2" href="/support" aria-label="Get customer support">
					{t("Common.nav.support")}
				</Link>
			</NavigationMenuList>
		</NavigationMenu>
	);
}
