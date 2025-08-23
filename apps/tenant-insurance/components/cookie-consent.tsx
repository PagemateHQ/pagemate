"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export function CookieConsent() {
	const t = useTranslations();
	const [visible, setVisible] = useState(false);
	useEffect(() => {
		// Always show on each page load regardless of prior choice
		setVisible(true);
	}, []);
	if (!visible) return null;
	return (
		<div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl rounded-md border bg-background p-4 shadow-md" role="banner" aria-label="Cookie consent notice">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" aria-label="Cookie consent content">
				<p className="text-sm text-muted-foreground" aria-label="Cookie policy message">
					{t.rich("Common.cookie.message", {
						privacy: (chunks) => (
							<Link href="/privacy" className="underline" aria-label="View privacy policy">
								{chunks}
							</Link>
						),
					})}
				</p>
				<div className="flex gap-2" aria-label="Cookie consent actions">
					<Button
						variant="secondary"
						aria-label="Decline cookies"
						onClick={() => {
							localStorage.setItem("cookie-consent:v1", "declined");
							setVisible(false);
						}}
					>
						{t("Common.actions.decline")}
					</Button>
					<Button
						aria-label="Accept cookies"
						onClick={() => {
							localStorage.setItem("cookie-consent:v1", "accepted");
							setVisible(false);
						}}
					>
						{t("Common.actions.accept")}
					</Button>
				</div>
			</div>
		</div>
	);
}
