import QuoteForm from "@/components/quote-form"

export default function QuotePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const initialPlan = (searchParams["plan"] as string) ?? "Standard"
  return <QuoteForm initialPlan={initialPlan} />
}
