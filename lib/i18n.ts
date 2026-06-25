export function safeTranslate(
  t: (key: string, ...args: any[]) => string,
  key: string,
  fallback?: string
) {
  try {
    return (t as any)(key)
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[i18n] Missing translation for \"${key}\"`, err)
    }

    if (fallback) return fallback

    const last = key.split(".").pop() || key
    // make a readable fallback: "nav.home" -> "Home"
    return String(last)
      .replace(/[-_]/g, " ")
      .replace(/(^|\s)\S/g, (s) => s.toUpperCase())
  }
}

export default safeTranslate
