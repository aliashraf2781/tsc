"use client"

// Session persistence moved to server-side via HttpOnly cookies.
// This component is intentionally a no-op to avoid posting tokens from the client.
export default function SessionPersist() {
  return null
}

