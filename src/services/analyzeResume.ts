import type { Resume, ResumeAnalysis } from '@/types/models'

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .split(/[^a-z0-9.+#]+/u)
    .filter((token) => token.length > 2)
}

export function analyzeResume(resume: Resume): ResumeAnalysis {
  const skillNames = resume.skills.map((skill) => skill.name)
  const experienceText = resume.experiences
    .flatMap((experience) => [
      experience.role,
      experience.description,
      ...experience.highlights,
      ...experience.skills,
    ])
    .join(' ')

  const keywordSet = [
    ...new Set([
      ...skillNames,
      ...tokenize(`${resume.summary} ${experienceText}`),
    ]),
  ]

  return {
    keywordSet,
    skillNames,
    hasSummary: resume.summary.trim().length > 40,
    hasExperiences: resume.experiences.length > 0,
    hasEducation: resume.education.length > 0,
    hasContact: Boolean(resume.personal.email && resume.personal.phone),
    bulletCount: resume.experiences.reduce(
      (total, experience) => total + experience.highlights.length,
      0,
    ),
  }
}
