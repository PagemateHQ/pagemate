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
			onClick={() => setTheme(isDark ? "light" : "dark")}
		>
			{isDark ? (
				<SunIcon className="size-5" />
			) : (
				<MoonIcon className="size-5" />
			)}
		</Button>
	);
}
