"use client"

import * as React from "react"
import type { CompanyApplication } from "@/features/company-jobs/lib/application-utils"
import { getCompanyApplicationDetailLabels } from "@/features/company-jobs/lib/company-application-detail-labels"
import { CompanyApplicationActions } from "@/features/company-jobs/components/company-application-actions"
import { CompanyApplicationBackLinks } from "@/features/company-jobs/components/company-application-back-links"
import { CompanyApplicationSummary } from "@/features/company-jobs/components/company-application-summary"
import { CompanyApplicationTabs, type CompanyApplicationTabKey } from "@/features/company-jobs/components/company-application-tabs"
import { CompanyApplicationOverviewTab } from "@/features/company-jobs/components/company-application-overview-tab"
import { CompanyApplicationEducationTab } from "@/features/company-jobs/components/company-application-education-tab"
import { CompanyApplicationExperienceTab } from "@/features/company-jobs/components/company-application-experience-tab"

type CompanyApplicationDetailViewProps = {
  application: CompanyApplication
  jobId: number
  jobTitle: string
  locale: string
  maskApplicantName?: boolean
  userProfileHref?: string
}

export function CompanyApplicationDetailView({
  application,
  jobId,
  jobTitle,
  locale,
  maskApplicantName = true,
  userProfileHref,
}: CompanyApplicationDetailViewProps) {
  const isAr = locale === "ar"
  const [activeTab, setActiveTab] = React.useState<CompanyApplicationTabKey>("overview")
  const labels = getCompanyApplicationDetailLabels(locale)

  return (
    <div className="flex w-full flex-col gap-6" dir={isAr ? "rtl" : "ltr"}>
      <CompanyApplicationBackLinks jobId={jobId} locale={locale} labels={labels} />

      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] sm:p-8">
        <CompanyApplicationSummary
          application={application}
          jobTitle={jobTitle}
          locale={locale}
          labels={labels}
          maskApplicantName={maskApplicantName}
          userProfileHref={userProfileHref}
        />

        <CompanyApplicationTabs activeTab={activeTab} onChange={setActiveTab} labels={labels} />

        <div className="mt-6">
          {activeTab === "overview" && (
            <CompanyApplicationOverviewTab application={application} locale={locale} labels={labels} />
          )}
          {activeTab === "education" && (
            <CompanyApplicationEducationTab application={application} locale={locale} labels={labels} />
          )}
          {activeTab === "experience" && (
            <CompanyApplicationExperienceTab application={application} locale={locale} labels={labels} />
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t border-[#E5E7EB] pt-6">
          <CompanyApplicationActions
            applicationId={application.id}
            jobId={jobId}
            locale={locale}
            status={application.status}
          />
        </div>
      </div>
    </div>
  )
}
