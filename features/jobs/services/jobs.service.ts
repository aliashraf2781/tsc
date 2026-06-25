export function getJobKeys() {
  return ["frontend", "marketing", "uiux", "sales", "hr", "accounting"] as const
}

export function getJobFilterKeys() {
  return ["all", "design", "development", "marketing", "medical"] as const
}
