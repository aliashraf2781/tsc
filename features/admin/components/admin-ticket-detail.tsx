"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { PrimaryButton } from "@/components/ui/primary-button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ChevronDown, ChevronUp } from "lucide-react"

type Props = {
  ticketId: number | null
  isOpen: boolean
  onClose: () => void
  locale: string
  onTicketUpdated: () => void
}

export function AdminTicketDetail({ ticketId, isOpen, onClose, locale, onTicketUpdated }: Props) {
  const [ticket, setTicket] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [replying, setReplying] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [messageExpanded, setMessageExpanded] = useState(false)
  const [repliesExpanded, setRepliesExpanded] = useState(true)
  const isAr = locale === "ar"

  useEffect(() => {
    if (!isOpen || !ticketId) {
      setTicket(null)
      setMessageExpanded(false)
      setRepliesExpanded(true)
      return
    }

    async function loadTicket() {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/tickets/${ticketId}?locale=${locale}`, {
          credentials: "include",
          headers: { "Accept-Language": locale },
        })
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}))
          throw new Error(errBody.message || `HTTP ${res.status}`)
        }
        const data = await res.json()
        setTicket(data.data || data)
      } catch (err) {
        console.error("Load ticket detail error:", err)
        toast.error(isAr ? "فشل تحميل تفاصيل التذكرة" : "Failed to load ticket details")
        onClose()
      } finally {
        setLoading(false)
      }
    }

    loadTicket()
  }, [ticketId, isOpen, locale, isAr, onClose])

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
      toast.success(isAr ? "تم تحديث حالة التذكرة بنجاح" : "Ticket status updated successfully")
      onTicketUpdated()
    } catch (err: any) {
      console.error("Status change error:", err)
      toast.error(err.message || (isAr ? "فشل تحديث حالة التذكرة" : "Failed to update ticket status"))
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !ticket) return

    try {
      setReplying(true)
      const res = await fetch(`/api/admin/tickets/${ticket.id}/reply`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": locale,
        },
        body: JSON.stringify({ message: replyText.trim() }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || "Failed to submit reply")
      }

      toast.success(isAr ? "تم إرسال الرد بنجاح" : "Reply sent successfully")
      setReplyText("")

      // Refresh the ticket detail
      const detailRes = await fetch(`/api/admin/tickets/${ticket.id}?locale=${locale}`, {
        credentials: "include",
        headers: { "Accept-Language": locale },
      })
      if (detailRes.ok) {
        const data = await detailRes.json()
        setTicket(data.data || data)
        setRepliesExpanded(true)
      }

      onTicketUpdated()
    } catch (err: any) {
      console.error("Reply submit error:", err)
      toast.error(err.message || (isAr ? "فشل إرسال الرد" : "Failed to send reply"))
    } finally {
      setReplying(false)
    }
  }

  const getPriorityLabel = (pri: string) => {
    const map: Record<string, string> = {
      high: isAr ? "عالي" : "High",
      medium: isAr ? "متوسط" : "Medium",
      low: isAr ? "منخفض" : "Low",
    }
    return map[pri] || pri
  }

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: isAr ? "معلق" : "Pending",
      open: isAr ? "مفتوح" : "Open",
      answered: isAr ? "تم الرد" : "Answered",
      closed: isAr ? "مغلق" : "Closed",
      rejected: isAr ? "مرفوض" : "Rejected",
    }
    return map[status] || status
  }

  const getFilenameFromUrl = (url?: string | null) => {
    if (!url) return ""
    return url.substring(url.lastIndexOf("/") + 1)
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
    } catch {
      return dateStr
    }
  }

  const gradientTitleClasses = cn(
    "bg-clip-text text-transparent font-bold",
    isAr ? "bg-gradient-to-r" : "bg-gradient-to-l",
    "from-[#032C44] to-[#41A0CA]"
  )

  const messageText: string = ticket?.message || ""
  const MESSAGE_PREVIEW_LEN = 180
  const isMessageLong = messageText.length > MESSAGE_PREVIEW_LEN

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[650px] p-0 rounded-[20px] bg-white border-0 shadow-lg max-h-[90vh] overflow-hidden flex flex-col" dir={isAr ? "rtl" : "ltr"}>
        <DialogTitle className="sr-only">
          {ticket?.subject || (isAr ? "تفاصيل التذكرة" : "Ticket Details")}
        </DialogTitle>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#006EA8]" />
            <p className="text-sm text-gray-500">{isAr ? "جاري تحميل تفاصيل التذكرة..." : "Loading ticket details..."}</p>
          </div>
        )}

        {!loading && ticket && (
          <>
            {/* Header */}
            <div className="p-6 pb-4 border-b border-gray-100 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className={cn("text-[18px] font-bold leading-snug", gradientTitleClasses)}>
                  {ticket.subject}
                </h2>

                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-3 mt-2.5">
                  <span className={cn(
                    "text-[11px] font-bold px-2.5 py-0.5 rounded-full border shrink-0",
                    ticket.status === "pending" && "border-[#FFB64D] bg-[#FFF8EE] text-[#FFB64D]",
                    ticket.status === "open" && "border-[#39DA8A] bg-[#EAFBF3] text-[#39DA8A]",
                    ticket.status === "answered" && "border-[#006EA8] bg-[#F0F9FF] text-[#006EA8]",
                    ticket.status === "closed" && "border-[#FF5B5C] bg-[#FFF5F5] text-[#FF5B5C]",
                    ticket.status === "rejected" && "border-[#FF5B5C] bg-[#FFF5F5] text-[#FF5B5C]"
                  )}>
                    {getStatusLabel(ticket.status || "pending")}
                  </span>

                  <span className="bg-[#032C44] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize">
                    {getPriorityLabel(ticket.priority || "high")}
                  </span>

                  <span className="text-[12px] text-gray-400">
                    {formatDate(ticket.created_at)}
                  </span>
                </div>

                {/* Sender Info */}
                {ticket.user && (
                  <div className="mt-3 text-xs bg-[#F8FAFC] border border-gray-100 rounded-lg p-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-600">{isAr ? "المرسل: " : "Sender: "}</span>
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

              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition cursor-pointer shrink-0"
              >
                <img src="/portfolio/close-circle.svg" alt="Close" className="w-7 h-7" />
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Collapsible Message */}
              <div className="rounded-[12px] bg-[#F4FAFF] border border-[#E0F0FF] overflow-hidden text-start">
                <button
                  type="button"
                  onClick={() => setMessageExpanded((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-[#006EA8] hover:bg-[#E8F4FC] transition-colors"
                >
                  <span>{isAr ? "نص الرسالة" : "Message Body"}</span>
                  {messageExpanded
                    ? <ChevronUp className="h-4 w-4 shrink-0" />
                    : <ChevronDown className="h-4 w-4 shrink-0" />
                  }
                </button>
                <div className="px-4 pb-4">
                  <p className="text-[14px] text-[#032C44] leading-relaxed whitespace-pre-wrap">
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
              </div>

              {/* Attachment */}
              {(ticket.file || ticket.attachment) && (
                <div className="flex items-center gap-2 text-xs text-[#006EA8] border-b border-gray-50 pb-3">
                  <img src="/portfolio/pdf.svg" alt="File" className="w-5 h-5 flex-shrink-0" />
                  <a
                    href={ticket.file || ticket.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate font-semibold hover:underline"
                  >
                    {getFilenameFromUrl(ticket.file || ticket.attachment)}
                  </a>
                </div>
              )}

              {/* Collapsible Replies */}
              {ticket.replies && ticket.replies.length > 0 && (
                <div className="rounded-[12px] border border-gray-100 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setRepliesExpanded((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-start"
                  >
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {isAr ? "سجل الردود والرسائل" : "Replies Log"} ({ticket.replies.length})
                    </span>
                    {repliesExpanded
                      ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                      : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                    }
                  </button>

                  {repliesExpanded && (
                    <div className="p-3 space-y-3">
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
                              "rounded-[12px] p-4 border text-start",
                              isSenderAdmin
                                ? "bg-[#FFF9F0] border-[#FFE5C2] mr-0 ml-6"
                                : "bg-white border-[#E5E7EB] ml-0 mr-6"
                            )}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[13px] font-bold text-[#032C44]">
                                {reply.user?.name || (isSenderAdmin ? (isAr ? "أنت (الدعم الفني)" : "You (Support)") : (isAr ? "العميل" : "Client"))}
                              </span>
                              <span className="text-[11px] text-gray-400">
                                {formatDate(reply.created_at)}
                              </span>
                            </div>
                            <p className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                              {reply.message || reply.body || reply.content}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Admin actions and reply form */}
            <div className="p-6 pt-4 border-t border-gray-100 space-y-4 bg-gray-50/50">
              {/* Status Update */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-bold text-[#032C44]">
                  {isAr ? "تحديث حالة التذكرة:" : "Change Status:"}
                </span>

                <div className="flex gap-2">
                  {(["pending", "open", "closed"] as const).map((st) => (
                    <button
                      key={st}
                      disabled={updatingStatus}
                      onClick={() => handleStatusChange(st)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                        ticket.status === st || (st === "open" && ticket.status === "answered")
                          ? st === "pending"
                            ? "bg-[#FFB64D] border-transparent text-white"
                            : st === "open"
                              ? "bg-[#39DA8A] border-transparent text-white"
                              : "bg-[#FF5B5C] border-transparent text-white"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      {getStatusLabel(st)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply Form */}
              {ticket.status !== "closed" && (
                <form onSubmit={handleReplySubmit} className="space-y-3 pt-2">
                  <Textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={isAr ? "اكتب رد الدعم الفني هنا..." : "Type technical support reply here..."}
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
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
