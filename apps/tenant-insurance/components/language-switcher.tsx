"use client";

import { useLocale, useTranslations } from "next-intl";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "@/i18n/routing";

export function LanguageSwitcher() {
	const locale = useLocale() as "en" | "ko";
	const pathname = usePathname();
	const router = useRouter();
	const t = useTranslations();

	function onChange(next: string) {
		router.replace(pathname, { locale: next as "en" | "ko" });
	}

	return (
		<Select value={locale} onValueChange={onChange}>
			<SelectTrigger className="w-[120px]">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="en">{t("Common.language.en")}</SelectItem>
				<SelectItem value="ko">{t("Common.language.ko")}</SelectItem>
			</SelectContent>
		</Select>
	);
}
