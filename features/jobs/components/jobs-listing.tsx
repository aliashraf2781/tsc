"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { FilterPanel, type FilterPanelProps } from "@/features/jobs/components/filter-panel"
import { JobsFilterDrawer } from "@/features/jobs/components/jobs-filter-drawer"
import { JobsFilterTrigger } from "@/features/jobs/components/jobs-filter-trigger"
import { JobCard } from "@/features/jobs/components/job-card"
import { StaggerInView, StaggerItem } from "@/features/shared-home"
import type { Category, Job } from "@/lib/api/types"
import { getJobTitle, salaryFromSliderPercent, getLocalizedName, getLocalizedStateName } from "@/features/jobs/lib/job-display"
import { cn } from "@/lib/utils"

type JobsListingProps = {
  locale: string
  jobs: Job[]
  total: number
  categories: Category[]
  searchQuery?: string
  labels: {
    allJobs: string
    filter: string
    department: string
    postedAgo: string
    salaryPeriod: string
    employmentFullTime: string
    companyName: string
    companySubLabel: string
    moreDetails: string
    filterPanelTitle: string
    clearAll: string
    state: string
    categories: string
    salary: string
    salaryMin: string
    salaryMax: string
    from: string
    to: string
    noResults: string
    closeFilters: string
  }
  stateOptions: string[]
  categoryOptions: string[]
}

function matchField(field: unknown, q: string): boolean {
  if (!field) return false
  if (typeof field === "string") {
    return field.toLowerCase().includes(q)
  }
  if (typeof field === "object") {
    return Object.values(field as Record<string, unknown>).some(
      (val) => typeof val === "string" && val.toLowerCase().includes(q)
    )
  }
  return false
}

