import QuoteForm from "@/components/quote-form"

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const initialPlan = (params.plan as string) ?? "Standard"
  return <QuoteForm initialPlan={initialPlan} />
}
