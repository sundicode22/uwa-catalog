import { getTranslations } from "next-intl/server"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type FaqItem = {
  question: string
  answer: string
}

export async function LandingFaq() {
  const t = await getTranslations("landing")
  const faqItems = t.raw("faqItems") as FaqItem[]

  return (
    <section id="faq" className="border-t border-border py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">{t("faqEyebrow")}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("faqTitle")}
          </h2>
        </div>
        <Accordion
          type="single"
          collapsible
          defaultValue={faqItems[0]?.question}
          className="mx-auto mt-12 max-w-3xl rounded-2xl border border-border bg-card px-2"
        >
          {faqItems.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="px-4 text-base font-medium hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="px-4 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
