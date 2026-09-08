import { getJobById, getResume, getVersionByMatchId, saveVersion } from '@/lib/storage'
import { calculateMatch } from '@/services/calculateMatch'
import { optimizeForATS } from '@/services/optimizeForATS'
import { createId } from '@/lib/text'
import type { AtsLevel, Job, Match, Resume, ResumeFont, ResumeStyle, ResumeVersion } from '@/types/models'

// Futuro: gerar redação com IA a partir somente dos dados informados pelo usuário.
export function generateResumeVersion(
  resume: Resume,
  job: Job,
  match: Match,
  options?: {
    language?: 'pt' | 'en'
    style?: ResumeStyle
    font?: ResumeFont
    atsLevel?: AtsLevel
  },
): ResumeVersion {
  const language = options?.language ?? 'pt'
  const style = options?.style ?? 'moderno'
  const font = options?.font ?? 'calibri'
  const atsLevel = options?.atsLevel ?? 'equilibrado'
  const { resume: optimizedResume, atsScore } = optimizeForATS(
    resume,
    job,
    atsLevel,
    match,
  )
  const previewMatch = calculateMatch(optimizedResume, job)

  return {
    id: createId('version'),
    resumeId: resume.id,
    jobId: job.id,
    matchId: match.id,
    title: `${job.title} — ${job.company}`,
    kind: 'ats',
    content: optimizedResume,
    matchScore: previewMatch.score,
    atsScore,
    previousMatchScore: match.score,
    previousAtsScore: match.atsScore,
    language,
    style,
    font,
    atsLevel,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function persistOptimizedVersion(
  match: Match,
  resume = getResume(),
): ResumeVersion | undefined {
  const job = getJobById(match.jobId)
  if (!job) return undefined
  const existing = getVersionByMatchId(match.id)
  const generated = generateResumeVersion(resume, job, match, {
    language: existing?.language,
    style: existing?.style,
    font: existing?.font,
    atsLevel: existing?.atsLevel,
  })
  const version: ResumeVersion = existing
    ? { ...generated, id: existing.id, createdAt: existing.createdAt }
    : generated
  saveVersion(version)
  return version
}
