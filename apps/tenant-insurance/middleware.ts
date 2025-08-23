import createMiddleware from 'next-intl/middleware'
import {locales, localePrefix} from './i18n/routing'

export default createMiddleware({
  locales,
  defaultLocale: 'ko',
  localePrefix,
})

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
