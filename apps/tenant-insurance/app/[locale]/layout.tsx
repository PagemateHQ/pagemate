import type { Metadata } from "next";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { CookieConsent } from "@/components/cookie-consent";
import { DisclaimerBar } from "@/components/disclaimer-bar";
import { GTM } from "@/components/gtm";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TaskTimer } from "@/components/task-timer";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { locales } from "@/i18n/routing";

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}>) {
	const { locale } = use(params);
	setRequestLocale(locale);
	const messages = useMessages();
	return (
		<NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
			<ThemeProvider>
				<GTM />
				<div className="flex min-h-screen flex-col">
					<DisclaimerBar />
					<SiteHeader />
					<main className="container mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
						{children}
					</main>
					<SiteFooter />
				</div>
				<Toaster richColors position="bottom-center" />
				<TaskTimer />
				<CookieConsent />
			</ThemeProvider>
		</NextIntlClientProvider>
	);
}