export function JobsListing({
  locale,
  jobs,
  total,
  categories,
  searchQuery = "",
  labels,
  stateOptions,
  categoryOptions,
}: JobsListingProps) {
  const isRtl = locale === "ar"
  const searchParams = useSearchParams()
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(false)
  const [activeStates, setActiveStates] = useState<number[]>([])
  const [activeCategories, setActiveCategories] = useState<number[]>([])
  const [salaryValue, setSalaryValue] = useState<[number, number]>([0, 100])
  const [initialCategoryApplied, setInitialCategoryApplied] = useState(false)

  // Auto-select category from URL query param (?category=ID)
  useEffect(() => {
    if (initialCategoryApplied) return
    const categoryParam = searchParams.get("category")
    if (!categoryParam) {
      setInitialCategoryApplied(true)
      return
    }
    const categoryId = Number(categoryParam)
    if (!Number.isFinite(categoryId)) {
      setInitialCategoryApplied(true)
      return
    }
    const idx = categories.findIndex((c) => c.id === categoryId)
    if (idx >= 0) {
      setActiveCategories([idx])
      setIsDesktopFilterOpen(true)
    }
    setInitialCategoryApplied(true)
  }, [searchParams, categories, initialCategoryApplied])


  const filteredJobs = useMemo(() => {
    let list = jobs
    const q = searchQuery.trim().toLowerCase()

    if (q) {
      list = list.filter((job) => {
        const matchesTitle = matchField(job.title, q)
        const matchesLocation =
          matchField(job.state, q) ||
          matchField(job.location, q) ||
          matchField(job.city?.name, q) ||
          matchField(job.country?.name, q)
        const matchesCompany = matchField(job.company?.name, q)
        const matchesCategory = matchField(job.category?.name, q)

        return matchesTitle || matchesLocation || matchesCompany || matchesCategory
      })
    }

    if (activeStates.length > 0) {
      list = list.filter((job) => {
        const state = job.state || job.city?.name || ""
        return activeStates.some((idx) => stateOptions[idx] === state)
      })
    }

    if (activeCategories.length > 0) {
      const selectedCategoryNames = activeCategories
        .map((idx) => categoryOptions[idx]?.trim().toLowerCase())
        .filter((value): value is string => Boolean(value))
      const selectedCategoryIds = categories
        .map((category, idx) => (activeCategories.includes(idx) ? category.id : null))
        .filter((id): id is number => id != null)

      list = list.filter((job) => {
        const jobCategoryId = job.category?.id
        const jobCategoryName = getLocalizedName(job.category?.name, locale).trim().toLowerCase()

        if (jobCategoryId != null && selectedCategoryIds.includes(jobCategoryId)) {
          return true
        }

        return jobCategoryName != null && selectedCategoryNames.includes(jobCategoryName)
      })
    }

    if (salaryValue[0] > 0 || salaryValue[1] < 100) {
      const minSalary = salaryFromSliderPercent(salaryValue[0])
      const maxSalary = salaryFromSliderPercent(salaryValue[1])
      list = list.filter((job) => {
        const from = job.salary_from ?? 0
        const to = job.salary_to ?? from
        return to >= minSalary && from <= maxSalary
      })
    }

    return list
  }, [
    activeCategories,
    activeStates,
    categories,
    categoryOptions,
    jobs,
    locale,
    searchQuery,
    salaryValue,
    stateOptions,
  ])

  const activeFilterCount =
    activeStates.length + activeCategories.length + (salaryValue[0] > 0 || salaryValue[1] < 100 ? 1 : 0)

  const countLabel = String(
    searchQuery || activeFilterCount > 0
      ? filteredJobs.length
      : total || filteredJobs.length
  )

  const localizedStateOptions = useMemo(() => {
    return stateOptions.map((state) => getLocalizedStateName(state, locale))
  }, [stateOptions, locale])

  const filterPanelProps: FilterPanelProps = {
    filterPanelTitle: labels.filterPanelTitle,
    clearAllLabel: labels.clearAll,
    stateLabel: labels.state,
    categoriesLabel: labels.categories,
    salaryLabel: labels.salary,
    salaryMinLabel: labels.salaryMin,
    salaryMaxLabel: labels.salaryMax,
    salaryFromLabel: labels.from,
    salaryToLabel: labels.to,
    stateOptions: localizedStateOptions,
    categoryOptions,
    activeStates,
    activeCategories,
    salaryValue,
    locale,
    onClearAll: () => {
      setActiveStates([])
      setActiveCategories([])
      setSalaryValue([0, 100])
    },
    onToggleState: (index) =>
      setActiveStates((prev) =>
        prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]
      ),
    onToggleCategory: (index) =>
      setActiveCategories((prev) =>
        prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]
      ),
    onSalaryChange: setSalaryValue,
  }

  const cardLabels = {
    department: labels.department,
    postedAgo: labels.postedAgo,
    salaryPeriod: labels.salaryPeriod,
    employmentDefault: labels.employmentFullTime,
    companyName: labels.companyName,
    companySubLabel: labels.companySubLabel,
    moreDetails: labels.moreDetails,
  }

  return (
    <div className="mx-auto mt-[52px] pb-12 sm:pb-16 lg:pb-[82px] w-full max-w-[1312px] space-y-5 px-4 sm:px-6 lg:px-8">
      <StaggerInView>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[24px] leading-[1.16] font-semibold text-[#171717] sm:text-[32px] lg:text-[36px]">
            {labels.allJobs}{" "}
            <span className="text-[#525252]">({countLabel})</span>
          </h2>

          <JobsFilterTrigger
            label={labels.filter}
            activeCount={activeFilterCount}
            aria-expanded={isDesktopFilterOpen}
            onClick={() => {
              if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
                setIsDesktopFilterOpen((open) => !open)
                return
              }
              setIsFilterDrawerOpen(true)
            }}
          />
        </div>
      </StaggerInView>

      <div className="flex flex-col items-stretch lg:items-start gap-6 lg:flex-row lg:gap-6 xl:gap-8 w-full">
        <div className="min-w-0 flex-1 w-full">
          {filteredJobs.length === 0 ? (
            <p className="rounded-[16px] border border-dashed border-[#78a3be] bg-[#f8fbff] px-6 py-16 text-center text-lg text-[#525252]">
              {labels.noResults}
            </p>
          ) : (
            <StaggerInView
              immediate={true}
              className={cn(
                "grid gap-6 w-full",
                isDesktopFilterOpen
                  ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-2"
                  : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
              )}
            >
              {filteredJobs.map((job) => (
                <StaggerItem key={job.id} immediate={true} className="h-full">
                  <JobCard
                    job={job}
                    locale={locale}
                    isRtl={isRtl}
                    labels={cardLabels}
                  />
                </StaggerItem>
              ))}
            </StaggerInView>
          )}
        </div>

        {isDesktopFilterOpen ? (
          <aside className="hidden w-full shrink-0 lg:block lg:w-[min(100%,421px)] lg:static lg:top-24 lg:self-start">
            <FilterPanel {...filterPanelProps} variant="sidebar" />
          </aside>
        ) : null}
      </div>

      <JobsFilterDrawer
        open={isFilterDrawerOpen}
        onOpenChange={setIsFilterDrawerOpen}
        title={labels.filterPanelTitle}
        closeLabel={labels.closeFilters}
        panelProps={{ ...filterPanelProps, variant: "drawer" }}
      />
    </div>
  )
}
