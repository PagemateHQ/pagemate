"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTaskStore } from "@/lib/task-store";

function estimateMonthlyPremium({
	propertyValue,
	zip,
	plan,
}: {
	propertyValue: number;
	zip: string;
	plan: string;
}) {
	const base = plan === "Plus" ? 24 : plan === "Standard" ? 16 : 10;
	const risk = /^9/.test(zip) ? 1.1 : /^1/.test(zip) ? 0.95 : 1;
	const propAdj = Math.min(1 + propertyValue / 100000, 1.5);
	const premium = Math.max(8, Math.round(base * risk * propAdj));
	return premium;
}

export default function QuoteForm({ initialPlan }: { initialPlan: string }) {
	const t = useTranslations();
	const [plan, setPlan] = React.useState(initialPlan);
	const [zip, setZip] = React.useState("");
	const [propertyValue, setPropertyValue] = React.useState(25000);
	const [email, setEmail] = React.useState("");
	const [notes, setNotes] = React.useState("");

	const premium = estimateMonthlyPremium({ propertyValue, zip, plan });

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
        try {
            // Detect Task 3 criteria via state + notes (English or Korean)
            const note = notes || "";

            // Car keywords: English + Korean (자동차, 차량)
            const mentionsCar = /(\bcar\b|\bauto\b|vehicle|자동차|차량)/i.test(note);
            // Home keywords: English + Korean (주택, 집)
            const mentionsHome = /(\bhome\b|house|주택|집)/i.test(note);
            // Amounts: $20k or $20,000 or Korean "2만(달러/불)"
            const mentions20k = /(\$?\s*20k|\$?\s*20[, ]?000|2\s*만(?:\s*(?:달러|불))?)/i.test(note);
            // Amounts: $1M or $1,000,000 or Korean "100만/백만 (달러/불)"
            const mentions1m = /(\$?\s*1m|\$?\s*1[, ]?000[, ]?000|100\s*만(?:\s*(?:달러|불))?|백\s*만(?:\s*(?:달러|불))?|1\s*백\s*만(?:\s*(?:달러|불))?)/i.test(note);
            const selectedState =
                typeof window !== "undefined"
                    ? localStorage.getItem("state-selector:v1")
                    : null;
            const isMA = selectedState === "MA";
            const matched = isMA && mentionsCar && mentions20k && mentionsHome && mentions1m;

            // Always enforce gating: if conditions are not met, reject with an error toast.
            if (!matched) {
                const { toast } = await import("@/components/ui/sonner");
                toast.error(t("Quote.toastInvalid.title"), {
                    description: t("Quote.toastInvalid.desc"),
                });
                return;
            }

            // Proceed with normal submission
            const res = await fetch("/api/estimate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan, zip, propertyValue }),
            });
            const { premium: serverPremium } = await res.json();
            const quote = serverPremium ?? premium;
            const { toast } = await import("@/components/ui/sonner");
            toast.success(t("Quote.toastOk.title", { email }), {
                description: t("Quote.toastOk.desc", { plan, price: quote }),
            });

            // If Task 3 matched, stop the timer to mark completion
            if (matched) {
                useTaskStore.getState().stop();
            }
        } catch (_err) {
            const { toast } = await import("@/components/ui/sonner");
            toast.error(t("Quote.toastErr.title"), {
                description: t("Quote.toastErr.desc"),
            });
        }
	}

	return (
		<div className="grid gap-6 md:grid-cols-2">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">
					{t("Quote.title")}
				</h1>
				<p className="text-muted-foreground">{t("Quote.desc")}</p>
			</div>

			<Card className="md:col-span-2">
				<CardContent className="p-6">
					<form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
						<div className="grid gap-2">
							<Label htmlFor="plan">{t("Common.labels.plan")}</Label>
							<Select value={plan} onValueChange={setPlan}>
								<SelectTrigger id="plan" aria-label="Plan">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Essential">
										{t("Home.plan.Essential")}
									</SelectItem>
									<SelectItem value="Standard">
										{t("Home.plan.Standard")}
									</SelectItem>
									<SelectItem value="Plus">{t("Home.plan.Plus")}</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="zip">{t("Common.labels.zip")}</Label>
							<Input
								id="zip"
								inputMode="numeric"
								maxLength={5}
								value={zip}
								onChange={(e) => setZip(e.target.value.replace(/[^0-9]/g, ""))}
								placeholder={t("Common.placeholders.zip")}
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="propertyValue">
								{t("Common.labels.personalProperty")}
							</Label>
							<Input
								id="propertyValue"
								inputMode="numeric"
								value={propertyValue}
								onChange={(e) =>
									setPropertyValue(
										Number(e.target.value.replace(/[^0-9]/g, "")) || 0,
									)
								}
								placeholder="25000"
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="email">{t("Common.labels.email")}</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder={t("Common.placeholders.email")}
								required
							/>
						</div>
						<div className="grid gap-2 sm:col-span-2">
							<Label htmlFor="notes">{t("Common.labels.notes")}</Label>
							<Textarea
								id="notes"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder={t("Common.placeholders.notes")}
							/>
						</div>
						<div className="sm:col-span-2 flex items-center justify-between">
							<div className="text-sm text-muted-foreground">
								{t("Common.labels.estimatedPremium")}:{" "}
								<span className="font-medium">
									${premium}
									{t("Home.plan.mo")}
								</span>
							</div>
							<Button type="submit">{t("Common.actions.emailQuote")}</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
