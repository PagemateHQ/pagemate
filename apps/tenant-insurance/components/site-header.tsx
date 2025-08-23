"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LocationSelector } from "@/components/location-selector";
import { ModeToggle } from "@/components/mode-toggle";
import { MobileNav } from "@/components/site-mobile-nav";
import { NavigationMenuDemo } from "@/components/site-nav";
import { Link } from "@/i18n/routing";

export function SiteHeader() {
	const t = useTranslations();
	return (
		<header className="relative z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60" aria-label="Site header">
			<div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<Link href="/" className="flex items-center -my-2" aria-label="Go to homepage">
					<Image
						src="/logo.png"
						alt="Acme Insurance"
						width={180}
						height={60}
						className="h-12 w-auto"
						priority
					/>
				</Link>
				<div className="flex items-center gap-2" aria-label="Site navigation and controls">
					<nav className="hidden md:block" aria-label="Main navigation">
						<NavigationMenuDemo />
					</nav>
					<div className="hidden sm:block" aria-label="Location selector">
						<LocationSelector />
					</div>
					<div className="hidden sm:block" aria-label="Language switcher">
						<LanguageSwitcher />
					</div>
					<ModeToggle />
					<div className="md:hidden">
						<MobileNav />
					</div>
				</div>
			</div>
		</header>
	);
}
