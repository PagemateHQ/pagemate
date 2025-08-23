"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export function DisclaimerBar() {
	const t = useTranslations();
	const [state, setState] = useState<string>("CA");
	useEffect(() => {
		const v = localStorage.getItem("state-selector:v1");
		if (v) setState(v);
	}, []);
	// Show state-specific disclaimer when available; otherwise fall back to default
	const stateSpecific = new Set(["CA", "NY", "TX", "FL"]);
	const key = stateSpecific.has(state)
		? `Common.disclaimer.${state}`
		: "Common.disclaimer.default";
	const msg = t(key);
	return (
		<div className="border-b bg-muted/30 py-2 text-center text-xs text-muted-foreground">
			{msg}
		</div>
	);
}
