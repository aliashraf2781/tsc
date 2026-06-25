"use client"

import { useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { PrimaryButton } from "@/components/ui/primary-button"
import { Textarea } from "@/components/ui/textarea"
import { Link } from "@/i18n/navigation"
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react"

type Props = {
  initialTicket: any | null
  ticketId: number
  locale: string
}

export function AdminTicketInlineView({ initialTicket, ticketId, locale }: Props) {
  const [ticket, setTicket] = useState<any | null>(initialTicket)
  const [replyText, setReplyText] = useState("")
  const [replying, setReplying] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [messageExpanded, setMessageExpanded] = useState(false)
  const [repliesExpanded, setRepliesExpanded] = useState(true)
  const isAr = locale === "ar"

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return
    try {
      setUpdatingStatus(true)
      const formData = new FormData()
      formData.append("status", newStatus)
      const res = await fetch(`/api/admin/tickets/${ticket.id}/status`, {
        method: "POST",
        credentials: "include",
        headers: { "Accept-Language": locale },
        body: formData,
      })
      if (!res.ok) throw new Error("Failed to update status")
      setTicket((prev: any) => ({ ...prev, status: newStatus }))
      toast.success(isAr ? "تم تحديث حالة التذكرة" : "Ticket status updated")
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل تحديث الحالة" : "Failed to update status"))
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !ticket) return
    try {
      setReplying(true)
      const res = await fetch(`/api/admin/tickets/${ticket.id}/reply`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "Accept-Language": locale },
        body: JSON.stringify({ message: replyText.trim() }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || "Failed to send reply")
      }
      toast.success(isAr ? "تم إرسال الرد بنجاح" : "Reply sent successfully")
      setReplyText("")
      // Refresh detail
      const detailRes = await fetch(`/api/admin/tickets/${ticket.id}?locale=${locale}`, {
        credentials: "include",
        headers: { "Accept-Language": locale },
      })
      if (detailRes.ok) {
        const data = await detailRes.json()
        setTicket(data.data || data)
        setRepliesExpanded(true)
      }
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل إرسال الرد" : "Failed to send reply"))
    } finally {
      setReplying(false)
    }
  }

  const getStatusLabel = (s: string) => {
    const map: Record<string, string> = {
      pending: isAr ? "معلق" : "Pending",
      open: isAr ? "مفتوح" : "Open",
      answered: isAr ? "تم الرد" : "Answered",
      closed: isAr ? "مغلق" : "Closed",
      rejected: isAr ? "مرفوض" : "Rejected",
    }
    return map[s] || s
  }

  const getPriorityLabel = (p: string) => {
    const map: Record<string, string> = {
      high: isAr ? "عالي" : "High",
      medium: isAr ? "متوسط" : "Medium",
      low: isAr ? "منخفض" : "Low",
    }
    return map[p] || p
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ""
    try {
      return new Date(dateStr).toLocaleDateString(isAr ? "ar-SA" : "en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch { return dateStr }
  }

  const getFilenameFromUrl = (url?: string | null) => {
    if (!url) return ""
    return url.substring(url.lastIndexOf("/") + 1)
  }

  const gradientTitleClasses = cn(
    "bg-clip-text text-transparent font-bold",
    isAr ? "bg-gradient-to-r" : "bg-gradient-to-l",
    "from-[#032C44] to-[#41A0CA]"
  )

  const messageText: string = ticket?.message || ""
  const MESSAGE_PREVIEW_LEN = 220
  const isMessageLong = messageText.length > MESSAGE_PREVIEW_LEN

  if (!ticket) {
    return (
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-12 text-center shadow-sm">
        <p className="text-gray-500 font-medium">{isAr ? "لم يتم العثور على التذكرة" : "Ticket not found"}</p>
        <Link locale={locale} href="/dashboard/admin/tickets" className="mt-4 inline-flex items-center gap-2 text-[#006EA8] text-sm font-semibold hover:underline">
          {isAr ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {isAr ? "العودة إلى التذاكر" : "Back to Tickets"}
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 pb-10" dir={isAr ? "rtl" : "ltr"}>
      {/* Back link */}
      <Link locale={locale} href="/dashboard/admin/tickets" className="inline-flex items-center gap-1.5 text-[#006EA8] text-sm font-semibold hover:underline">
        {isAr ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        {isAr ? "العودة إلى جميع التذاكر" : "Back to all tickets"}
      </Link>

      {/* Ticket card */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2 className={cn("text-xl", gradientTitleClasses)}>{ticket.subject}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={cn("text-[11px] font-bold px-2.5 py-0.5 rounded-full border",
                  ticket.status === "pending" && "border-[#FFB64D] bg-[#FFF8EE] text-[#FFB64D]",
                  ticket.status === "open" && "border-[#39DA8A] bg-[#EAFBF3] text-[#39DA8A]",
                  ticket.status === "answered" && "border-[#006EA8] bg-[#F0F9FF] text-[#006EA8]",
                  ticket.status === "closed" && "border-[#FF5B5C] bg-[#FFF5F5] text-[#FF5B5C]",
                  ticket.status === "rejected" && "border-[#FF5B5C] bg-[#FFF5F5] text-[#FF5B5C]"
                )}>{getStatusLabel(ticket.status || "pending")}</span>
                <span className="bg-[#032C44] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize">{getPriorityLabel(ticket.priority || "high")}</span>
                <span className="text-xs text-gray-400">{formatDate(ticket.created_at)}</span>
              </div>
              {ticket.user && (
                <div className="mt-3 text-xs bg-[#F8FAFC] border border-gray-100 rounded-lg p-2.5 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="font-bold text-gray-600">{isAr ? "المرسل: " : "From: "}</span>
                    <span className="text-gray-900 font-semibold">{ticket.user.name}</span>
                    <span className="text-gray-400 mx-1.5">|</span>
                    <span className="text-gray-500">{ticket.user.email}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E4ECF5] text-[#006EA8] capitalize">
                    {ticket.user.role === "company" ? (isAr ? "شركة" : "Company") : (isAr ? "باحث عن عمل" : "Job Seeker")}
                  </span>
                </div>
              )}
            </div>

            {/* Status update buttons */}
            <div className="flex flex-wrap gap-2">
              {(["pending", "open", "closed"] as const).map((st) => (
                <button
                  key={st}
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange(st)}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer disabled:opacity-60",
                    ticket.status === st || (st === "open" && ticket.status === "answered")
                      ? st === "pending" ? "bg-[#FFB64D] border-transparent text-white"
                        : st === "open" ? "bg-[#39DA8A] border-transparent text-white"
                        : "bg-[#FF5B5C] border-transparent text-white"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
                  )}
                >{getStatusLabel(st)}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Collapsible original message */}
        <div className="border-b border-gray-100">
          <button
            type="button"
            onClick={() => setMessageExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-6 py-3.5 bg-[#F4FAFF] hover:bg-[#E8F4FC] transition-colors text-start"
          >
            <span className="text-xs font-semibold text-[#006EA8]">
              {isAr ? "نص الرسالة الأصلية" : "Original Message"}
            </span>
            {messageExpanded
              ? <ChevronUp className="h-4 w-4 text-[#006EA8] shrink-0" />
              : <ChevronDown className="h-4 w-4 text-[#006EA8] shrink-0" />
            }
          </button>

          <div className={cn("px-6 overflow-hidden transition-all duration-200", messageExpanded ? "py-4" : "py-3")}>
            <p className="text-sm text-[#032C44] leading-relaxed whitespace-pre-wrap">
              {isMessageLong && !messageExpanded
                ? messageText.slice(0, MESSAGE_PREVIEW_LEN) + "…"
                : messageText
              }
            </p>
            {isMessageLong && (
              <button
                type="button"
                onClick={() => setMessageExpanded((v) => !v)}
                className="mt-2 text-xs text-[#006EA8] font-semibold hover:underline"
              >
                {messageExpanded
                  ? (isAr ? "عرض أقل ↑" : "Show less ↑")
                  : (isAr ? "عرض المزيد ↓" : "Show more ↓")
                }
              </button>
            )}
          </div>

          {(ticket.file || ticket.attachment) && (
            <div className="flex items-center gap-2 text-xs text-[#006EA8] px-6 pb-4">
              <img src="/portfolio/pdf.svg" alt="file" className="w-5 h-5 flex-shrink-0" />
              <a href={ticket.file || ticket.attachment} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline truncate">
                {getFilenameFromUrl(ticket.file || ticket.attachment)}
              </a>
            </div>
          )}
        </div>

        {/* Collapsible Replies */}
        {ticket.replies && ticket.replies.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setRepliesExpanded((v) => !v)}
              className="w-full flex items-center justify-between px-6 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-start border-b border-gray-100"
            >
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {isAr ? "الردود" : "Replies"} ({ticket.replies.length})
              </span>
              {repliesExpanded
                ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
              }
            </button>

            {repliesExpanded && (
              <div className="p-4 space-y-3">
                {ticket.replies.map((reply: any, idx: number) => {
                  const isSenderAdmin =
                          reply.is_admin === true ||
                          reply.is_admin === 1 ||
                          reply.is_admin === "1" ||
                          (reply.user &&
                            typeof reply.user === "object" &&
                            (reply.user.role === "admin" ||
                              reply.user.role === "talent-seeker" ||
                              (Array.isArray(reply.user.roles) && reply.user.roles.includes("admin")) ||
                              reply.user.name === "talent-seeker" ||
                              reply.user.email?.includes("admin") ||
                              reply.user.email === "info@talent-sc.com")) ||
                          (typeof reply.user === "string" &&
                            (reply.user.toLowerCase() === "talent-seeker" ||
                              reply.user.toLowerCase() === "admin" ||
                              reply.user.toLowerCase().includes("support"))) ||
                          reply.by === "admin"
                  return (
                    <div
                      key={reply.id || idx}
                      className={cn(
                        "rounded-[12px] p-4 border",
                        isSenderAdmin ? "bg-[#FFF9F0] border-[#FFE5C2] ms-8" : "bg-white border-[#E5E7EB] me-8"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[13px] font-bold text-[#032C44]">
                          {reply.user?.name || (isSenderAdmin ? (isAr ? "الدعم الفني" : "Support Team") : (isAr ? "العميل" : "Client"))}
                        </span>
                        <span className="text-[11px] text-gray-400">{formatDate(reply.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {reply.message || reply.body || reply.content}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Reply form */}
        {ticket.status !== "closed" && (
          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <form onSubmit={handleReply} className="space-y-3">
              <p className="text-sm font-bold text-[#032C44]">{isAr ? "إرسال رد:" : "Send Reply:"}</p>
              <Textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={isAr ? "اكتب ردك هنا..." : "Type your reply here..."}
                className="border border-[#E5E7EB] focus:border-[#40A0CA] rounded-[8px] px-3 py-2 text-sm w-full outline-none resize-none bg-white"
              />
              <div className="flex justify-end">
                <PrimaryButton
                  type="submit"
                  disabled={replying || !replyText.trim()}
                  className="px-8 w-auto cursor-pointer"
                >
                  {replying ? (isAr ? "جاري الإرسال..." : "Sending...") : (isAr ? "إرسال الرد" : "Send Reply")}
                </PrimaryButton>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
