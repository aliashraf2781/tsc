import Echo from "laravel-echo"
import Pusher from "pusher-js"

declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}

type EchoInstance = InstanceType<typeof Echo<"pusher">>

let echoInstance: EchoInstance | null = null

/**
 * Lazily creates a single shared Echo/Pusher connection for the whole app.
 * Channel authorization goes through the local `/api/broadcasting/auth` proxy
 * (cookie-based) instead of a bearer token in JS, because `access_token` is
 * httpOnly — see lib/auth-token.ts and app/api/broadcasting/auth/route.ts.
 */
export function getEcho(): EchoInstance {
  if (typeof window === "undefined") {
    throw new Error("getEcho() must be called in the browser")
  }

  if (echoInstance) return echoInstance

  window.Pusher = Pusher

  echoInstance = new Echo({
    broadcaster: "pusher",
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
    cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
    forceTLS: true,
    authorizer: (channel: { name: string }) => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      authorize(socketId: string, callback: (error: Error | null, data: any) => void) {
        fetch("/api/broadcasting/auth", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ socket_id: socketId, channel_name: channel.name }),
        })
          .then((res) => {
            if (!res.ok) throw new Error(`Channel auth failed with status ${res.status}`)
            return res.json()
          })
          .then((data) => callback(null, data))
          .catch((err) => callback(err instanceof Error ? err : new Error(String(err)), null))
      },
    }),
  })

  return echoInstance
}

export function ticketChannelName(ticketId: number | string): string {
  return `ticket.${ticketId}`
}

export function leaveTicketChannel(ticketId: number | string) {
  echoInstance?.leave(ticketChannelName(ticketId))
}
