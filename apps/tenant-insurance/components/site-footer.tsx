import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";

export async function SiteFooter() {
	const t = await getTranslations();
	return (
		<footer className="border-t py-8" aria-label="Site footer">
			<div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-sm text-muted-foreground" aria-label="Footer content">
				<div className="flex flex-col gap-6" aria-label="Footer sections">
					<div className="flex justify-center" aria-label="Footer logo">
						<Image
							src="/logo.png"
							alt="Acme Insurance"
							width={200}
							height={60}
							className="h-14 w-auto"
						/>
					</div>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" aria-label="Footer links and copyright">
						<p>
							{t("Common.footer.copyright", { year: new Date().getFullYear() })}
						</p>
						<div className="flex items-center gap-4" aria-label="Footer navigation links">
							<Link href="/privacy" className="hover:underline" aria-label="Privacy policy">
								{t("Common.footer.privacy")}
							</Link>
							<Link href="/terms" className="hover:underline" aria-label="Terms of service">
								{t("Common.footer.terms")}
							</Link>
							<Link href="/agents" className="hover:underline" aria-label="Local Offices">
								{t("Common.footer.agents")}
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
