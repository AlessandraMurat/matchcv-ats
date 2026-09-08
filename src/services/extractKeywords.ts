import { normalizeText } from '@/lib/text'

export const KNOWN_SKILLS = [
  'React',
  'React Native',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Express',
  'NestJS',
  'Python',
  'Django',
  'FastAPI',
  'Java',
  'Spring Boot',
  'PHP',
  'Laravel',
  'SQL',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'GCP',
  'Azure',
  'Git',
  'GitHub Actions',
  'CI/CD',
  'REST APIs',
  'GraphQL',
  'HTML',
  'CSS',
  'Tailwind CSS',
  'SASS',
  'Jest',
  'Cypress',
  'Playwright',
  'Figma',
  'Redux',
  'Vue',
  'Angular',
  'Linux',
  'Terraform',
  'Kafka',
  'Scrum',
  'Agile',
]

export function extractKeywords(text: string): string[] {
  const normalized = normalizeText(text)
  const found = KNOWN_SKILLS.filter((skill) => {
    const needle = normalizeText(skill)
    return (
      normalized.includes(needle) ||
      normalized.includes(needle.replace(/\s/g, ''))
    )
  })

  return [...new Set(found)]
}

export function splitLines(text: string): string[] {
  return text
    .split(/\r?\n|•|- /)
    .map((line) => line.replace(/^[\d.)\s]+/, '').trim())
    .filter((line) => line.length > 3)
}
