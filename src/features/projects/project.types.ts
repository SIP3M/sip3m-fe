export type ProjectStatus =
  | "ON_TRACK"
  | "DELAYED"

export interface Project {
  id: number
  name: string
  leader: string
  progress: number
  milestone: string
  status: ProjectStatus
}