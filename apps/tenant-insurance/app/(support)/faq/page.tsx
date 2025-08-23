import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    q: "What does renters insurance cover?",
    a: "Personal property (your stuff), personal liability, and additional living expenses if your home becomes uninhabitable due to a covered loss.",
  },
  {
    q: "Is water damage covered?",
    a: "Sudden and accidental water damage is typically covered. Floods usually require separate coverage.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel your policy at any time with no fees.",
  },
]

export default function FAQPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">FAQs</h1>
        <p className="text-muted-foreground">Answers to common questions.</p>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map(({ q, a }, i) => (
          <AccordionItem key={q} value={`item-${i}`}>
            <AccordionTrigger>{q}</AccordionTrigger>
            <AccordionContent>{a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

