"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useTicketChat, TicketChatThread } from "@/features/tickets"
import { Loader2, ChevronDown, ChevronUp } from "lucide-react"

type Props = {
  ticketId: number | null
  isOpen: boolean
  onClose: () => void
  locale: string
  onTicketUpdated: () => void
}

export function AdminTicketDetail({ ticketId, isOpen, onClose, locale, onTicketUpdated }: Props) {
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [statusOverride, setStatusOverride] = useState<string | null>(null)
  const [messageExpanded, setMessageExpanded] = useState(false)
  const isAr = locale === "ar"

  const { ticket: chatTicket, messages, loading, sending, sendMessage } = useTicketChat({
    ticketId,
    role: "admin",
    locale,
    enabled: isOpen,
  })
  const ticket = chatTicket ? { ...chatTicket, status: statusOverride ?? chatTicket.status } : null

  useEffect(() => {
    if (!isOpen) {
      // Reset local UI state so the next ticket opened doesn't inherit it.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessageExpanded(false)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatusOverride(null)
    }
  }, [isOpen])

  const handleStatusChange = async (newStatus: string) => {
    if (!ticketId) return
    try {
      setUpdatingStatus(true)
      const formData = new FormData()
      formData.append("status", newStatus)

      const res = await fetch(`/api/admin/tickets/${ticketId}/status`, {
        method: "POST",
        credentials: "include",
        headers: { "Accept-Language": locale },
        body: formData,
      })

      if (!res.ok) throw new Error("Failed to update status")

      setStatusOverride(newStatus)
      toast.success(isAr ? "تم تحديث حالة التذكرة بنجاح" : "Ticket status updated successfully")
      onTicketUpdated()
    } catch (err: any) {
      console.error("Status change error:", err)
      toast.error(err.message || (isAr ? "فشل تحديث حالة التذكرة" : "Failed to update ticket status"))
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleSend = async (message: string, file?: File | null) => {
    await sendMessage(message, file)
    onTicketUpdated()
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
      <DialogContent className="max-w-[650px] p-0 rounded-[20px] bg-white border-0 shadow-lg h-[90vh] overflow-hidden flex flex-col" dir={isAr ? "rtl" : "ltr"}>
        <DialogTitle className="sr-only">
          {ticket?.subject || (isAr ? "تفاصيل التذكرة" : "Ticket Details")}
        </DialogTitle>

        {loading && !ticket && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#006EA8]" />
            <p className="text-sm text-gray-500">{isAr ? "جاري تحميل تفاصيل التذكرة..." : "Loading ticket details..."}</p>
          </div>
        )}

        {ticket && (
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
                {(ticket as any).user && (
                  <div className="mt-3 text-xs bg-[#F8FAFC] border border-gray-100 rounded-lg p-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-600">{isAr ? "المرسل: " : "Sender: "}</span>
                      <span className="text-gray-900 font-semibold">{(ticket as any).user.name}</span>
                      <span className="text-gray-400 mx-1.5">|</span>
                      <span className="text-gray-500">{(ticket as any).user.email}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E4ECF5] text-[#006EA8] capitalize">
                      {(ticket as any).user.role === "company" ? (isAr ? "شركة" : "Company") : (isAr ? "باحث عن عمل" : "Job Seeker")}
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

            {/* Collapsible Message + Attachment */}
            <div className="px-6 pt-4 space-y-3 shrink-0">
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

              {((ticket as any).file || (ticket as any).attachment) && (
                <div className="flex items-center gap-2 text-xs text-[#006EA8] pb-1">
                  <img src="/portfolio/pdf.svg" alt="File" className="w-5 h-5 flex-shrink-0" />
                  <a
                    href={(ticket as any).file || (ticket as any).attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate font-semibold hover:underline"
                  >
                    {getFilenameFromUrl((ticket as any).file || (ticket as any).attachment)}
                  </a>
                </div>
              )}

              {/* Status Update */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <span className="text-xs font-bold text-[#032C44]">
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
            </div>

            {/* Real-time chat thread */}
            <div className="flex-1 min-h-0">
              <TicketChatThread
                messages={messages}
                loading={loading}
                sending={sending}
                disabled={ticket.status === "closed"}
                locale={locale}
                onSend={handleSend}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
