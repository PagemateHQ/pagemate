"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";

const items = [
	{ href: "/claims", labelKey: "Support.items.fileClaim.title" },
	{ href: "/faq", labelKey: "Support.items.faq.title" },
	{ href: "/contact", labelKey: "Support.items.contact.title" },
	{ href: "/agents", labelKey: "Support.items.agents.title" },
];

export function SupportSidebar() {
	const t = useTranslations();
	const pathname = usePathname();
	return (
		<aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-64 shrink-0 pr-4 pt-2 md:block">
			<nav className="grid gap-1 text-sm">
				{items.map((i) => {
					const active = pathname === i.href;
					return (
						<Link
							key={i.href}
							href={i.href}
							className={`rounded px-2 py-1.5 ${active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
						>
							{t(i.labelKey)}
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}
