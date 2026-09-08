import { calculateMatch } from '@/services/calculateMatch'
import { persistOptimizedVersion } from '@/services/generateResumeVersion'
import {
  getJobById,
  getMatchById,
  getResume,
  replaceMatch,
} from '@/lib/storage'
import type { Match } from '@/types/models'

export function recalculateMatch(matchId: string): Match | undefined {
  const previous = getMatchById(matchId)
  if (!previous) return undefined
  const job = getJobById(previous.jobId)
  if (!job) return undefined

  const resume = getResume()
  const next = calculateMatch(resume, job)
  const updated: Match = {
    ...next,
    id: previous.id,
    createdAt: previous.createdAt,
  }
  replaceMatch(updated)
  persistOptimizedVersion(updated, resume)
  return updated
}
