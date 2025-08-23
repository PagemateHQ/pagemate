import { createSharedPathnamesNavigation } from "next-intl/navigation";

export const locales = ["en", "ko"] as const;
export type Locale = (typeof locales)[number];

// Always prefix routes with the locale (e.g., /en, /ko)
export const localePrefix = "always" as const;

// Keep defaultLocale in a single place to share across middleware and helpers
export const defaultLocale: Locale = "ko";

export const routing = {
    locales: locales as readonly string[],
    defaultLocale,
    localePrefix,
} as const;

export const { Link, useRouter, usePathname, redirect } =
    createSharedPathnamesNavigation({
        locales,
        localePrefix,
    });
