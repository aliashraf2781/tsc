import { getTranslations } from "next-intl/server"
import { SectionShell } from "@/features/shared-home"
import { getFooterQuickLinkKeys } from "@/features/footer/services/footer-links.service"

export async function FooterSection() {
  const t = await getTranslations("Landing.footer")
  const links = getFooterQuickLinkKeys()

  return (
    <footer id="contact" className="relative overflow-hidden bg-[#001222] py-[56px] text-white">
      <SectionShell>
        <div className="grid gap-10 border-b border-[#003F64] pb-6 md:grid-cols-[1.2fr_0.8fr_1fr]">
          <div className="space-y-4">
            <p className="text-[32px] leading-[1.16] font-semibold">{t("brand")}</p>
            <p className="max-w-[420px] text-[16px] leading-normal font-normal text-[#c4d9e8]">{t("description")}</p>
            <div className="flex gap-3">
              <span className="h-10 w-10 rounded-full bg-[#005685]" />
              <span className="h-10 w-10 rounded-full bg-[#005685]" />
              <span className="h-10 w-10 rounded-full bg-[#005685]" />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[20px] leading-[1.16] font-semibold">{t("quickLinks.title")}</p>
            <ul className="space-y-2 text-[16px] leading-[1.16] font-normal text-[#d7e7f1]">
              {links.map((key) => (
                <li key={key}>{t(`quickLinks.items.${key}`)}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2 text-[16px] leading-[1.16] font-normal text-[#d7e7f1]">
            <p className="text-[20px] leading-[1.16] font-semibold text-white">{t("contact.title")}</p>
            <p>{t("contact.phone")}</p>
            <p>{t("contact.email")}</p>
            <p>{t("contact.address")}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-[14px] leading-normal font-medium text-[#c4d9e8]">
          <p>{t("copyright")}</p>
          <div className="flex items-center gap-4">
            <span>{t("terms")}</span>
            <span className="h-4 w-px bg-[#40A0CA]" />
            <span>{t("faqs")}</span>
            <span className="h-4 w-px bg-[#40A0CA]" />
            <span>{t("privacy")}</span>
          </div>
        </div>
      </SectionShell>
    </footer>
  )
}