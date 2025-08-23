import { getRequestConfig } from "next-intl/server";
import { routing } from "@/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
    // Await potentially undefined request locale
    let locale = await requestLocale;

    // Ensure a valid locale is always returned
    if (typeof locale !== "string" || !routing.locales.includes(locale)) {
        locale = routing.defaultLocale;
    }

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
    };
});
