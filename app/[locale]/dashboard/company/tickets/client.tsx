"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell";

type Props = {
  locale: string;
  initialTickets: any[];
};

export default function CompanyTicketsClient({ locale, initialTickets }: Props) {
  const [tickets, setTickets] = useState<any[]>(initialTickets);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Detail / reply states
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Form states
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("high");
  const [message, setMessage] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAr = locale === "ar";
  const isDe = locale === "de";

  const fetchTickets = async () => {
    try {
      const res = await fetch(`/api/company/tickets?locale=${locale}`);
      const data = await res.json();
      if (res.ok) {
        setTickets(data.data || data);
      }
    } catch (err) {
      console.error("Failed to fetch company tickets", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error(isAr ? "حجم الملف يجب أن يكون أقل من 10 ميجا بايت" : (isDe ? "Die Dateigröße sollte weniger als 10 MB betragen" : "File size should be less than 10MB"));
      return;
    }
    setAttachmentFile(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      toast.error(isAr ? "الرجاء إدخال موضوع التذكرة" : (isDe ? "Bitte geben Sie den Betreff des Tickets ein" : "Please enter the ticket subject"));
      return;
    }
    if (!message.trim()) {
      toast.error(isAr ? "الرجاء إدخال نص الرسالة" : (isDe ? "Bitte geben Sie den Nachrichtentext ein" : "Please enter the message content"));
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("message", message);
      formData.append("priority", priority);
      if (attachmentFile) {
        formData.append("file", attachmentFile);
      }

      const res = await fetch("/api/company/tickets", {
        method: "POST",
        headers: {
          "Accept-Language": locale,
        },
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Failed to create ticket");
      }

      toast.success(isAr ? "تم إنشاء التذكرة بنجاح" : (isDe ? "Ticket erfolgreich erstellt" : "Ticket created successfully"));
      setShowNewTicketModal(false);
      
      // Reset form
      setSubject("");
      setMessage("");
      setPriority("high");
      setAttachmentFile(null);

      // Refresh list
      await fetchTickets();
    } catch (err: any) {
      console.error("[Create ticket error]", err);
      toast.error(err.message || (isAr ? "فشل إنشاء التذكرة" : (isDe ? "Ticket konnte nicht erstellt werden" : "Failed to create ticket")));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Open ticket detail ──
  const openTicketDetail = async (ticket: any) => {
    setSelectedTicket(ticket);
    setReplyText("");
    setShowDetailModal(true);

    // Try to fetch latest version with replies
    try {
      setLoadingDetail(true);
      const res = await fetch(`/api/company/tickets/${ticket.id}?locale=${locale}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data.data || data);
      }
    } catch {
      // keep showing what we have
    } finally {
      setLoadingDetail(false);
    }
  };

  // ── Reply to ticket ──
  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.error(isAr ? "الرجاء إدخال نص الرد" : (isDe ? "Bitte geben Sie eine Antwort ein" : "Please enter a reply message"));
      return;
    }
    if (!selectedTicket) return;

    try {
      setReplying(true);
      const res = await fetch(`/api/company/tickets/${selectedTicket.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": locale,
        },
        body: JSON.stringify({ message: replyText }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to reply");
      }

      toast.success(isAr ? "تم إرسال الرد بنجاح" : (isDe ? "Antwort erfolgreich gesendet" : "Reply sent successfully"));
      setReplyText("");

      // Refresh the detail
      try {
        const detailRes = await fetch(`/api/company/tickets/${selectedTicket.id}?locale=${locale}`);
        if (detailRes.ok) {
          const data = await detailRes.json();
          setSelectedTicket(data.data || data);
        }
      } catch { /* ignore */ }

      // Refresh list
      await fetchTickets();
    } catch (err: any) {
      console.error("[Reply error]", err);
      toast.error(err.message || (isAr ? "فشل إرسال الرد" : (isDe ? "Antwort konnte nicht gesendet werden" : "Failed to send reply")));
    } finally {
      setReplying(false);
    }
  };

  const getPriorityLabel = (pri: string) => {
    const map: Record<string, string> = {
      high: isAr ? "عالي" : (isDe ? "Hoch" : "High"),
      medium: isAr ? "متوسط" : (isDe ? "Mittel" : "Medium"),
      low: isAr ? "منخفض" : (isDe ? "Niedrig" : "Low"),
    };
    return map[pri] || pri;
  };

  const getPriorityColor = (pri: string) => {
    if (pri === "high") return "bg-red-600";
    if (pri === "medium") return "bg-amber-500";
    return "bg-green-500";
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: isAr ? "معلق" : (isDe ? "Ausstehend" : "Pending"),
      open: isAr ? "مفتوح" : (isDe ? "Offen" : "Open"),
      answered: isAr ? "تم الرد" : (isDe ? "Beantwortet" : "Answered"),
      closed: isAr ? "مغلق" : (isDe ? "Geschlossen" : "Closed"),
      rejected: isAr ? "مرفوض" : (isDe ? "Abgelehnt" : "Rejected"),
    };
    return map[status] || status;
  };

  const getFilenameFromUrl = (url?: string | null) => {
    if (!url) return "";
    return url.substring(url.lastIndexOf("/") + 1);
  };

  const formatLastReply = (dateStr?: string) => {
    if (!dateStr) return isAr ? "منذ فترة" : (isDe ? "vor einiger Zeit" : "some time ago");
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 60) {
        return isAr ? `منذ ${diffMins} دقيقة` : (isDe ? `vor ${diffMins} Minuten` : `${diffMins} minutes ago`);
      }
      if (diffHours < 24) {
        return isAr ? `منذ ${diffHours} ساعة` : (isDe ? `vor ${diffHours} Stunden` : `${diffHours} hours ago`);
      }
      if (diffDays < 30) {
        return isAr ? `منذ ${diffDays} يوم` : (isDe ? `vor ${diffDays} Tagen` : `${diffDays} days ago`);
      }
      return isAr ? "منذ شهر" : (isDe ? "vor 1 Monat" : "1 month ago");
    } catch {
      return isAr ? "منذ شهر" : (isDe ? "vor 1 Monat" : "1 month ago");
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString(isAr ? "ar-SA" : (isDe ? "de-DE" : "en-GB"), {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const gradientTitleClasses = cn(
    "bg-clip-text text-transparent font-bold",
    isAr ? "bg-gradient-to-r" : "bg-gradient-to-l",
    "from-[#032C44] to-[#41A0CA]"
  );

  // ── Filter tickets ──
  const filteredTickets =
    statusFilter === "all"
      ? tickets
      : tickets.filter((t) => {
          const status = t.status || "pending";
          if (statusFilter === "open") {
            return status === "open" || status === "answered";
          }
          return status === statusFilter;
        });

  // Status counts
  const statusCounts = {
    all: tickets.length,
    pending: tickets.filter((t) => (t.status || "pending") === "pending").length,
    open: tickets.filter((t) => t.status === "open" || t.status === "answered").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  };

  return (
    <DashboardPageShell
      title={isAr ? "الدعم الفني والتذاكر" : (isDe ? "Support-Tickets" : "Tickets & Support")}
      description={isAr ? "تابع تذاكر الدعم الفني الخاصة بشركتك واستفساراتك التجارية" : (isDe ? "Verfolgen Sie die Support-Tickets und geschäftlichen Anfragen Ihres Unternehmens" : "Track your company's support tickets and business inquiries")}
      isRTL={isAr}
      action={
        <PrimaryButton
          onClick={() => setShowNewTicketModal(true)}
          className="h-9 rounded-lg px-4 w-auto text-sm"
        >
          <span className="text-[16px] font-bold me-1">+</span>
          <span>{isAr ? "تذكرة جديدة" : (isDe ? "Neues Ticket" : "New Ticket")}</span>
        </PrimaryButton>
      }
    >
      <div className="w-full space-y-6 pb-10" dir={isAr ? "rtl" : "ltr"}>

      {/* ── Status Filter Tabs ── */}
      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "open", "closed"] as const).map((status) => {
          const labels: Record<string, string> = {
            all: isAr ? "الكل" : (isDe ? "Alle" : "All"),
            pending: isAr ? "معلق" : (isDe ? "Ausstehend" : "Pending"),
            open: isAr ? "مفتوح" : (isDe ? "Offen" : "Open"),
            closed: isAr ? "مغلق" : (isDe ? "Geschlossen" : "Closed"),
          };
          const count = statusCounts[status];
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-2 rounded-full text-[13px] font-semibold border transition-all cursor-pointer",
                isActive
                  ? "bg-gradient-to-b from-[#006EA8] to-[#005685] text-white border-transparent shadow-md"
                  : "bg-white text-[#525252] border-[#E5E7EB] hover:border-[#40A0CA] hover:text-[#006EA8]"
              )}
            >
              {labels[status]} ({count})
            </button>
          );
        })}
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => {
            const lastUpdated = ticket.updated_at || ticket.created_at;
            const status = ticket.status || "pending";
            const attachment = ticket.file || ticket.attachment;

            return (
              <div
                key={ticket.id}
                onClick={() => openTicketDetail(ticket)}
                className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm hover:shadow-md hover:border-[#40A0CA]/40 transition-all space-y-4 cursor-pointer group"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[17px] font-bold text-[#032C44] group-hover:text-[#006EA8] transition-colors truncate">
                        {ticket.subject}
                      </h3>
                      {/* Priority badge */}
                      <span className={cn(
                        "text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize",
                        getPriorityColor(ticket.priority || "high")
                      )}>
                        {getPriorityLabel(ticket.priority || "high")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      {isAr ? "آخر تحديث:" : (isDe ? "Letzte Aktualisierung:" : "Last Update:")} {formatLastReply(lastUpdated)}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span
                    className={cn(
                      "text-[11px] font-bold px-3 py-1 rounded-full border shrink-0",
                      status === "pending" && "border-[#FFB64D] bg-[#FFF8EE] text-[#FFB64D]",
                      status === "open" && "border-[#39DA8A] bg-[#EAFBF3] text-[#39DA8A]",
                      status === "answered" && "border-[#006EA8] bg-[#F0F9FF] text-[#006EA8]",
                      status === "closed" && "border-[#FF5B5C] bg-[#FFF5F5] text-[#FF5B5C]",
                      status === "rejected" && "border-[#FF5B5C] bg-[#FFF5F5] text-[#FF5B5C]"
                    )}
                  >
                    {getStatusLabel(status)}
                  </span>
                </div>

                {/* Message body */}
                <p className="text-[14px] text-gray-600 leading-relaxed line-clamp-2">
                  {ticket.message}
                </p>

                {/* Footer: Attachment + View Detail hint */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  {attachment ? (
                    <div className="flex items-center gap-2 text-xs text-[#006EA8] truncate">
                      <img src="/portfolio/pdf.svg" alt="File Icon" className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate font-semibold">{getFilenameFromUrl(attachment)}</span>
                    </div>
                  ) : (
                    <span />
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-[#006EA8] font-semibold bg-[#F0F9FF] hover:bg-[#E0F3FC] border border-[#D0E9F7] rounded-full px-3 py-1 transition-colors">
                    {isAr ? "عرض التفاصيل" : (isDe ? "Details anzeigen" : "View Details")}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-12 text-center shadow-sm">
            <img src="/portfolio/drop.svg" alt="Empty" className="w-16 h-16 mx-auto opacity-40 mb-4" />
            <p className="text-gray-500 font-medium">
              {statusFilter === "all"
                ? (isAr ? "لا توجد تذاكر دعم فني مفتوحة حالياً للشركة" : (isDe ? "Derzeit sind keine Support-Tickets für das Unternehmen geöffnet" : "No corporate support tickets open at the moment"))
                : (isAr ? "لا توجد تذاكر بهذه الحالة" : (isDe ? "Keine Tickets mit diesem Status" : "No tickets with this status"))}
            </p>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TICKET DETAIL / REPLY MODAL */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-[600px] p-0 rounded-[20px] bg-white border-0 shadow-lg max-h-[90vh] overflow-hidden flex flex-col">
          {selectedTicket && (
            <>
              {/* Header */}
              <div className="p-6 pb-4 border-b border-gray-100 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <DialogTitle className={cn("text-[18px] leading-snug", gradientTitleClasses)}>
                    {selectedTicket.subject}
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={cn(
                      "text-[11px] font-bold px-3 py-1 rounded-full border",
                      (selectedTicket.status || "pending") === "pending" && "border-[#FFB64D] bg-[#FFF8EE] text-[#FFB64D]",
                      (selectedTicket.status || "pending") === "open" && "border-[#39DA8A] bg-[#EAFBF3] text-[#39DA8A]",
                      (selectedTicket.status || "pending") === "answered" && "border-[#006EA8] bg-[#F0F9FF] text-[#006EA8]",
                      (selectedTicket.status || "pending") === "closed" && "border-[#FF5B5C] bg-[#FFF5F5] text-[#FF5B5C]"
                    )}>
                      {getStatusLabel(selectedTicket.status || "pending")}
                    </span>
                    <span className={cn(
                      "text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize",
                      getPriorityColor(selectedTicket.priority || "high")
                    )}>
                      {getPriorityLabel(selectedTicket.priority || "high")}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(selectedTicket.created_at)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition cursor-pointer shrink-0"
                >
                  <img src="/portfolio/close-circle.svg" alt="Close" className="w-7 h-7" />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Original message */}
                <div className="rounded-[12px] bg-[#F4FAFF] border border-[#E0F0FF] p-4">
                  <p className="text-xs font-semibold text-[#006EA8] mb-2">
                    {isAr ? "الرسالة الأصلية" : (isDe ? "Original-Nachricht" : "Original Message")}
                  </p>
                  <p className="text-[14px] text-[#032C44] leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.message}
                  </p>
                </div>

                {/* Attachment */}
                {(selectedTicket.file || selectedTicket.attachment) && (
                  <div className="flex items-center gap-2 text-xs text-[#006EA8]">
                    <img src="/portfolio/pdf.svg" alt="File" className="w-5 h-5 flex-shrink-0" />
                    <a
                      href={selectedTicket.file || selectedTicket.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate font-semibold hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {getFilenameFromUrl(selectedTicket.file || selectedTicket.attachment)}
                    </a>
                  </div>
                )}

                {/* Replies */}
                {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {isAr ? "الردود" : (isDe ? "Antworten" : "Replies")} ({selectedTicket.replies.length})
                    </p>
                    {selectedTicket.replies.map((reply: any, idx: number) => {
                      const isSupport =
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
                            reply.user.toLowerCase().includes("support")));

                      return (
                        <div
                          key={reply.id || idx}
                          className={cn(
                            "rounded-[12px] p-4 border",
                            isSupport
                              ? "bg-[#FFF9F0] border-[#FFE5C2]"
                              : "bg-white border-[#E5E7EB]"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[13px] font-bold text-[#032C44]">
                              {isSupport
                                ? (isAr ? "الدعم الفني" : (isDe ? "Technischer Support" : "Technical Support"))
                                : (isAr ? "أنت" : (isDe ? "Sie" : "You"))}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {formatDate(reply.created_at)}
                            </span>
                          </div>
                          <p className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {reply.message || reply.body || reply.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {loadingDetail && (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#006EA8]"></div>
                  </div>
                )}
              </div>

              {/* Reply input - only show if ticket is not closed */}
              {(selectedTicket.status || "pending") !== "closed" && (
                <div className="p-6 pt-4 border-t border-gray-100 space-y-3">
                  <Textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={isAr ? "اكتب ردك هنا..." : (isDe ? "Schreiben Sie Ihre Antwort hier..." : "Type your reply here...")}
                    className="border border-[#E5E7EB] focus:border-[#40A0CA] rounded-[8px] px-3 py-2 text-sm w-full outline-none resize-none"
                  />
                  <div className="flex justify-end">
                    <PrimaryButton
                      onClick={handleReply}
                      disabled={replying || !replyText.trim()}
                      className="px-6 w-auto cursor-pointer"
                    >
                      {replying
                        ? (isAr ? "جاري الإرسال..." : (isDe ? "Wird gesendet..." : "Sending..."))
                        : (isAr ? "إرسال الرد" : (isDe ? "Antwort senden" : "Send Reply"))}
                    </PrimaryButton>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* NEW TICKET MODAL */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={showNewTicketModal} onOpenChange={setShowNewTicketModal}>
        <DialogContent className="max-w-[550px] p-6 rounded-[20px] bg-white border-0 shadow-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <DialogTitle className={gradientTitleClasses}>
              {isAr ? "تذكرة جديدة" : (isDe ? "Neues Ticket" : "New Ticket")}
            </DialogTitle>
            <button
              onClick={() => setShowNewTicketModal(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition cursor-pointer"
            >
              <img src="/portfolio/close-circle.svg" alt="Close" className="w-7 h-7" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Subject and Priority Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[14px] font-bold text-[#032C44]">
                  {isAr ? "الموضوع *" : (isDe ? "Betreff *" : "Subject *")}
                </label>
                <Input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={isAr ? "موضوع التذكرة" : (isDe ? "Ticket-Betreff" : "Ticket Subject")}
                  className="border border-[#E5E7EB] focus:border-[#40A0CA] rounded-[8px] px-3 py-2 text-sm w-full outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[14px] font-bold text-[#032C44]">
                  {isAr ? "الأولوية *" : (isDe ? "Priorität *" : "Priority *")}
                </label>
                <div className="relative">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="appearance-none border border-[#E5E7EB] focus:border-[#40A0CA] bg-white rounded-[8px] px-3 py-2 pr-8 text-sm w-full outline-none text-[#032C44]"
                  >
                    <option value="high">{isAr ? "عالي" : (isDe ? "Hoch" : "High")}</option>
                    <option value="medium">{isAr ? "متوسط" : (isDe ? "Mittel" : "Medium")}</option>
                    <option value="low">{isAr ? "منخفض" : (isDe ? "Niedrig" : "Low")}</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <img src="/portfolio/arrow-down.svg" alt="Select" className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-1">
              <label className="text-[14px] font-bold text-[#032C44]">
                {isAr ? "نص الرسالة *" : (isDe ? "Nachricht *" : "Message *")}
              </label>
              <Textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isAr ? "اكتب تفاصيل الاستفسار التجاري هنا..." : (isDe ? "Schreiben Sie hier Details zu Ihrer geschäftlichen Anfrage..." : "Write details about your corporate inquiry here...")}
                className="border border-[#E5E7EB] focus:border-[#40A0CA] rounded-[8px] px-3 py-2 text-sm w-full outline-none resize-none"
              />
            </div>

            {/* File Drag and Drop Zone */}
            <div className="space-y-1">
              <label className="text-[14px] font-bold text-[#032C44]">
                {isAr ? "المرفقات" : (isDe ? "Anhänge" : "Attachments")}
              </label>
              <div
                onClick={triggerFileSelect}
                className="border-2 border-dashed border-[#40A0CA] bg-[#F4FAFF] hover:bg-[#EBF7FF] transition rounded-[12px] py-8 px-4 flex flex-col items-center justify-center cursor-pointer text-center"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <img src="/portfolio/drop.svg" alt="Upload" className="w-[42px] h-[42px] mb-2" />
                <p className="text-[#032C44] text-[13px] font-medium">
                  {attachmentFile ? (
                    <span className="text-[#006EA8]">{attachmentFile.name}</span>
                  ) : isAr ? (
                    <>قم بسحب الملف هنا، أو <span className="text-[#006EA8] underline">تصفح</span></>
                  ) : isDe ? (
                    <>Datei hierher ziehen oder <span className="text-[#006EA8] underline">durchsuchen</span></>
                  ) : (
                    <>Drop a file, or <span className="text-[#006EA8] underline">browse</span></>
                  )}
                </p>
                <p className="text-[#6B7280] text-[10px] mt-1.5">
                  {isAr
                    ? "حجم الملف أقل من 10MB وصيغ الملفات المقبولة pdf, png, jpg, jpeg"
                    : isDe
                      ? "Die Dateigröße sollte weniger als 10 MB betragen und zulässige Formate sind pdf, png, jpg, jpeg"
                      : "File size should be less than 10MB and file type should be jpg, jpeg, png, pdf"}
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                type="button"
                onClick={() => setShowNewTicketModal(false)}
                className="px-10 h-[44px] border border-[#006EA8] text-[#006EA8] bg-white hover:bg-[#F0F9FF] font-bold rounded-[12px] text-[15px] transition cursor-pointer"
              >
                {isAr ? "إلغاء" : (isDe ? "Abbrechen" : "Cancel")}
              </button>
              <PrimaryButton
                type="submit"
                disabled={submitting}
                className="px-10 w-auto cursor-pointer"
              >
                {isAr ? "إرسال التذكرة" : (isDe ? "Absenden" : "Submit")}
              </PrimaryButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardPageShell>
  );
}
