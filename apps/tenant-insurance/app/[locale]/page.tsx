import { CheckIcon, ShieldCheckIcon } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { TaskSelector } from "@/components/task-selector";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Link, locales } from "@/i18n/routing";

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export default async function Home({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations();
	const bullets = (t.raw("Home.bullets") as string[]) ?? [];
	const planFeatures = {
		Essential: t.raw("Home.plan.features.essential") as string[],
		Standard: t.raw("Home.plan.features.standard") as string[],
		Plus: t.raw("Home.plan.features.plus") as string[],
	};
	const plans = [
		{
			name: t("Home.plan.Essential"),
			key: "Essential",
			price: 10,
			features: planFeatures.Essential,
		},
		{
			name: t("Home.plan.Standard"),
			key: "Standard",
			price: 18,
			features: planFeatures.Standard,
		},
		{
			name: t("Home.plan.Plus"),
			key: "Plus",
			price: 28,
			features: planFeatures.Plus,
		},
	] as const;

	return (
		<div className="space-y-16" aria-label="Home page content">
			<TaskSelector />
			<section className="grid gap-6 md:grid-cols-2 md:gap-10" aria-label="Hero section">
				<div className="space-y-4" aria-label="Hero content">
					<img src="/3d-column.png" alt="Decorative 3D column illustration" className="h-[128px] w-[83px] object-fit" aria-hidden="true" />
					<h1 className="text-3xl font-semibold tracking-tight sm:text-4xl" aria-label="Main heading">
						{t("Home.heroTitle")}
					</h1>
					<p className="text-muted-foreground" aria-label="Hero description">{t("Home.heroDesc")}</p>
					<div className="flex flex-wrap gap-3" aria-label="Primary action buttons">
						<Button asChild aria-label="Get insurance quote">
							<Link href="/quote">{t("Common.actions.getQuote")}</Link>
						</Button>
						<Button asChild variant="secondary" aria-label="Explore insurance plans">
							<Link href="/plans">{t("Common.actions.explorePlans")}</Link>
						</Button>
					</div>
					<ul className="mt-4 grid gap-2 text-sm text-muted-foreground" aria-label="Key benefits list">
						{bullets.map((i) => (
							<li key={i} className="flex items-center gap-2" aria-label="Benefit item">
								<CheckIcon className="size-4 text-primary" aria-hidden="true" /> {i}
							</li>
						))}
					</ul>
				</div>
				<Card className="relative overflow-hidden" aria-label="Why choose us section">
					<CardHeader aria-label="Section header">
						<div className="flex items-center gap-3" aria-label="Section title with icon">
							<span className="inline-flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground" aria-hidden="true">
								<ShieldCheckIcon className="size-5" aria-hidden="true" />
							</span>
							<div>
								<CardTitle>{t("Home.whyTitle")}</CardTitle>
								<CardDescription>{t("Home.whyDesc")}</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent aria-label="Feature cards">
						<div className="grid gap-3 sm:grid-cols-2" aria-label="Feature grid">
							{[
								{ key: "flexible" as const },
								{ key: "fast" as const },
								{ key: "support" as const },
								{ key: "bundle" as const },
							].map(({ key }) => (
								<div key={key} className="rounded-md border p-4" aria-label={`${key} feature`}>
									<div className="font-medium" aria-label="Feature title">
										{t(`Home.whyCards.${key}.title`)}
									</div>
									<p className="text-sm text-muted-foreground" aria-label="Feature description">
										{t(`Home.whyCards.${key}.desc`)}
									</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</section>

			<section className="grid gap-6" aria-label="Insurance plans section">
				<h2 className="text-xl font-semibold tracking-tight" aria-label="Plans section heading">
					{t("Home.popularPlans")}
				</h2>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Insurance plans grid">
					{plans.map((plan) => (
						<Card key={plan.key} className="flex flex-col overflow-hidden" aria-label={`${plan.name} insurance plan`}>
							<div className="flex justify-center bg-gradient-to-b from-muted/50 to-background p-4" aria-label="Plan image">
								<img
									src={`/plan-${plan.key.toLowerCase()}.png`}
									alt={`${plan.name} plan illustration`}
									className="h-auto w-[200px] object-contain"
									aria-describedby={`plan-${plan.key.toLowerCase()}-description`}
								/>
							</div>
							<CardHeader aria-label="Plan details header">
								<div className="flex items-baseline justify-between" aria-label="Plan name and pricing">
									<CardTitle>{plan.name}</CardTitle>
									<div aria-label="Plan pricing">
										<span className="text-2xl font-semibold" aria-label="Monthly price">
											${plan.price}
										</span>
										<span className="text-sm text-muted-foreground" aria-label="Billing period">
											{t("Home.plan.mo")}
										</span>
									</div>
								</div>
							</CardHeader>
							<CardContent aria-label="Plan features list">
								<ul className="grid gap-2 text-sm text-muted-foreground" aria-label="Plan features">
									{plan.features.map((f) => (
										<li key={f} className="flex items-center gap-2" aria-label="Plan feature">
											<CheckIcon className="size-4 text-primary" aria-hidden="true" /> {f}
										</li>
									))}
								</ul>
							</CardContent>
							<CardFooter aria-label="Plan action">
								<Button asChild className="w-full" aria-label={`Get quote for ${plan.name} plan`}>
									<Link
										href={{ pathname: "/quote", query: { plan: plan.key } }}
									>
										{t("Common.actions.startWith", { plan: plan.name })}
									</Link>
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			</section>
		</div>
	);
}
