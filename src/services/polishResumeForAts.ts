import type { Resume, Skill } from '@/types/models'

const GROUPS: { label: string; needles: string[] }[] = [
  {
    label: 'Front-end',
    needles: ['react', 'next', 'angular', 'vue', 'html', 'css', 'tailwind', 'javascript', 'typescript', 'sass', 'styled'],
  },
  {
    label: 'Back-end',
    needles: ['node', 'php', 'laravel', 'prisma', 'express', 'nest', 'java', 'spring', 'python', 'django'],
  },
  {
    label: 'Banco de dados',
    needles: ['sql', 'oracle', 'postgres', 'mysql', 'mongo', 'redis'],
  },
  {
    label: 'UX, UI e qualidade',
    needles: ['figma', 'design system', 'wcag', 'storybook', 'acessib', 'ux', 'ui', 'jest', 'cypress', 'playwright'],
  },
  {
    label: 'Inteligência Artificial',
    needles: ['ia', 'ai', 'document ai', 'openai', 'llm'],
  },
  {
    label: 'Ferramentas e metodologias',
    needles: ['git', 'docker', 'scrum', 'kanban', 'jira', 'ci/cd', 'linux', 'aws'],
  },
]

export function groupSkills(skills: Skill[]): { label: string; items: string[] }[] {
  const used = new Set<string>()
  const groups = GROUPS.map((group) => {
    const items = skills
      .filter((skill) => {
        const value = skill.name.toLowerCase()
        return group.needles.some((needle) => value.includes(needle))
      })
      .map((skill) => skill.name)
    items.forEach((item) => used.add(item))
    return { label: group.label, items: [...new Set(items)] }
  }).filter((group) => group.items.length > 0)

  const other = skills.map((skill) => skill.name).filter((name) => !used.has(name))
  if (other.length > 0) groups.push({ label: 'Outras competências', items: other })
  return groups
}

function toSentence(value: string): string {
  const text = value.replace(/^[-–•*]\s*/, '').replace(/\s+/g, ' ').trim()
  if (!text) return ''
  const capped = text.charAt(0).toUpperCase() + text.slice(1)
  return /[.!?]$/.test(capped) ? capped : `${capped}.`
}

export function polishResumeForAts(resume: Resume): Resume {
  const summary = resume.summary
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .map(toSentence)
    .join(' ')

  return {
    ...resume,
    summary,
    experiences: resume.experiences.map((experience) => ({
      ...experience,
      highlights: experience.highlights.map(toSentence).filter(Boolean),
      description: experience.description ? toSentence(experience.description) : '',
    })),
  }
}
