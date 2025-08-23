import QuoteForm from "@/components/quote-form";

export default async function QuotePage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const sp = await searchParams;
	const initialPlan = (sp["plan"] as string) ?? "Standard";
	return <QuoteForm initialPlan={initialPlan} />;
}
