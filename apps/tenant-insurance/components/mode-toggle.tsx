"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
	const { theme, setTheme } = useTheme();
	const isDark = theme === "dark";
	return (
		<Button
			variant="ghost"
			size="icon"
			aria-label="Toggle theme"
			aria-describedby="theme-toggle-description"
			onClick={() => setTheme(isDark ? "light" : "dark")}
		>
			{isDark ? (
				<SunIcon className="size-5" aria-hidden="true" />
			) : (
				<MoonIcon className="size-5" aria-hidden="true" />
			)}
			<span id="theme-toggle-description" className="sr-only">
				{isDark ? "Switch to light mode" : "Switch to dark mode"}
			</span>
		</Button>
	);
}
