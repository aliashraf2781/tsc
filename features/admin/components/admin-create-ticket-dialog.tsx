"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { PrimaryButton } from "@/components/ui/primary-button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Search, Paperclip, X } from "lucide-react"

export type TicketReceiverUser = {
  id: number
  name: string
  email: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  locale: string
  onCreated?: (ticketId: number, receiver: TicketReceiverUser) => void
}

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
const MAX_FILE_BYTES = 2 * 1024 * 1024

export function AdminCreateTicketDialog({ open, onOpenChange, locale, onCreated }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isAr = locale === "ar"
  const isDe = locale === "de"

  const [users, setUsers] = useState<TicketReceiverUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userQuery, setUserQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<TicketReceiverUser | null>(null)
  const [showUserList, setShowUserList] = useState(false)

  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return

    let cancelled = false
    setLoadingUsers(true)

    fetch(`/api/admin/users?locale=${locale}&role=user&per_page=100`, {
      credentials: "include",
      headers: { "Accept-Language": locale },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load users")
        const json = await res.json()
        const list = Array.isArray(json.data) ? json.data : []
        return list
          .map((u: { id?: number; name?: string; email?: string }) => ({
            id: Number(u.id),
            name: String(u.name || ""),
            email: String(u.email || ""),
          }))
          .filter((u: TicketReceiverUser) => Number.isFinite(u.id) && u.id > 0)
      })
      .then((list) => {
        if (!cancelled) setUsers(list)
      })
      .catch(() => {
        if (!cancelled) {
          toast.error(
            isAr ? "فشل تحميل المستخدمين" : isDe ? "Benutzer konnten nicht geladen werden" : "Failed to load users"
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingUsers(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, locale, isAr, isDe])

  const resetForm = () => {
    setSelectedUser(null)
    setUserQuery("")
    setSubject("")
    setMessage("")
    setPriority("medium")
    setFile(null)
    setShowUserList(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) resetForm()
    onOpenChange(nextOpen)
  }

  const filteredUsers = users.filter((u) => {
    const q = userQuery.trim().toLowerCase()
    if (!q) return true
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0]
    if (!next) return

    if (!ALLOWED_FILE_TYPES.includes(next.type) && !/\.(jpe?g|png|pdf)$/i.test(next.name)) {
      toast.error(
        isAr
          ? "الملف يجب أن يكون صورة أو PDF"
          : isDe
            ? "Datei muss JPG, PNG oder PDF sein"
            : "File must be jpg, jpeg, png, or pdf"
      )
      e.target.value = ""
      return
    }

    if (next.size > MAX_FILE_BYTES) {
      toast.error(
        isAr ? "حجم الملف يجب أن يكون أقل من 2 ميجا بايت" : isDe ? "Dateigröße max. 2 MB" : "File must be 2MB or smaller"
      )
      e.target.value = ""
      return
    }

    setFile(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUser) {
      toast.error(
        isAr ? "الرجاء اختيار مستخدم" : isDe ? "Bitte wählen Sie einen Benutzer" : "Please select a user"
      )
      return
    }
    if (!subject.trim()) {
      toast.error(
        isAr ? "الرجاء إدخال موضوع التذكرة" : isDe ? "Bitte Betreff eingeben" : "Please enter a subject"
      )
      return
    }
    if (!message.trim()) {
      toast.error(
        isAr ? "الرجاء إدخال نص الرسالة" : isDe ? "Bitte Nachricht eingeben" : "Please enter a message"
      )
      return
    }
    if (!["low", "medium", "high"].includes(priority)) {
      toast.error(isAr ? "الأولوية غير صالحة" : isDe ? "Ungültige Priorität" : "Invalid priority")
      return
    }

    try {
      setSubmitting(true)
      const formData = new FormData()
      formData.append("subject", subject.trim())
      formData.append("message", message.trim())
      formData.append("priority", priority)
      formData.append("receiver_id", String(selectedUser.id))
      if (file) formData.append("file", file)

      const res = await fetch("/api/admin/tickets", {
        method: "POST",
        credentials: "include",
        headers: { "Accept-Language": locale },
        body: formData,
      })

      const resData = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(resData.message || "Failed to create ticket")
      }

      const ticket = resData.data || resData
      const ticketId = Number(ticket?.id)
      if (!Number.isFinite(ticketId) || ticketId <= 0) {
        throw new Error("Ticket created but no id returned")
      }

      // API omits receiver_id / receiver name — keep client-side for the thread UI.
      try {
        sessionStorage.setItem(
          `ticket-receiver-${ticketId}`,
          JSON.stringify({ ...selectedUser, adminCreated: true })
        )
      } catch {
        // ignore storage failures
      }

      toast.success(
        isAr ? "تم إنشاء التذكرة بنجاح" : isDe ? "Ticket erfolgreich erstellt" : "Ticket created successfully"
      )

      onCreated?.(ticketId, selectedUser)
      handleClose(false)
      router.push(`/dashboard/admin/tickets/${ticketId}`)
    } catch (err) {
      console.error("[Admin create ticket]", err)
      const errMessage = err instanceof Error ? err.message : undefined
      toast.error(
        errMessage ||
          (isAr ? "فشل إنشاء التذكرة" : isDe ? "Ticket konnte nicht erstellt werden" : "Failed to create ticket")
      )
    } finally {
      setSubmitting(false)
    }
  }

  const gradientTitleClasses = cn(
    "bg-clip-text text-transparent font-bold",
    isAr ? "bg-gradient-to-r" : "bg-gradient-to-l",
    "from-[#032C44] to-[#41A0CA]"
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-[560px] p-0 rounded-[20px] bg-white border-0 shadow-lg overflow-hidden max-h-[90vh] flex flex-col"
        dir={isAr ? "rtl" : "ltr"}
      >
        <div className="p-6 pb-4 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <DialogTitle className={cn("text-[18px]", gradientTitleClasses)}>
              {isAr ? "بدء محادثة مع مستخدم" : isDe ? "Chat mit Benutzer starten" : "Start Chat with User"}
            </DialogTitle>
            <p className="text-xs text-gray-500 mt-1">
              {isAr
                ? "أنشئ تذكرة وحدد المستخدم كمستلم لإجراء المحادثة"
                : isDe
                  ? "Erstellen Sie ein Ticket und wählen Sie den Empfänger"
                  : "Create a ticket and assign a user as the receiver"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleClose(false)}
            className="p-1 hover:bg-gray-100 rounded-full transition cursor-pointer shrink-0"
          >
            <img src="/portfolio/close-circle.svg" alt="Close" className="w-7 h-7" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* User selector */}
          <div className="space-y-2 relative">
            <label className="text-xs font-bold text-[#032C44]">
              {isAr ? "المستخدم (المستلم)" : isDe ? "Benutzer (Empfänger)" : "User (receiver)"}{" "}
              <span className="text-red-500">*</span>
            </label>

            {selectedUser ? (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-[#40A0CA] bg-[#F0F9FF] px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#032C44] truncate">{selectedUser.name}</p>
                  <p className="text-xs text-gray-500 truncate">{selectedUser.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null)
                    setUserQuery("")
                    setShowUserList(true)
                  }}
                  className="text-xs font-semibold text-[#006EA8] hover:underline shrink-0"
                >
                  {isAr ? "تغيير" : isDe ? "Ändern" : "Change"}
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Input
                    value={userQuery}
                    onChange={(e) => {
                      setUserQuery(e.target.value)
                      setShowUserList(true)
                    }}
                    onFocus={() => setShowUserList(true)}
                    placeholder={
                      isAr ? "ابحث بالاسم أو البريد..." : isDe ? "Name oder E-Mail suchen..." : "Search by name or email..."
                    }
                    className="pr-9"
                  />
                  <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400", isAr ? "left-3" : "right-3")} />
                </div>

                {showUserList && (
                  <div className="absolute z-20 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border border-[#E5E7EB] bg-white shadow-lg">
                    {loadingUsers ? (
                      <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isAr ? "جاري التحميل..." : isDe ? "Laden..." : "Loading..."}
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <p className="text-center text-xs text-gray-400 py-6">
                        {isAr ? "لا يوجد مستخدمون" : isDe ? "Keine Benutzer" : "No users found"}
                      </p>
                    ) : (
                      filteredUsers.slice(0, 30).map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setSelectedUser(u)
                            setShowUserList(false)
                            setUserQuery("")
                          }}
                          className="w-full text-start px-3 py-2.5 hover:bg-[#F0F9FF] border-b border-gray-50 last:border-0"
                        >
                          <p className="text-sm font-semibold text-[#032C44] truncate">{u.name}</p>
                          <p className="text-xs text-gray-500 truncate">{u.email}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#032C44]">
              {isAr ? "الموضوع" : isDe ? "Betreff" : "Subject"} <span className="text-red-500">*</span>
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={255}
              placeholder={isAr ? "موضوع التذكرة" : isDe ? "Ticketbetreff" : "Ticket subject"}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#032C44]">
              {isAr ? "الأولوية" : isDe ? "Priorität" : "Priority"} <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {(["low", "medium", "high"] as const).map((p) => {
                const labels = {
                  low: isAr ? "منخفض" : isDe ? "Niedrig" : "Low",
                  medium: isAr ? "متوسط" : isDe ? "Mittel" : "Medium",
                  high: isAr ? "عالي" : isDe ? "Hoch" : "High",
                }
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                      priority === p
                        ? p === "high"
                          ? "bg-red-600 text-white border-transparent"
                          : p === "medium"
                            ? "bg-amber-500 text-white border-transparent"
                            : "bg-green-500 text-white border-transparent"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    {labels[p]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#032C44]">
              {isAr ? "الرسالة" : isDe ? "Nachricht" : "Message"} <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder={
                isAr ? "اكتب الرسالة الأولى للمحادثة..." : isDe ? "Erste Nachricht schreiben..." : "Write the first message..."
              }
              className="resize-none"
            />
          </div>

          {/* File */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#032C44]">
              {isAr ? "مرفق (اختياري)" : isDe ? "Anhang (optional)" : "Attachment (optional)"}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            {file ? (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-[#E5E7EB] px-3 py-2">
                <span className="text-xs text-[#006EA8] font-semibold truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ""
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-xs font-semibold text-[#006EA8] hover:underline"
              >
                <Paperclip className="h-4 w-4" />
                {isAr ? "إرفاق ملف (jpg/png/pdf ≤ 2MB)" : isDe ? "Datei anhängen (jpg/png/pdf ≤ 2MB)" : "Attach file (jpg/png/pdf ≤ 2MB)"}
              </button>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100"
              disabled={submitting}
            >
              {isAr ? "إلغاء" : isDe ? "Abbrechen" : "Cancel"}
            </button>
            <PrimaryButton type="submit" disabled={submitting || !selectedUser} className="min-w-[140px]">
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isAr ? "جاري الإنشاء..." : isDe ? "Erstellen..." : "Creating..."}
                </span>
              ) : (
                (isAr ? "بدء المحادثة" : isDe ? "Chat starten" : "Start Chat")
              )}
            </PrimaryButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
