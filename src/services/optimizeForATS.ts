import { analyzeJob } from '@/services/analyzeJob'
import { applyMatchSuggestions } from '@/services/applyMatchSuggestions'
import { buildAtsBreakdown } from '@/services/calculateMatch'
import { polishResumeForAts } from '@/services/polishResumeForAts'
import type { AtsLevel, Job, Match, Resume } from '@/types/models'

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

// Nunca inventa tecnologias. Só reorganiza e destaca o que já existe no currículo.
export function optimizeForATS(
  resume: Resume,
  job: Job,
  atsLevel: AtsLevel = 'equilibrado',
  match?: Match,
): { resume: Resume; atsScore: number } {
  const optimized = polishResumeForAts(applyMatchSuggestions(resume, job, match))
  const jobAnalysis = analyzeJob(job)
  const breakdown = buildAtsBreakdown(optimized, job)
  const atsScore = clamp(
    breakdown.structure * 0.25 +
      breakdown.keywords * 0.3 +
      breakdown.experience * 0.2 +
      breakdown.skills * 0.15 +
      breakdown.readability * 0.1 +
      (atsLevel === 'maximo' ? 2 : 0) +
      (jobAnalysis.skillNames.length > 0 ? 1 : 0),
  )

  return {
    resume: {
      ...optimized,
      id: `${resume.id}-ats-${job.id}`,
    },
    atsScore: Math.min(98, atsScore),
  }
}
