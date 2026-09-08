import type { Job, JobAnalysis } from '@/types/models'

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .split(/[^a-z0-9.+#]+/u)
    .filter((token) => token.length > 2)
}

export function analyzeJob(job: Job): JobAnalysis {
  const requirementText = job.requirements.join(' ')
  const keywordSet = [
    ...new Set([
      ...job.skills,
      ...tokenize(`${job.title} ${job.description} ${requirementText}`),
    ]),
  ]

  return {
    keywordSet,
    skillNames: job.skills,
    seniority: job.seniority,
  }
}
