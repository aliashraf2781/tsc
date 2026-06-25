"use server"

import { sendContact } from "@/lib/api/services/contact.service"
import { ApiError } from "@/lib/api/client"

export async function sendContactAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const subject = formData.get("subject") as string
  const message = formData.get("message") as string

  if (!name || !email || !subject || !message) {
    return { ok: false, message: "Please fill in all required fields." }
  }

  try {
    const result = await sendContact({
      name,
      email,
      phone: phone || "",
      subject,
      message,
    })
    return { ok: true, message: result.message || "Your message has been sent successfully." }
  } catch (error) {
    console.error("Error sending contact form:", error)
    if (error instanceof ApiError) {
      return { ok: false, message: error.message }
    }
    return { ok: false, message: "An unexpected error occurred. Please try again." }
  }
}
