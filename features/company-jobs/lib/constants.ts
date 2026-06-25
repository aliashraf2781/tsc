export const JOB_GENDERS = ["Male", "Female", "All"] as const
export type JobGender = (typeof JOB_GENDERS)[number]

export const JOB_TYPES = ["full_time", "part_time"] as const
export type JobType = (typeof JOB_TYPES)[number]

/** German federal states (Bundesländer) for job location */
export const GERMAN_STATES = [
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen",
] as const
