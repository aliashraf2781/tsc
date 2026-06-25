import type { ContactFaq } from "@/features/contact/types/contact.types"

export function getContactFaqs(): ContactFaq[] {
  return [
    { id: "fees", questionKey: "fees.question", answerKey: "fees.answer" },
    { id: "language", questionKey: "language.question", answerKey: "language.answer" },
    { id: "timeline", questionKey: "timeline.question", answerKey: "timeline.answer" },
    { id: "documents", questionKey: "documents.question", answerKey: "documents.answer" },
  ]
}

