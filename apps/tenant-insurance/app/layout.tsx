import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { getLocale } from "next-intl/server"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "Acme Insurance",
    template: "%s | Acme Insurance",
  },
  description:
    "Simple, affordable coverage for renters. Get a quote in minutes.",
  keywords: [
    "insurance",
    "renters insurance",
    "tenant insurance",
    "home insurance",
  ],
  openGraph: {
    title: "Acme Insurance",
    description:
      "Simple, affordable coverage for renters. Get a quote in minutes.",
    type: "website",
    url: "https://example.com",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
