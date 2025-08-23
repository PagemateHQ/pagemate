import { getTranslations, setRequestLocale } from "next-intl/server";
import { locales } from "@/i18n/routing";

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export default async function PrivacyPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations();
	return (
		<div className="prose prose-sm dark:prose-invert max-w-none">
			<h1>{t("Legal.privacyTitle")}</h1>
			<p>{t("Legal.privacyBody")}</p>
		</div>
	);
}
