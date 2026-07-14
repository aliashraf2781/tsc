"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { PrimaryButton } from "@/components/ui/primary-button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Paperclip, Send, X } from "lucide-react"
import type { NormalizedTicketMessage } from "../lib/normalize-reply"

type Props = {
  messages: NormalizedTicketMessage[]
  loading?: boolean
  sending: boolean
  disabled?: boolean
  locale: string
  onSend: (message: string, file?: File | null) => Promise<void> | void
}

export function TicketChatThread({ messages, loading, sending, disabled, locale, onSend }: Props) {
  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isAr = locale === "ar"
  const isDe = locale === "de"

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length])

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return ""
    try {
      return new Date(dateStr).toLocaleString(isAr ? "ar-SA" : isDe ? "de-DE" : "en-GB", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  const getFilenameFromUrl = (url: string) => url.substring(url.lastIndexOf("/") + 1) || url

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 2 * 1024 * 1024) {
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }
    setFile(f)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || disabled || sending) return
    await onSend(text, file)
    setText("")
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="flex flex-col h-full min-h-0" dir={isAr ? "rtl" : "ltr"}>
      {/* Message thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
        {loading && messages.length === 0 && (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-[#006EA8]" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-6">
            {isAr ? "لا توجد رسائل بعد" : isDe ? "Noch keine Nachrichten" : "No messages yet"}
          </p>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex", msg.isAdmin ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] rounded-[12px] p-3 border text-start",
                msg.isAdmin ? "bg-[#FFF9F0] border-[#FFE5C2]" : "bg-white border-[#E5E7EB]"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-bold text-[#032C44]">
                  {msg.isAdmin
                    ? isAr
                      ? "الدعم الفني"
                      : isDe
                        ? "Support"
                        : "Support"
                    : msg.senderName || (isAr ? "المستخدم" : isDe ? "Benutzer" : "User")}
                </span>
                {msg.createdAt && <span className="text-[10px] text-gray-400">{formatTime(msg.createdAt)}</span>}
              </div>
              <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
              {msg.files.length > 0 && (
                <div className="mt-2 space-y-1">
                  {msg.files.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[11px] text-[#006EA8] hover:underline truncate"
                    >
                      <Paperclip className="h-3 w-3 shrink-0" />
                      <span className="truncate">{getFilenameFromUrl(url)}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      {disabled ? (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-center text-gray-500 font-medium">
            {isAr
              ? "هذه التذكرة مغلقة ولا يمكن إرسال المزيد من الردود"
              : isDe
                ? "Dieses Ticket ist geschlossen und kann keine weiteren Antworten empfangen"
                : "This ticket is closed and cannot receive further replies"}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 space-y-2">
          {file && (
            <div className="flex items-center justify-between text-xs bg-[#F4FAFF] border border-[#E0F0FF] rounded-lg px-3 py-1.5">
              <span className="truncate text-[#006EA8] font-medium">{file.name}</span>
              <button type="button" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = "" }} className="cursor-pointer">
                <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <Textarea
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isAr ? "اكتب رسالتك هنا..." : isDe ? "Schreiben Sie hier Ihre Nachricht..." : "Type your message here..."}
              className="border border-[#E5E7EB] focus:border-[#40A0CA] rounded-[8px] px-3 py-2 text-sm w-full outline-none resize-none"
            />
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 h-9 w-9 flex items-center justify-center rounded-[8px] border border-[#E5E7EB] hover:border-[#40A0CA] text-gray-500 hover:text-[#006EA8] transition cursor-pointer"
              title={isAr ? "إرفاق ملف" : isDe ? "Datei anhängen" : "Attach file"}
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <PrimaryButton type="submit" disabled={sending || !text.trim()} className="shrink-0 w-auto px-4 h-9 cursor-pointer">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </PrimaryButton>
          </div>
        </form>
      )}
    </div>
  )
}
