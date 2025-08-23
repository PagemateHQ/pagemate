import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PagemateProvider } from "../components/pagemate-provider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	metadataBase: new URL("https://example.com"),
	title: {
		default: "Acme Insurance",
		template: "%s | Acme Insurance",
	},
	description: "Simple and affordable insurance for tenants. Get a quote in minutes.",
	keywords: ["insurance", "tenant insurance", "renters insurance", "home insurance"],
	openGraph: {
		title: "Acme Insurance",
		description: "Simple and affordable insurance for tenants. Get a quote in minutes.",
		type: "website",
		url: "https://example.com",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<PagemateProvider>
					{children}
				</PagemateProvider>
			</body>
		</html>
	);
}
