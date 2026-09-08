import { analyzeResume } from '@/services/analyzeResume'
import { extractKeywords } from '@/services/extractKeywords'
import { createId, normalizeText } from '@/lib/text'
import type { AtsBreakdown, Job, Match, Resume } from '@/types/models'

const ALIASES: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  reactjs: 'react',
  'react.js': 'react',
  nodejs: 'node.js',
  node: 'node.js',
  postgres: 'postgresql',
  rest: 'rest apis',
  api: 'rest apis',
  apis: 'rest apis',
}

export function normalizeSkill(value: string): string {
  const cleaned = normalizeText(value)
  return ALIASES[cleaned] ?? cleaned
}

function resumeSkillNames(resume: Resume): string[] {
  return [
    ...resume.skills.map((skill) => skill.name),
    ...resume.experiences.flatMap((experience) => experience.skills),
  ]
}

function resumeCorpus(resume: Resume): string {
  return normalizeText(
    [
      resume.summary,
      resume.rawText ?? '',
      resume.personal.desiredRole ?? '',
      ...resumeSkillNames(resume),
      ...resume.experiences.flatMap((experience) => [
        experience.role,
        experience.description,
        ...experience.highlights,
      ]),
    ].join('\n'),
  )
}

function classifySkills(resume: Resume, jobSkills: string[]) {
  const listed = resumeSkillNames(resume).map(normalizeSkill)
  const corpus = resumeCorpus(resume)
  const matchedSkills: string[] = []
  const partialSkills: string[] = []
  const missingSkills: string[] = []

  for (const skill of jobSkills) {
    const normalized = normalizeSkill(skill)
    const exact = listed.includes(normalized)
    const inText =
      corpus.includes(normalized) || corpus.includes(normalized.replace(/\s/g, ''))
    const partial = listed.some(
      (item) =>
        item.includes(normalized) ||
        normalized.includes(item) ||
        item.split(' ').some((token) => token === normalized),
    )

    if (exact || inText) {
      matchedSkills.push(skill)
    } else if (partial) {
      partialSkills.push(skill)
    } else {
      missingSkills.push(skill)
    }
  }

  return { matchedSkills, partialSkills, missingSkills }
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function experienceScore(resume: Resume, job: Job): number {
  if (resume.experiences.length === 0) return 0
  const jobTokens = job.title.split(/\s+/).map(normalizeSkill)
  const roleHits = resume.experiences.filter((experience) =>
    jobTokens.some((token) => normalizeText(experience.role).includes(token)),
  ).length
  const skillHits = resume.experiences.filter((experience) =>
    experience.skills.some((skill) =>
      job.skills.some((jobSkill) => normalizeSkill(skill) === normalizeSkill(jobSkill)),
    ),
  ).length
  return clamp((resume.experiences.length * 18 + roleHits * 12 + skillHits * 16) / 1.2)
}

function seniorityScore(resume: Resume, job: Job): number {
  const yearsProxy = resume.experiences.length * 2
  if (job.seniority === 'júnior' || job.seniority === 'estágio') return yearsProxy >= 1 ? 90 : 50
  if (job.seniority === 'pleno') return yearsProxy >= 3 ? 85 : 55
  if (job.seniority === 'sênior') return yearsProxy >= 5 ? 80 : 45
  return yearsProxy >= 6 ? 75 : 40
}

export function buildAtsBreakdown(resume: Resume, job: Job): AtsBreakdown {
  const analysis = analyzeResume(resume)
  const jobKeywords = extractKeywords(
    `${job.title} ${job.description} ${job.skills.join(' ')} ${job.requirements.join(' ')}`,
  )
  const resumeKeywords = new Set(
    extractKeywords(
      `${resume.summary} ${resume.skills.map((skill) => skill.name).join(' ')} ${resume.experiences
        .flatMap((experience) => [experience.description, ...experience.highlights])
        .join(' ')}`,
    ).map(normalizeSkill),
  )
  const keywordHits = jobKeywords.filter((keyword) =>
    resumeKeywords.has(normalizeSkill(keyword)),
  )

  return {
    structure: clamp(
      (analysis.hasContact ? 25 : 5) +
        (analysis.hasSummary ? 20 : 0) +
        (analysis.hasExperiences ? 25 : 0) +
        (analysis.hasEducation ? 20 : 0) +
        (resume.skills.length > 0 ? 10 : 0),
    ),
    keywords: clamp(
      jobKeywords.length === 0 ? 60 : (keywordHits.length / jobKeywords.length) * 100,
    ),
    experience: clamp(
      (analysis.hasExperiences ? 50 : 10) + Math.min(50, analysis.bulletCount * 8),
    ),
    skills: clamp(Math.min(100, resume.skills.length * 8)),
    readability: clamp(70 + (resume.summary.length > 80 ? 15 : 0) + (analysis.bulletCount > 2 ? 15 : 0)),
  }
}

// Futuro: conectar um modelo de IA para matching semântico. Hoje o cálculo é determinístico.
export function calculateMatch(resume: Resume, job: Job): Match {
  const resumeAnalysis = analyzeResume(resume)
  const jobSkills = job.skills.length > 0 ? job.skills : extractKeywords(job.description)
  const { matchedSkills, partialSkills, missingSkills } = classifySkills(resume, jobSkills)

  const skillTotal = jobSkills.length || 1
  const skillScore =
    ((matchedSkills.length + partialSkills.length * 0.45) / skillTotal) * 100
  const experience = experienceScore(resume, job)
  const seniority = seniorityScore(resume, job)

  const jobKeywords = [
    ...new Set([...jobSkills, ...extractKeywords(`${job.title} ${job.description}`)]),
  ]
  const resumeKeywordSet = new Set(resumeAnalysis.keywordSet.map(normalizeSkill))
  const foundKeywords = jobKeywords.filter((keyword) =>
    resumeKeywordSet.has(normalizeSkill(keyword)),
  )
  const missingKeywords = jobKeywords.filter(
    (keyword) => !resumeKeywordSet.has(normalizeSkill(keyword)),
  )
  const keywordScore =
    jobKeywords.length === 0 ? 50 : (foundKeywords.length / jobKeywords.length) * 100

  const atsBreakdown = buildAtsBreakdown(resume, job)
  const atsScore = clamp(
    atsBreakdown.structure * 0.25 +
      atsBreakdown.keywords * 0.3 +
      atsBreakdown.experience * 0.2 +
      atsBreakdown.skills * 0.15 +
      atsBreakdown.readability * 0.1,
  )

  const matchBreakdown = {
    skills: clamp(skillScore),
    experience,
    keywords: clamp(keywordScore),
    seniority,
  }

  const score = clamp(
    matchBreakdown.skills * 0.4 +
      matchBreakdown.experience * 0.3 +
      matchBreakdown.keywords * 0.2 +
      matchBreakdown.seniority * 0.1,
  )

  return {
    id: createId('match'),
    jobId: job.id,
    resumeId: resume.id,
    score,
    atsScore,
    atsBreakdown,
    matchBreakdown,
    matchedSkills,
    partialSkills,
    missingSkills,
    foundKeywords,
    missingKeywords,
    keywords: jobKeywords.slice(0, 16),
    createdAt: new Date().toISOString(),
  }
}

export function explainScores(match: Match, versionAtsScore?: number) {
  const required =
    match.matchedSkills.length + match.partialSkills.length + match.missingSkills.length
  const ats = versionAtsScore ?? match.atsScore
  const skillLine =
    required === 0
      ? 'A vaga não teve uma lista clara de skills, então o Match pesou mais experiência e palavras-chave.'
      : `Das ${required} skills pedidas na vaga, ${match.matchedSkills.length} estão no seu currículo${
          match.partialSkills.length
            ? `, ${match.partialSkills.length} são parciais`
            : ''
        } e ${match.missingSkills.length} não aparecem no seu texto.`

  return {
    matchWhy: `O Match (${match.score}%) mede se o seu perfil combina com esta vaga: 40% skills, 30% experiência, 20% palavras-chave e 10% senioridade. ${skillLine} Ele não sobe inventando tecnologias que você não tem.`,
    atsWhy: `O ATS (${ats}/100) mede se o documento é fácil de um sistema ler: estrutura, palavras-chave no texto, experiências e clareza. Por isso pode ser maior que o Match — um currículo bem montado pontua no ATS mesmo quando a vaga pede stacks que não estão no seu conhecimento.`,
  }
}

export function matchLabel(score: number): string {
  if (score >= 80) return 'Excelente Match'
  if (score >= 60) return 'Bom Match'
  if (score >= 40) return 'Match moderado'
  return 'Baixo Match'
}
