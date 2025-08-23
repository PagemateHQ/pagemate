import createMiddleware from "next-intl/middleware";
import { localePrefix, locales, defaultLocale } from "./i18n/routing";

export default createMiddleware({
	locales,
	defaultLocale,
	localePrefix,
});

export const config = {
	// Skip all paths that should not be internationalized
	matcher: ["/((?!api|_next|.*\\..*).*)"],
};
