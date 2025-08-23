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
		<div className="space-y-6" aria-label="Insurance plans page">
			<div className="space-y-1" aria-label="Page header">
				<h1 className="text-2xl font-semibold tracking-tight" aria-label="Page title">
					{t("Plans.title")}
				</h1>
				<p className="text-muted-foreground" aria-label="Page description">{t("Plans.desc")}</p>
			</div>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Plans comparison grid">
				{plans.map((p) => (
					<Link
						href={{ pathname: "/quote", query: { plan: p.key } }}
						key={p.key}
						aria-label={`Get quote for ${p.name} plan`}
					>
						<Card className="flex flex-col h-full overflow-hidden" aria-label={`${p.name} plan details`}>
							<div className="flex justify-center bg-gradient-to-b from-muted/50 to-background p-4" aria-label="Plan illustration">
								<img
									src={`/plan-${p.key.toLowerCase()}.png`}
									alt={`${p.name} plan illustration`}
									className="h-auto w-[200px] object-contain"
									aria-describedby={`plan-${p.key.toLowerCase()}-info`}
								/>
							</div>
							<CardHeader aria-label="Plan header">
								<div className="flex items-start justify-between gap-2" aria-label="Plan name and badge">
									<div aria-label="Plan title and description">
										<CardTitle>{p.name}</CardTitle>
										<CardDescription>{p.tagline}</CardDescription>
									</div>
									{p.popular ? (
										<Badge variant="secondary" aria-label="Popular plan indicator">{t("Plans.popular")}</Badge>
									) : null}
								</div>
							</CardHeader>
							<CardContent aria-label="Plan pricing and features">
								<div aria-label="Plan pricing">
									<span className="text-2xl font-semibold" aria-label="Monthly price">${p.price}</span>
									<span className="text-sm text-muted-foreground" aria-label="Billing period">
										{t("Home.plan.mo")}
									</span>
								</div>
								<ul className="mt-4 grid gap-2 text-sm text-muted-foreground" aria-label="Plan features list">
									{p.features.map((f) => (
										<li key={f} aria-label="Plan feature">• {f}</li>
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
