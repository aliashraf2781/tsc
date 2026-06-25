import { getTranslations } from "next-intl/server"
import { LegalPageShell } from "@/features/legal/components/legal-page-shell"
import { loadLegalPageContent } from "@/features/legal/services/legal-content.service"

function buildFallbackSections() {
  return [
    {
      title: "Data collection",
      content:
        "We collect the information needed to provide onboarding, matching, and account support, including contact details and application history.",
    },
    {
      title: "Use of data",
      content:
        "Your data is used to create and improve your experience, communicate with you, and facilitate job or talent matching.",
    },
    {
      title: "Your rights",
      content:
        "You can request access, correction, or deletion of your data by contacting our support team.",
    },
  ]
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params
  const legalT = await getTranslations("LegalPages")
  const apiContent = await loadLegalPageContent(locale, "privacy")
  const sections = apiContent?.sections ?? buildFallbackSections()

  return (
    <LegalPageShell
      eyebrow={legalT("privacy.eyebrow")}
      title={legalT("privacy.title")}
      description={legalT("privacy.description")}
      actions={[
        { href: "/terms", label: legalT("privacy.termsAction") },
        { href: "/contact", label: legalT("privacy.contactAction") },
      ]}
    >
      <div className="space-y-4 rounded-[24px] border border-[#D4D4D4] bg-white px-4 py-6 sm:px-8">
        {sections.map((section) => (
          <section key={section.title} className="space-y-3 border-b border-[#E8E8E8] pb-5 last:border-b-0 last:pb-0">
            <h2 className="text-[20px] font-semibold text-[#171717]">{section.title}</h2>
            <p className="text-[16px] leading-[1.8] text-[#525252]">{section.content}</p>
          </section>
        ))}
      </div>
    </LegalPageShell>
  )
}
