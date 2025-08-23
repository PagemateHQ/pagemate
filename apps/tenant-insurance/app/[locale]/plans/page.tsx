import { getTranslations, setRequestLocale } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Link, locales } from "@/i18n/routing";

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export default async function PlansPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations();

	const plans = [
		{
			key: "Essential" as const,
			name: t("Home.plan.Essential"),
			price: 10,
			tagline: t("Plans.tagline.Essential"),
			features: t.raw("Home.plan.features.essential") as string[],
		},
		{
			key: "Standard" as const,
			name: t("Home.plan.Standard"),
			price: 18,
			tagline: t("Plans.tagline.Standard"),
			features: t.raw("Home.plan.features.standard") as string[],
			popular: true,
		},
		{
			key: "Plus" as const,
			name: t("Home.plan.Plus"),
			price: 28,
			tagline: t("Plans.tagline.Plus"),
			features: t.raw("Home.plan.features.plus") as string[],
		},
	];

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">
					{t("Plans.title")}
				</h1>
				<p className="text-muted-foreground">{t("Plans.desc")}</p>
			</div>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{plans.map((p) => (
					<Link
						href={{ pathname: "/quote", query: { plan: p.key } }}
						key={p.key}
					>
						<Card className="flex flex-col h-full">
							<CardHeader>
								<div className="flex items-start justify-between gap-2">
									<div>
										<CardTitle>{p.name}</CardTitle>
										<CardDescription>{p.tagline}</CardDescription>
									</div>
									{p.popular ? (
										<Badge variant="secondary">{t("Plans.popular")}</Badge>
									) : null}
								</div>
							</CardHeader>
							<CardContent>
								<div>
									<span className="text-2xl font-semibold">${p.price}</span>
									<span className="text-sm text-muted-foreground">
										{t("Home.plan.mo")}
									</span>
								</div>
								<ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
									{p.features.map((f) => (
										<li key={f}>• {f}</li>
									))}
								</ul>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
}
