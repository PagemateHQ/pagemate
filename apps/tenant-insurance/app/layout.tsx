import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
		default: "아무개 보험",
		template: "%s | 아무개 보험",
	},
	description: "임차인을 위한 간단하고 합리적인 보험. 몇 분 만에 견적 받기.",
	keywords: ["보험", "임차인 보험", "세입자 보험", "주택 보험"],
	openGraph: {
		title: "아무개 보험",
		description: "임차인을 위한 간단하고 합리적인 보험. 몇 분 만에 견적 받기.",
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
				{children}
			</body>
		</html>
	);
}
