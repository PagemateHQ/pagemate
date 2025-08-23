import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function DisclosuresPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations();
	const items = t.raw("Legal.disclosuresItems") as string[];
	return (
		<div className="prose prose-sm dark:prose-invert max-w-none">
			<h1>{t("Legal.disclosuresTitle")}</h1>
			<p>{t("Legal.disclosuresBody")}</p>
			<ul>
				{items.map((i) => (
					<li key={i}>{i}</li>
				))}
			</ul>
		</div>
	);
}
