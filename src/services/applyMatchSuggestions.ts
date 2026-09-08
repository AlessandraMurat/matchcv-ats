import { createId, normalizeText } from '@/lib/text'
import { normalizeSkill } from '@/services/calculateMatch'
import type { Job, Match, Resume, Skill } from '@/types/models'

function knowledgeText(resume: Resume): string {
  return [
    resume.summary,
    resume.rawText ?? '',
    resume.personal.desiredRole ?? '',
    ...resume.skills.map((skill) => skill.name),
    ...resume.experiences.flatMap((experience) => [
      experience.role,
      experience.description,
      ...experience.highlights,
      ...experience.skills,
    ]),
  ].join('\n')
}

export function userHasKnowledge(resume: Resume, term: string): boolean {
  const needle = normalizeSkill(term)
  if (!needle) return false
  const corpus = normalizeText(knowledgeText(resume))
  return (
    resume.skills.some((skill) => normalizeSkill(skill.name) === needle) ||
    resume.experiences.some((experience) =>
      experience.skills.some((skill) => normalizeSkill(skill) === needle),
    ) ||
    corpus.includes(needle) ||
    corpus.includes(needle.replace(/\s/g, ''))
  )
}

function originalName(resume: Resume, term: string): string | undefined {
  const needle = normalizeSkill(term)
  const fromSkills = resume.skills.find((skill) => normalizeSkill(skill.name) === needle)
  if (fromSkills) return fromSkills.name
  return resume.experiences
    .flatMap((experience) => experience.skills)
    .find((skill) => normalizeSkill(skill) === needle)
}

function stripGeneratedTail(summary: string): string {
  return summary
    .replace(/\s*Experiência com .+?, alinhada à vaga de .+\.?\s*$/i, '')
    .replace(/\s*Competências já utilizadas: .+\.?\s*$/i, '')
    .trim()
}

function keywordHits(text: string, keywords: string[]): number {
  const haystack = normalizeText(text)
  return keywords.filter((keyword) => haystack.includes(normalizeSkill(keyword))).length
}

export function applyMatchSuggestions(
  resume: Resume,
  job: Job,
  match?: Match,
): Resume {
  const ownedFromJob = [...job.skills, ...(match?.foundKeywords ?? [])].filter(
    (term, index, list) => list.findIndex((item) => normalizeSkill(item) === normalizeSkill(term)) === index,
  ).filter((term) => userHasKnowledge(resume, term))

  const skills: Skill[] = [...resume.skills]
  for (const term of ownedFromJob) {
    const name = originalName(resume, term)
    if (!name) continue
    if (!skills.some((skill) => normalizeSkill(skill.name) === normalizeSkill(name))) {
      skills.push({ id: createId('sk'), name })
    }
  }

  const rankedSkills = [
    ...skills.filter((skill) =>
      ownedFromJob.some((term) => normalizeSkill(term) === normalizeSkill(skill.name)),
    ),
    ...skills.filter(
      (skill) =>
        !ownedFromJob.some((term) => normalizeSkill(term) === normalizeSkill(skill.name)),
    ),
  ]

  const experiences = [...resume.experiences]
    .map((experience) => {
      const highlights = [...experience.highlights].sort(
        (a, b) => keywordHits(b, ownedFromJob) - keywordHits(a, ownedFromJob),
      )
      return { ...experience, highlights }
    })
    .sort(
      (a, b) =>
        keywordHits(
          `${a.role} ${a.description} ${a.highlights.join(' ')} ${a.skills.join(' ')}`,
          ownedFromJob,
        ) -
        keywordHits(
          `${b.role} ${b.description} ${b.highlights.join(' ')} ${b.skills.join(' ')}`,
          ownedFromJob,
        ),
    )
    .reverse()

  const baseSummary = stripGeneratedTail(resume.summary)
  const ownedNames = ownedFromJob
    .map((term) => originalName(resume, term))
    .filter((name): name is string => Boolean(name))
    .filter(
      (name, index, list) =>
        list.findIndex((item) => normalizeSkill(item) === normalizeSkill(name)) === index,
    )
    .slice(0, 6)
  let summary = baseSummary
  if (!summary && resume.personal.desiredRole) {
    summary = resume.personal.desiredRole
  }
  if (ownedNames.length > 0) {
    const alreadyListed = ownedNames.every((name) =>
      normalizeText(summary).includes(normalizeSkill(name)),
    )
    if (!alreadyListed) {
      summary = `${summary} Competências já utilizadas: ${ownedNames.join(', ')}.`.trim()
    }
  }

  return {
    ...resume,
    summary,
    skills: rankedSkills,
    experiences,
    updatedAt: new Date().toISOString(),
  }
}

export function classifyMatchSuggestions(resume: Resume, match: Match) {
  const skippedSkills = match.missingSkills.filter((skill) => !userHasKnowledge(resume, skill))
  const highlightedSkills = match.missingSkills.filter((skill) => userHasKnowledge(resume, skill))
  const skippedKeywords = match.missingKeywords.filter((keyword) => !userHasKnowledge(resume, keyword))
  const highlightedKeywords = match.missingKeywords.filter((keyword) =>
    userHasKnowledge(resume, keyword),
  )
  return { skippedSkills, highlightedSkills, skippedKeywords, highlightedKeywords }
}
