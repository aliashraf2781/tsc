import type { News } from "@/lib/api/types"
import { RelatedNewsCard } from "@/features/news/components/related-news-card"

type NewsDetailSidebarProps = {
  related: News[]
  locale: string
  title: string
}

export function NewsDetailSidebar({ related, locale, title }: NewsDetailSidebarProps) {
  if (related.length === 0) return null

  return (
    <aside className="hidden w-full max-w-[421px] shrink-0 lg:block lg:sticky lg:top-28 lg:self-start">
      <h2 className="text-[32px] font-semibold leading-[1.5] text-[#002B46]">{title}</h2>
      <div className="mt-8 flex flex-col gap-6">
        {related.map((item, index) => (
          <RelatedNewsCard key={item.id} item={item} locale={locale} imageIndex={index + 1} />
        ))}
      </div>
    </aside>
  )
}
