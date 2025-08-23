import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TaskTimer } from "@/components/task-timer"
import { CookieConsent } from "@/components/cookie-consent"
import { GTM } from "@/components/gtm"
import { DisclaimerBar } from "@/components/disclaimer-bar"

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
      </body>
    </html>
  )
}
