"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/routing";

export default function ClaimsPage() {
	const t = useTranslations();
	const [submitted, setSubmitted] = React.useState(false);
	const [claimId, setClaimId] = React.useState<string | null>(null);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		try {
			const res = await fetch("/api/claims", {
				method: "POST",
				body: JSON.stringify(Object.fromEntries(form.entries())),
			});
			const data = await res.json();
			setClaimId(data.id ?? null);
			setSubmitted(true);
			const { toast } = await import("@/components/ui/sonner");
			toast.success(t("Claims.toastOk.title"), {
				description: data.id
					? t("Claims.toastOk.desc", { id: data.id })
					: undefined,
			});
		} catch {
			const { toast } = await import("@/components/ui/sonner");
			toast.error(t("Claims.toastErr.title"), {
				description: t("Claims.toastErr.desc"),
			});
		}
	}

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">
					{t("Claims.title")}
				</h1>
				<p className="text-muted-foreground">{t("Claims.desc")}</p>
			</div>

			<Card>
				{submitted ? (
					<>
						<CardHeader>
							<CardTitle>{t("Claims.thanksTitle")}</CardTitle>
							<CardDescription>
								{t("Claims.thanksDesc", { id: claimId ?? "pending" })}
							</CardDescription>
						</CardHeader>
						<CardContent />
					</>
				) : (
					<>
						<CardHeader>
							<CardTitle>{t("Claims.details.title")}</CardTitle>
							<CardDescription>{t("Claims.details.desc")}</CardDescription>
						</CardHeader>
						<CardContent>
							<form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
								<div className="grid gap-2 sm:col-span-2">
									<Label htmlFor="name">{t("Common.labels.fullName")}</Label>
									<Input
										id="name"
										required
										placeholder={t("Common.placeholders.name")}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="email">{t("Common.labels.email")}</Label>
									<Input
										id="email"
										type="email"
										required
										placeholder={t("Common.placeholders.email")}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="phone">{t("Common.labels.phone")}</Label>
									<Input
										id="phone"
										inputMode="tel"
										placeholder={t("Common.placeholders.phone")}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="date">
										{t("Common.labels.dateOfIncident")}
									</Label>
									<Input id="date" type="date" required />
								</div>
								<div className="grid gap-2">
									<Label htmlFor="type">{t("Common.labels.typeOfLoss")}</Label>
									<Input
										id="type"
										placeholder={t("Common.placeholders.typeOfLoss")}
										required
									/>
								</div>
								<div className="grid gap-2 sm:col-span-2">
									<Label htmlFor="desc">
										{t("Common.labels.whatHappened")}
									</Label>
									<Textarea
										id="desc"
										required
										placeholder={t("Common.placeholders.desc")}
									/>
								</div>
								<div className="sm:col-span-2">
									<Button type="submit">
										{t("Common.actions.submitClaim")}
									</Button>
								</div>
							</form>
						</CardContent>
					</>
				)}
			</Card>

			<p className="text-xs text-muted-foreground">
				{t.rich("Claims.trackLink", {
					here: (chunks: React.ReactNode) => (
						<Link href="/claims/track" className="underline">
							{chunks}
						</Link>
					),
				})}
			</p>
		</div>
	);
}
