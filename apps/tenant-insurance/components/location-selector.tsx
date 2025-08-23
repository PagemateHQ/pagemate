"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const states = ["CA", "NY", "TX", "IL", "FL", "WA", "MA", "GA", "PA", "AZ"];

export function LocationSelector() {
	const t = useTranslations();
	const [state, setState] = useState<string>("CA");
	useEffect(() => {
		// Always default to CA on (re)load for the demo
		setState("CA");
		try {
			localStorage.setItem("state-selector:v1", "CA");
		} catch {}
	}, []);
	function onChange(v: string) {
		setState(v);
		localStorage.setItem("state-selector:v1", v);
	}
	return (
		<Select value={state} onValueChange={onChange} aria-label="Select state or location">
			<SelectTrigger className="w-[160px]" aria-label="State selection dropdown">
				<SelectValue placeholder={t("Common.labels.state")} />
			</SelectTrigger>
			<SelectContent aria-label="Available states">
				{states.map((s) => (
					<SelectItem key={s} value={s} aria-label={`Select state ${s}`}>
						{s}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
