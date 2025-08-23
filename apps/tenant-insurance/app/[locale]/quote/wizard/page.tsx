"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import * as React from "react";
import { Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const schema = z.object({
	plan: z.enum(["Essential", "Standard", "Plus"]),
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	email: z.string().email(),
	zip: z.string().regex(/^\d{5}$/),
	state: z.string().length(2).toUpperCase(),
	buildingType: z.enum(["apartment", "house", "condo"]),
	propertyValue: z.number().min(5000).max(250000),
	priorClaims: z.number().min(0).max(5),
	deductible: z.union([z.literal(250), z.literal(500), z.literal(1000)]),
	endorsements: z.object({
		jewelry: z.boolean(),
		electronics: z.boolean(),
		identityTheft: z.boolean(),
		waterBackup: z.boolean(),
	}),
});

type FormValues = z.infer<typeof schema>;

function WizardContent() {
	const t = useTranslations();
	const steps = t.raw("Wizard.steps") as string[];
	const searchParams = useSearchParams();
	const router = useRouter();
	const initialPlan =
		(searchParams.get("plan") as FormValues["plan"]) || undefined;
	React.useEffect(() => {
		if (
			!initialPlan ||
			!["Essential", "Standard", "Plus"].includes(initialPlan)
		) {
			router.replace("/plans");
		}
	}, [initialPlan, router]);

	const form = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			plan: initialPlan ?? "Standard",
			firstName: "",
			lastName: "",
			email: "",
			zip: "",
			state: "CA",
			buildingType: "apartment",
			propertyValue: 25000,
			priorClaims: 0,
			deductible: 500,
			endorsements: {
				jewelry: false,
				electronics: false,
				identityTheft: false,
				waterBackup: false,
			},
		},
		mode: "onBlur",
	});

	const [step, setStep] = React.useState(0);
	const progress = ((step + 1) / steps.length) * 100;

	useEffect(() => {
		const saved = localStorage.getItem("quote-wizard:v1");
		if (saved) {
			try {
				form.reset(JSON.parse(saved));
			} catch {}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	useEffect(() => {
		const sub = form.watch((v) =>
			localStorage.setItem("quote-wizard:v1", JSON.stringify(v)),
		);
		return () => sub.unsubscribe();
	}, [form]);

	async function computeEstimate(values: FormValues) {
		const res = await fetch("/api/estimate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				plan: values.plan,
				zip: values.zip,
				state: values.state,
				propertyValue: values.propertyValue,
				buildingType: values.buildingType,
				priorClaims: values.priorClaims,
				deductible: values.deductible,
				endorsements: values.endorsements,
			}),
		});
		return (await res.json()) as {
			premium: number;
			breakdown: import("@/lib/rating").RatingBreakdown;
		};
	}

	const [quote, setQuote] = React.useState<{
		premium: number;
		breakdown: import("@/lib/rating").RatingBreakdown;
	} | null>(null);

	async function next() {
		if (step < steps.length - 1) setStep(step + 1);
		if (step === steps.length - 2) {
			const values = form.getValues();
			const q = await computeEstimate(values);
			setQuote(q);
		}
	}
	function prev() {
		if (step > 0) setStep(step - 1);
	}

	function onSubmit() {
		import("@/components/ui/sonner").then(({ toast }) =>
			toast.success(t("Wizard.submitOk.title"), {
				description: t("Wizard.submitOk.desc"),
			}),
		);
	}

	const planLabel = (p: "Essential" | "Standard" | "Plus") =>
		t(`Home.plan.${p}`);

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">
					{t("Wizard.title")}
				</h1>
				<p className="text-muted-foreground">{t("Wizard.desc")}</p>
			</div>

			<Progress value={progress} />

			<Card>
				<CardContent className="p-6">
					<div className="mb-4 text-sm text-muted-foreground">
						{t("Common.labels.step", {
							step: step + 1,
							total: steps.length,
							label: steps[step],
						})}
					</div>

					{step === 0 && (
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="grid gap-2">
								<Label htmlFor="firstName">
									{t("Common.labels.firstName")}
								</Label>
								<Input id="firstName" {...form.register("firstName")} />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="lastName">{t("Common.labels.lastName")}</Label>
								<Input id="lastName" {...form.register("lastName")} />
							</div>
							<div className="grid gap-2 sm:col-span-2">
								<Label htmlFor="email">{t("Common.labels.email")}</Label>
								<Input id="email" type="email" {...form.register("email")} />
							</div>
							<div className="grid gap-2 sm:col-span-2">
								<Label>{t("Common.labels.plan")}</Label>
								<RadioGroup
									value={form.watch("plan")}
									onValueChange={(v) =>
										form.setValue("plan", v as FormValues["plan"])
									}
									className="grid grid-cols-3 gap-2"
								>
									{(["Essential", "Standard", "Plus"] as const).map((p) => (
										<div
											key={p}
											className="flex items-center gap-2 rounded-md border p-3"
										>
											<RadioGroupItem value={p} id={`plan-${p}`} />
											<Label htmlFor={`plan-${p}`} className="cursor-pointer">
												{planLabel(p)}
											</Label>
										</div>
									))}
								</RadioGroup>
							</div>
						</div>
					)}

					{step === 1 && (
						<div className="grid gap-4 sm:grid-cols-3">
							<div className="grid gap-2">
								<Label htmlFor="zip">{t("Common.labels.zipShort")}</Label>
								<Input id="zip" maxLength={5} {...form.register("zip")} />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="state">{t("Common.labels.state")}</Label>
								<Input id="state" maxLength={2} {...form.register("state")} />
							</div>
							<div className="grid gap-2">
								<Label>{t("Common.labels.buildingType")}</Label>
								<Select
									value={form.watch("buildingType")}
									onValueChange={(v) =>
										form.setValue(
											"buildingType",
											v as FormValues["buildingType"],
										)
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="apartment">
											{t("Common.buildingTypes.apartment")}
										</SelectItem>
										<SelectItem value="condo">
											{t("Common.buildingTypes.condo")}
										</SelectItem>
										<SelectItem value="house">
											{t("Common.buildingTypes.house")}
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					)}

					{step === 2 && (
						<div className="grid gap-6">
							<div className="grid gap-2">
								<Label>
									{t("Common.labels.personalProperty")} (
									{form.watch("propertyValue")})
								</Label>
								<Slider
									min={5000}
									max={250000}
									step={5000}
									value={[form.watch("propertyValue")]}
									onValueChange={([v]) => form.setValue("propertyValue", v)}
								/>
							</div>
							<div className="grid gap-2">
								<Label>{t("Common.labels.deductible")}</Label>
								<Tabs
									value={String(form.watch("deductible"))}
									onValueChange={(v) =>
										form.setValue(
											"deductible",
											Number(v) as FormValues["deductible"],
										)
									}
								>
									<TabsList>
										<TabsTrigger value="250">$250</TabsTrigger>
										<TabsTrigger value="500">$500</TabsTrigger>
										<TabsTrigger value="1000">$1000</TabsTrigger>
									</TabsList>
								</Tabs>
							</div>
							<div className="grid gap-2">
								<Label>{t("Common.labels.endorsements")}</Label>
								<div className="grid gap-2 sm:grid-cols-2">
									{(
										[
											{ key: "jewelry" },
											{ key: "electronics" },
											{ key: "identityTheft" },
											{ key: "waterBackup" },
										] as const
									).map(({ key }) => (
										<label key={key} className="flex items-center gap-2">
											<Checkbox
												checked={form.watch("endorsements")[key]}
												onCheckedChange={(v) => {
													const current = form.getValues("endorsements");
													form.setValue("endorsements", {
														...current,
														[key]: Boolean(v),
													});
												}}
											/>
											<span>{t(`Common.endorsementsMap.${key}` as any)}</span>
										</label>
									))}
								</div>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="priorClaims">
									{t("Common.labels.priorClaims")}
								</Label>
								<Input
									id="priorClaims"
									inputMode="numeric"
									value={form.watch("priorClaims")}
									onChange={(e) =>
										form.setValue(
											"priorClaims",
											Number(e.target.value.replace(/[^0-9]/g, "")),
										)
									}
								/>
							</div>
						</div>
					)}

					{step === 3 && (
						<div className="grid gap-6">
							<div className="text-sm text-muted-foreground">
								{t("Wizard.review.helper")}
							</div>
							<div className="grid gap-2">
								<div>
									<span className="font-medium">{t("Wizard.review.plan")}</span>{" "}
									{planLabel(form.watch("plan"))}
								</div>
								<div>
									<span className="font-medium">{t("Wizard.review.zip")}</span>{" "}
									{form.watch("zip")}{" "}
									<span className="font-medium">
										{t("Wizard.review.state")}
									</span>{" "}
									{form.watch("state")}
								</div>
								<div>
									<span className="font-medium">
										{t("Wizard.review.property")}
									</span>{" "}
									${form.watch("propertyValue")}{" "}
									<span className="font-medium">
										{t("Wizard.review.deductible")}
									</span>{" "}
									${form.watch("deductible")}
								</div>
							</div>
							{quote && (
								<div className="grid gap-3">
									<div className="text-lg font-semibold">
										{t("Wizard.review.estimated", { price: quote.premium })}
									</div>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>{t("Common.labels.component")}</TableHead>
												<TableHead className="text-right">
													{t("Common.labels.amount")}
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{(
												[
													"base",
													"riskZip",
													"propertyAdj",
													"buildingAdj",
													"claimsAdj",
													"deductibleAdj",
												] as const
											).map((key) => (
												<TableRow key={key}>
													<TableCell className="capitalize">
														{key.replace(/([A-Z])/g, " $1").trim()}
													</TableCell>
													<TableCell className="text-right">
														${quote.breakdown[key]}
													</TableCell>
												</TableRow>
											))}
											{(
												Object.entries(quote.breakdown.endorsements) as Array<
													[keyof typeof quote.breakdown.endorsements, number]
												>
											).map(([k, v]) => (
												<TableRow key={`endorse-${String(k)}`}>
													<TableCell className="capitalize">
														{t("Wizard.table.endorsement", {
															key: t(
																`Common.endorsementsMap.${String(k)}` as any,
															),
														})}
													</TableCell>
													<TableCell className="text-right">${v}</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							)}
						</div>
					)}

					<div className="mt-6 flex items-center justify-between">
						<Button
							type="button"
							variant="secondary"
							onClick={prev}
							disabled={step === 0}
						>
							{t("Common.actions.back")}
						</Button>
						{step < steps.length - 1 ? (
							<Button type="button" onClick={next}>
								{t("Common.actions.next")}
							</Button>
						) : (
							<Button type="button" onClick={onSubmit}>
								{t("Common.actions.submitApplication")}
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default function QuoteWizardPage() {
	return (
		<Suspense
			fallback={
				<div className="space-y-6">
					<div className="h-6 w-40 rounded bg-muted/50" />
					<div className="h-2 w-full rounded bg-muted/40" />
					<div className="h-64 rounded border" />
				</div>
			}
		>
			<WizardContent />
		</Suspense>
	);
}
