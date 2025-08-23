import {getTranslations} from 'next-intl/server'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default async function FAQPage() {
  const t = await getTranslations()
  const items = t.raw('FAQ.items') as Array<{q: string; a: string}>
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t('FAQ.title')}</h1>
        <p className="text-muted-foreground">{t('FAQ.desc')}</p>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {items.map(({ q, a }, i) => (
          <AccordionItem key={q} value={`item-${i}`}>
            <AccordionTrigger>{q}</AccordionTrigger>
            <AccordionContent>{a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

