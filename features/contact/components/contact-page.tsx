import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ContactInfoCard } from "./contact-info-card"
import { getContactFaqs } from "@/features/contact/services/contact-faqs.service"
import { SectionShell, StaggerInView, StaggerItem } from "@/features/shared-home"
import { getTranslations, getLocale } from "next-intl/server"
import Image from "next/image"
import { getSettings } from "@/lib/api/services/settings.service"
import { ContactForm } from "./contact-form"

export async function ContactPage() {
  const t = await getTranslations("Landing.contact")
  const locale = await getLocale()
  const faqs = getContactFaqs()

  let contactAddress = "123 Business St, Berlin, Germany"
  let contactEmail = "info@tsc-jobs.com"
  let contactPhone = "+49 30 123456"
  let contactLatitude = "52.5200"
  let contactLongitude = "13.4050"
  let googleMapsApiKey = ""

  try {
    const settings = await getSettings(locale)
    const addressSetting = settings.find((s) => s.key === "contact_address")
    const emailSetting = settings.find((s) => s.key === "contact_email")
    const phoneSetting = settings.find((s) => s.key === "contact_phone")
    const latSetting = settings.find((s) => s.key === "contact_latitude")
    const lngSetting = settings.find((s) => s.key === "contact_longitude")
    const mapKeySetting = settings.find((s) => s.key === "google_maps_api_key")

    if (addressSetting?.value) contactAddress = String(addressSetting.value)
    if (emailSetting?.value) contactEmail = String(emailSetting.value)
    if (phoneSetting?.value) contactPhone = String(phoneSetting.value)
    if (latSetting?.value) contactLatitude = String(latSetting.value)
    if (lngSetting?.value) contactLongitude = String(lngSetting.value)
    if (mapKeySetting?.value) googleMapsApiKey = String(mapKeySetting.value)
  } catch (error) {
    console.error("Error loading contact settings for contact page:", error)
  }

  // Construct Google Maps embed URL
  const mapEmbedUrl = googleMapsApiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${contactLatitude},${contactLongitude}`
    : `https://maps.google.com/maps?q=${encodeURIComponent(contactAddress || `${contactLatitude},${contactLongitude}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`

  return (
    <main className="flex-1 bg-white">
      {/* Hero / Contact Form Section */}
      <SectionShell stagger={false} className="relative bg-white py-[72px]">
        <div className="absolute inset-0 opacity-[0.05]">
          <Image src="/contact/noise-bg.png" alt="" fill className="object-cover" />
        </div>
        <StaggerInView className="relative space-y-8">
          <StaggerItem>
            <div className="space-y-6">
              {/* Eyebrow with icon-link.svg */}
              <p className="inline-flex items-center gap-2 rounded-[8px] bg-[rgba(64,160,202,0.25)] px-4 py-2 text-[12px] leading-[1.16] text-[#40A0CA]">
                <Image
                  src="/footer/icon-link.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4 object-contain"
                />
                {t("eyebrow")}
              </p>
              <div className="max-w-[643px] space-y-6">
                <h1 className="font-heading text-[48px] leading-[1.16] font-bold text-[#171717]">{t("title")}</h1>
                <p className="text-[16px] leading-normal text-[#525252]">{t("description")}</p>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="grid overflow-hidden rounded-[16px] border border-[#d4d4d4] bg-white lg:grid-cols-2">
              <div className="relative min-h-[520px] w-full h-full bg-[#f3f4f6]">
                <iframe
                  title={t("mapAlt")}
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  className="absolute inset-0 border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="space-y-16 p-8 md:p-16">
                <h2 className="bg-[linear-gradient(270deg,#032C44_0%,#41A0CA_100%)] bg-clip-text font-heading text-[36px] leading-[1.16] font-bold text-transparent">
                  {t("form.title")}
                </h2>
                <ContactForm locale={locale} />
              </div>
            </div>
          </StaggerItem>
        </StaggerInView>
      </SectionShell>

      {/* Contact Info Cards Section */}
      <section className="relative py-[46px]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#001222_0%,#032C44_100%)]" />
        <div className="absolute inset-0 opacity-[0.05]">
          <Image src="/contact/noise-bg.png" alt="" fill className="object-cover" />
        </div>
        <SectionShell stagger={false} className="relative bg-transparent py-0">
          <StaggerInView className="grid gap-4 md:grid-cols-3">
            <StaggerItem>
              <ContactInfoCard
                icon={<Image src="/footer/icon-phone.svg" alt="" width={48} height={48} className="h-12 w-12 object-contain" />}
                label={t("info.phoneLabel")}
                value={contactPhone}
              />
            </StaggerItem>
            <StaggerItem>
              <ContactInfoCard
                icon={<Image src="/footer/icon-mail.svg" alt="" width={48} height={48} className="h-12 w-12 object-contain" />}
                label={t("info.emailLabel")}
                value={contactEmail}
              />
            </StaggerItem>
            <StaggerItem>
              <ContactInfoCard
                icon={<Image src="/footer/icon-location.svg" alt="" width={48} height={48} className="h-12 w-12 object-contain" />}
                label={t("info.addressLabel")}
                value={contactAddress}
              />
            </StaggerItem>
          </StaggerInView>
        </SectionShell>
      </section>

      {/* FAQ Section */}
      <SectionShell id="faq" stagger={false} className="relative scroll-mt-24 bg-white py-[112px]">
        <div className="absolute inset-0 opacity-[0.05]">
          <Image src="/contact/noise-bg.png" alt="" fill className="object-cover" />
        </div>
        <StaggerInView className="relative mx-auto max-w-[866px] space-y-16">
          <StaggerItem>
            <div className="space-y-6 text-center">
              {/* Eyebrow with faqs.svg icon */}
              <p className="inline-flex items-center gap-2 rounded-[8px] bg-[rgba(64,160,202,0.25)] px-4 py-2 text-[12px] leading-[1.16] text-[#40A0CA]">
                <Image
                  src="/faqs.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4 object-contain"
                />
                {t("faq.eyebrow")}
              </p>
              <h2 className="font-heading text-[48px] leading-[1.16] font-bold text-[#171717]">{t("faq.title")}</h2>
              <p className="text-[16px] leading-normal text-[#525252]">{t("faq.description")}</p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <Accordion type="single" defaultValue={faqs[1]?.id} collapsible className="w-full">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="border-b border-[#d4d4d4]">
                  <AccordionTrigger className="py-4 text-left no-underline hover:no-underline">
                    <div className="flex items-center gap-1 text-[18px] leading-normal font-semibold text-[#262626]">
                      <span className="bg-[linear-gradient(270deg,#032C44_0%,#41A0CA_100%)] bg-clip-text text-[20px] font-extrabold text-transparent">
                        Q.
                      </span>
                      {t(`faq.items.${faq.questionKey}`)}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-base leading-normal text-[#262626]">
                    {t(`faq.items.${faq.answerKey}`)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </StaggerItem>
        </StaggerInView>
      </SectionShell>
    </main>
  )
}
