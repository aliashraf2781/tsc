import type { JobApplication, User, UserPortfolio } from "@/lib/api/types"
import { getApplicationDetailLabels } from "../lib/labels"
import type { AppLocale } from "../lib/types"
import { ApplicationDetailHeader } from "./application-detail-header"
import { ApplicationOverviewCard } from "./application-overview-card"
import { ApplicationEducationCard } from "./application-education-card"
import { ApplicationExperienceCard } from "./application-experience-card"
import { ApplicationPersonalDetailsCard } from "./application-personal-details-card"
import { ApplicationCvCard } from "./application-cv-card"
import { ApplicationSkillsCard } from "./application-skills-card"
import { ApplicationLanguagesCard } from "./application-languages-card"

export function ApplicationDetailView({
  application,
  portfolio,
  userProfile,
  locale,
}: {
  application: JobApplication
  portfolio: UserPortfolio | undefined
  userProfile: User | undefined
  locale: AppLocale
}) {
  const isAr = locale === "ar"
  const labels = getApplicationDetailLabels(locale)
  const cvUrl = application.cv_url || portfolio?.cv_url

  return (
    <div className="flex w-full flex-col gap-6 text-start" dir={isAr ? "rtl" : "ltr"}>
      <ApplicationDetailHeader
        locale={locale}
        title={labels.title}
        subtitle={labels.subtitle}
        backLabel={labels.backToApplications}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <ApplicationOverviewCard application={application} locale={locale} labels={labels} />
          <ApplicationEducationCard educations={portfolio?.educations} locale={locale} labels={labels} />
          <ApplicationExperienceCard experiences={portfolio?.experiences} labels={labels} />
        </div>

        <div className="space-y-6">
          {userProfile && (
            <ApplicationPersonalDetailsCard userProfile={userProfile} locale={locale} labels={labels} />
          )}
          <ApplicationCvCard cvUrl={cvUrl} labels={labels} />
          <ApplicationSkillsCard skills={portfolio?.skills} labels={labels} />
          <ApplicationLanguagesCard languages={portfolio?.languages} labels={labels} />
        </div>
      </div>
    </div>
  )
}
