import { getLocale } from "next-intl/server"
import { getServices } from "@/lib/api/services/services.service"
import { ArrowLeft } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { ServiceDetailsClient } from "./service-details-client"

type PageProps = {
  params: Promise<{ locale: string; id: string }>
}

export default async function ServiceDetailsPage({ params }: PageProps) {
  const { locale, id } = await params
  const isRTL = locale === "ar"

  // Fetch all database services
  const services = await getServices(locale)
  let service = services.find((s) => String(s.id) === id) || null

  // Fallback default services if not present in database
  const defaultServices = [
    {
      id: 1,
      title: isRTL ? "استقطاب المواهب الدولية" : "International Talent Sourcing",
      description: isRTL
        ? "نربطك بأفضل الكفاءات العالمية المتخصصة في مجالات الرعاية الصحية والتكنولوجيا والهندسة."
        : "Sourcing elite global professionals specialized in healthcare, IT, and engineering sectors.",
      image: "",
      features: [
        {
          id: 1,
          title: isRTL ? "مطابقة الوظائف المخصصة" : "Personalized Job Matching",
          description: isRTL
            ? "نطابق ملفك الشخصي مع أفضل أصحاب العمل الألمان، متخصصين في قطاعات الرعاية الصحية والتكنولوجيا للعثور على دورك المثالي."
            : "We match your profile with top German employers, specializing in healthcare and technical sectors to find your ideal role.",
          icon: "",
        },
        {
          id: 2,
          title: isRTL ? "الاعتراف بالمؤهلات" : "Qualification Recognition",
          description: isRTL
            ? "توجيه خبير خلال عملية الاعتراف بالمؤهلات (Anerkennung) بأكملها، لضمان تلبية مؤهلاتك للمعايير المهنية الألمانية."
            : 'Expert guidance through the entire "Anerkennung" process, ensuring your credentials meet German professional standards.',
          icon: "",
        },
      ],
    },
    {
      id: 2,
      title: isRTL ? "الاعتراف بالشهادات والمؤهلات" : "Credential Recognition Support",
      description: isRTL
        ? "نساعدك في إنهاء إجراءات تعديل الشهادات (Anerkennung) لمطابقة المعايير الألمانية."
        : "Comprehensive guidance through the Anerkennung process to match German standards.",
      image: "",
      features: [
        {
          id: 3,
          title: isRTL ? "تقييم المؤهلات" : "Credential Assessment",
          description: isRTL
            ? "مراجعة شاملة لشهاداتك الأكاديمية والمهنية لتحديد مدى مطابقتها لمتطلبات ألمانيا."
            : "Detailed review of academic and professional credentials to evaluate German equivalence.",
          icon: "",
        },
      ],
    },
    {
      id: 3,
      title: isRTL ? "معاملات التأشيرات والإقامة" : "Visa & Immigration Assistance",
      description: isRTL
        ? "ندعمك في كافة الإجراءات القانونية والمستندات المطلوبة للحصول على تأشيرة العمل السريعة."
        : "Full documentation support and fast-track processing for work visas and residence permits.",
      image: "",
      features: [
        {
          id: 4,
          title: isRTL ? "دعم المستندات المتكامل" : "End-to-End Documentation Support",
          description: isRTL
            ? "مساعدة كاملة في إعداد المستندات وترجمتها وتقديمها وجميع المراسلات الرسمية."
            : "Complete assistance with preparing, translating, and submitting all necessary documents and official correspondence.",
          icon: "",
        },
      ],
    },
  ]

  // Use database service or match the fallback
  if (!service) {
    service = defaultServices.find((ds) => String(ds.id) === id) || null
  }

  if (!service) {
    return (
      <main className="flex-1 bg-white py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {isRTL ? "الخدمة غير موجودة" : "Service Not Found"}
        </h1>
        <Link
          locale={locale}
          href="/services"
          className="mt-4 inline-flex items-center gap-2 text-[#006EA8] hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          <span>{isRTL ? "العودة للخدمات" : "Back to Services"}</span>
        </Link>
      </main>
    )
  }

  return <ServiceDetailsClient service={service} locale={locale} />
}
