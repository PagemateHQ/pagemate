import QuoteForm from "@/components/quote-form";
import { locales } from "@/i18n/routing";

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export default async function QuotePage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const sp = await searchParams;
	const initialPlan = (sp["plan"] as string) ?? "Standard";
	return <QuoteForm initialPlan={initialPlan} />;
}
