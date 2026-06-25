import type { Job } from "@/lib/api/types"

export function getJobTitle(
  job: Pick<Job, "title">,
  locale: string = "en"
): string {
  const { title } = job
  if (typeof title === "string") return title
  if (title && typeof title === "object") {
    return title[locale] || title.en || title.ar || title.de || ""
  }
  return ""
}
