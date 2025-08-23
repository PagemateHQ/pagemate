"use client";

import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

export function ThemedCard({ children, className, ...props }: React.ComponentProps<typeof Card>) {
	const { theme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		// Avoid hydration mismatch by not rendering the background until mounted
		return <Card className={className} {...props}>{children}</Card>;
	}

	const isDark = theme === "dark" || resolvedTheme === "dark";
	const backgroundImage = isDark ? "/card-bg-dark.png" : "/card-bg-light.png";

	return (
		<Card
			className={className}
			style={{
				backgroundImage: `url('${backgroundImage}')`,
				backgroundSize: 'cover',
				backgroundPosition: 'top right',
				backgroundRepeat: 'no-repeat',
			}}
			{...props}
		>
			{children}
		</Card>
	);
}