"use client";

import { MenuIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "@/i18n/routing";

export function MobileNav() {
	const [open, setOpen] = useState(false);
	const t = useTranslations();
	return (
		<Sheet open={open} onOpenChange={setOpen} aria-label="Mobile navigation menu">
			<SheetTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					aria-label={t("Common.a11y.openMenu")}
				>
					<MenuIcon className="size-5" />
				</Button>
			</SheetTrigger>
			<SheetContent side="right" className="w-80" aria-label="Mobile navigation panel">
				<nav className="grid gap-4" aria-label="Mobile navigation links">
					<Link onClick={() => setOpen(false)} className="py-1" href="/" aria-label="Navigate to home page">
						{t("Common.nav.home")}
					</Link>
					<Link onClick={() => setOpen(false)} className="py-1" href="/plans" aria-label="View insurance plans">
						{t("Common.nav.plans")}
					</Link>
					<Link
						onClick={() => setOpen(false)}
						className="py-1"
						href="/plans/Standard"
						aria-label="View Standard plan details"
					>
						{t("Common.mobile.planDetails")}
					</Link>
					<Link onClick={() => setOpen(false)} className="py-1" href="/quote" aria-label="Get insurance quote">
						{t("Common.actions.getQuote")}
					</Link>
					{/** Wizard is intentionally hidden from global nav */}
					<Link onClick={() => setOpen(false)} className="py-1" href="/claims" aria-label="Submit insurance claims">
						{t("Common.mobile.claims")}
					</Link>
					<Link
						onClick={() => setOpen(false)}
						className="py-1"
						href="/claims/track"
						aria-label="Track claim status"
					>
						{t("Common.mobile.trackClaim")}
					</Link>
					<Link onClick={() => setOpen(false)} className="py-1" href="/faq" aria-label="View frequently asked questions">
						{t("Common.mobile.faq")}
					</Link>
					<Link onClick={() => setOpen(false)} className="py-1" href="/contact" aria-label="Contact customer service">
						{t("Common.mobile.contact")}
					</Link>
					<Link onClick={() => setOpen(false)} className="py-1" href="/agents" aria-label="Find insurance agents">
						{t("Common.mobile.agents")}
					</Link>
					<Link
						onClick={() => setOpen(false)}
						className="py-1"
						href="/(marketing)/disclosures"
						aria-label="View legal disclosures"
					>
						{t("Common.mobile.disclosures")}
					</Link>
				</nav>
			</SheetContent>
		</Sheet>
	);
}
