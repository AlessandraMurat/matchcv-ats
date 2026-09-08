import { createId } from '@/lib/text'
import { extractKeywords } from '@/services/extractKeywords'
import type { Education, Experience, Language, Resume, Skill } from '@/types/models'

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
const PHONE_RE = /(?:\+55\s*)?(?:\(?\d{2}\)?\s*)?\d{4,5}[-\s]?\d{4}/
const LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w%-]+/i
const GITHUB_RE = /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/i
const URL_RE = /https?:\/\/[^\s)|]+/i
const DATE_RE = /(\d{2}\/\d{4}|\d{4})\s*[-–]\s*(atual|presente|current|\d{2}\/\d{4}|\d{4})/i

const SECTION_ALIASES: Record<string, string> = {
  resumo: 'summary',
  'resumo profissional': 'summary',
  summary: 'summary',
  objetivo: 'summary',
  perfil: 'summary',
  sobre: 'summary',
  experiencia: 'experience',
  experiencias: 'experience',
  experience: 'experience',
  'experiencia profissional': 'experience',
  formacao: 'education',
  'formacao academica': 'education',
  educacao: 'education',
  education: 'education',
  habilidades: 'skills',
  competencias: 'skills',
  'competencias tecnicas': 'skills',
  skills: 'skills',
  idiomas: 'languages',
  languages: 'languages',
  certificacoes: 'certifications',
  certifications: 'certifications',
}

const SECTION_SPLITTER =
  /\s*(resumo profissional|compet[eê]ncias t[eé]cnicas|compet[eê]ncias|experi[eê]ncia profissional|experi[eê]ncias?|forma[cç][aã]o acad[eê]mica|forma[cç][aã]o|idiomas|certifica[cç][oõ]es)\s*/gi

function normalizeHeader(line: string): string {
  return line
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[:.]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function prepareText(raw: string): string {
  return raw
    .replace(/\u0000/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/(\s)((?:https?:\/\/)?(?:www\.)?(?:linkedin|github)\.com)/gi, '\n$2')
    .replace(SECTION_SPLITTER, '\n\n$1\n')
    .replace(/\s+-\s+/g, '\n- ')
    .replace(/\s+•\s+/g, '\n- ')
}

function splitSections(text: string): Record<string, string> {
  const lines = text.split(/\r?\n/)
  const sections: Record<string, string[]> = { preamble: [] }
  let current = 'preamble'

  for (const line of lines) {
    const header = normalizeHeader(line)
    if (header.length > 0 && header.length < 48) {
      const match = Object.entries(SECTION_ALIASES).find(
        ([alias]) => header === alias || header.startsWith(`${alias} `),
      )
      if (match) {
        current = match[1]
        sections[current] ??= []
        continue
      }
    }
    sections[current] ??= []
    sections[current].push(line)
  }

  return Object.fromEntries(
    Object.entries(sections).map(([key, value]) => [key, value.join('\n').trim()]),
  )
}

function looksLikePersonName(value: string): boolean {
  const cleaned = value.replace(/\s+/g, ' ').trim()
  if (cleaned.length < 5 || cleaned.length > 70) return false
  if (EMAIL_RE.test(cleaned) || PHONE_RE.test(cleaned)) return false
  if (
    /linkedin|github|http|www\.|resumo|competenc|experiencia|desenvolvedor|developer|full stack|paulo|brasil|remoto|janeiro|sorocaba|front-end|back-end/i.test(
      cleaned,
    )
  ) {
    return false
  }
  const words = cleaned.split(' ')
  if (words.length < 2 || words.length > 6) return false
  return words.every((word) => /^[A-ZÁÉÍÓÚÃÕÂÊÔÀÜ][A-Za-zÁÉÍÓÚáéíóúãõâêôàü''.-]+$/.test(word))
}

function titleCaseName(value: string): string {
  return value
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function nameFromHandle(handle: string): string {
  const decoded = decodeURIComponent(handle).replace(/[-_]+/g, ' ').trim()
  const spaced = decoded.replace(/([a-z])([A-Z])/g, '$1 $2')
  const words = spaced.split(/\s+/).filter(Boolean)
  if (words.length < 2 || words.length > 4) return ''
  if (words.some((word) => word.length < 2 || !/^[A-Za-zÁÉÍÓÚáéíóúãõâêôàü]+$/.test(word))) return ''
  return titleCaseName(words.join(' '))
}

const NAME_PREFIX_RE =
  /^([A-ZÁÉÍÓÚÃÕÂÊÔÀÜ][A-Za-zÁÉÍÓÚáéíóúãõâêôàü''.-]+(?:\s+[A-ZÁÉÍÓÚÃÕÂÊÔÀÜ][A-Za-zÁÉÍÓÚáéíóúãõâêôàü''.-]+){1,4})\b/

function extractPersonName(preamble: string, fullText: string, fileName?: string): string {
  const blob = `${preamble}\n${fullText.slice(0, 400)}`.replace(/\s+/g, ' ').trim()
  const fromBlob = blob.match(NAME_PREFIX_RE)
  if (fromBlob && looksLikePersonName(fromBlob[1])) return titleCaseName(fromBlob[1])

  const chunks = [...preamble.split(/\n/), ...fullText.slice(0, 800).split(/\n/)]
  for (const chunk of chunks) {
    const line = chunk.trim()
    if (looksLikePersonName(line)) return titleCaseName(line)
    const prefix = line.match(NAME_PREFIX_RE)
    if (prefix && looksLikePersonName(prefix[1])) return titleCaseName(prefix[1])
  }

  const github = fullText.match(GITHUB_RE)?.[0]?.match(/github\.com\/([\w-]+)/i)?.[1]
  const fromGithub = github ? nameFromHandle(github) : ''
  if (fromGithub) return fromGithub

  const linkedin = fullText.match(LINKEDIN_RE)?.[0]?.match(/linkedin\.com\/in\/([\w%-]+)/i)?.[1]
  const fromLinkedin = linkedin ? nameFromHandle(linkedin) : ''
  if (fromLinkedin) return fromLinkedin

  const fromFile = fileName
    ? nameFromHandle(
        fileName
          .replace(/\.[a-z0-9]+$/i, '')
          .replace(/curriculo|curriculum|resume|cv/gi, '')
          .trim(),
      )
    : ''
  return fromFile
}

function firstMeaningfulLines(text: string, max: number): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 1 && line.length < 180)
    .slice(0, max)
}

function extractDesiredRole(preamble: string, intro: string[]): string {
  const fromIntro = intro.find((line) =>
    /desenvolvedor|developer|analista|designer|engenheir|full stack|frontend|front-end|backend/i.test(line),
  )
  if (fromIntro && !looksLikePersonName(fromIntro) && fromIntro.length < 140) return fromIntro
  const blob = preamble.replace(/\s+/g, ' ')
  const match = blob.match(
    /(Desenvolvedor[a]?[^.|\n]{0,80}|Developer[^.|\n]{0,80}|Analista[^.|\n]{0,60})/i,
  )
  return match?.[0]?.trim().slice(0, 140) ?? ''
}

function parseDateRange(text: string): { startDate: string; endDate: string | null; current: boolean } {
  const match = text.match(DATE_RE)
  if (!match) return { startDate: '', endDate: '', current: /atual|presente|current/i.test(text) }
  const current = /atual|presente|current/i.test(match[2])
  return {
    startDate: match[1],
    endDate: current ? null : match[2],
    current,
  }
}

function isJobMetaLine(line: string): boolean {
  if (!line.includes('|')) return false
  return DATE_RE.test(line) || /\b(atual|presente|current)\b/i.test(line)
}

function explodeExperienceLines(block: string): string[] {
  return block
    .replace(/\r/g, '')
    .split('\n')
    .flatMap((raw) => {
      const line = raw.replace(/^[-–•*]\s*/, '').trim()
      if (!line) return []
      const metaAtEnd = line.match(/^(.*?)\s+([A-ZÁÉÍÓÚÃÕÂÊÔÀÜ][^|]{4,80}(?:\s*\|\s*[^|]+){2,4})$/)
      if (metaAtEnd && metaAtEnd[1].length > 40 && isJobMetaLine(metaAtEnd[2])) {
        return [metaAtEnd[1].trim(), metaAtEnd[2].trim()]
      }
      return [line]
    })
}

function parseMetaParts(meta: string): { role: string; company: string; location?: string } {
  const parts = meta.split(/\s*\|\s*/).map((part) => part.trim()).filter(Boolean)
  const datePart = parts.find((part) => DATE_RE.test(part) || /\b(atual|presente|current)\b/i.test(part))
  const location = parts.find((part) =>
    /brasil|remoto|híbrido|hibrido|presencial|são paulo|sao paulo|sorocaba|rio de janeiro/i.test(part),
  )
  const rest = parts.filter((part) => part !== datePart && part !== location)
  return {
    role: rest[0] ?? 'Experiência',
    company: rest[1] ?? '',
    location,
  }
}

function parseExperiences(block: string): Experience[] {
  if (!block.trim()) return []

  const lines = explodeExperienceLines(block)
  const metaIndexes = lines.map((line, index) => (isJobMetaLine(line) ? index : -1)).filter((index) => index >= 0)

  if (metaIndexes.length > 0) {
    return metaIndexes.slice(0, 10).map((metaIndex, index) => {
      const prev = index === 0 ? 0 : metaIndexes[index - 1] + 1
      const body = lines.slice(prev, metaIndex)
      const leftover = index === metaIndexes.length - 1 ? lines.slice(metaIndex + 1) : []
      const meta = lines[metaIndex] ?? ''
      const parsed = parseMetaParts(meta)
      const dates = parseDateRange(meta)
      const titleLine = body.find(
        (line) =>
          line.length < 80 &&
          /desenvolvedor|analista|engenheir|designer|gerente|coordenador|tech lead|full stack/i.test(line),
      )
      const narrative = [...body.filter((line) => line !== titleLine), ...leftover].filter((line) => line.length > 8)
      const role = titleLine && !restHasRole(parsed.role) ? titleLine : parsed.role
      const company = titleLine && restHasRole(parsed.role) === false ? parsed.role : parsed.company

      return {
        id: createId('exp'),
        role,
        company: company || parsed.company,
        startDate: dates.startDate,
        endDate: dates.endDate,
        current: dates.current,
        location: parsed.location,
        description: narrative.length === 1 ? narrative[0] : '',
        highlights: narrative.length > 1 ? narrative : [],
        skills: extractKeywords([meta, ...narrative].join(' ')),
      }
    })
  }

  const normalized = block.replace(/\r/g, '').trim()
  const chunks = normalized
    .split(/\n(?=[A-ZÁÉÍÓÚÃÕ].{8,80}\n)/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 8)

  const source = chunks.length > 0 ? chunks : normalized.split(/\n{2,}/)

  return source.slice(0, 10).map((chunk) => {
    const itemLines = chunk
      .split(/\n/)
      .map((line) => line.replace(/^[-–•*]\s*/, '').trim())
      .filter(Boolean)
    const role = itemLines[0] ?? 'Experiência'
    const meta = itemLines[1] ?? ''
    const metaParts = meta.split(/\s*\|\s*/)
    const dates = parseDateRange(chunk)
    const company = metaParts[0] && !DATE_RE.test(metaParts[0]) ? metaParts[0] : ''
    const location = metaParts.find((part) => /brasil|remoto|híbrido|hibrido|presencial|,/i.test(part))
    const bullets = itemLines.slice(meta ? 2 : 1).filter((line) => line.length > 8)

    return {
      id: createId('exp'),
      role: role.length > 160 ? 'Experiência' : role,
      company,
      startDate: dates.startDate,
      endDate: dates.endDate,
      current: dates.current,
      location,
      description: role.length > 160 ? role : '',
      highlights: bullets,
      skills: extractKeywords(chunk),
    }
  })
}

function restHasRole(value: string): boolean {
  return /desenvolvedor|analista|engenheir|designer|gerente|coordenador|tech lead|full stack/i.test(value)
}

function parseEducation(block: string): Education[] {
  if (!block.trim()) return []
  return block
    .split(/\n{2,}|\n(?=[A-ZÁÉÍÓÚ])/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 4)
    .slice(0, 6)
    .map((chunk) => {
      const line = chunk.split(/\n/)[0] ?? chunk
      const parts = line.split(/\s[-–|]\s/)
      return {
        id: createId('edu'),
        institution: parts[1] ?? line,
        degree: parts[0] ?? '',
        field: parts[2] ?? '',
        startDate: '',
        endDate: '',
      }
    })
}

function parseSkillLines(block: string, fallbackText: string): Skill[] {
  const lines = (block || fallbackText)
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line.includes(':') && line.length < 280)

  const fromLines = lines.flatMap((line) => {
    const [, list] = line.split(/:\s*/)
    return (list ?? '')
      .split(/,|·|;/)
      .map((name) => name.trim())
      .filter((name) => name.length > 1 && name.length < 40)
  })

  const names = fromLines.length > 0 ? fromLines : extractKeywords(`${block}\n${fallbackText}`)
  return [...new Set(names)].map((name, index) => ({ id: `sk-${index}`, name }))
}

function parseLanguages(block: string, fallback: string): Language[] {
  const source = `${block}\n${fallback}`
  const known = ['Português', 'Inglês', 'Espanhol', 'Francês', 'Alemão', 'Italiano']
  return known
    .filter((name) => new RegExp(name, 'i').test(source))
    .map((name) => ({ id: createId('lang'), name, level: '' }))
}

function contactLineParts(text: string): string[] {
  return text
    .split(/\s*\|\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function parseResumeText(rawText: string, fileName?: string): Resume {
  const text = prepareText(rawText)
  const sections = splitSections(text)
  const email = text.match(EMAIL_RE)?.[0] ?? ''
  const phone = text.match(PHONE_RE)?.[0] ?? ''
  const linkedin = text.match(LINKEDIN_RE)?.[0]
  const github = text.match(GITHUB_RE)?.[0]
  const website = text.match(URL_RE)?.[0]
  const intro = firstMeaningfulLines(sections.preamble || text, 8)
  const fullName = extractPersonName(sections.preamble || '', text, fileName)
  const desiredRole = extractDesiredRole(sections.preamble || '', intro)
  const contactParts = contactLineParts(intro.find((line) => line.includes('|')) ?? intro[2] ?? intro[1] ?? '')
  const location =
    contactParts.find((part) => /brasil|são paulo|sao paulo|sorocaba|rio de janeiro|remoto/i.test(part)) ??
    ''

  const summarySource = sections.summary || intro.filter((_, index) => index > 2).join(' ')
  const summary = summarySource.replace(/\s+/g, ' ').trim().slice(0, 1200)

  return {
    id: 'resume-base',
    personal: {
      fullName,
      desiredRole,
      email,
      phone,
      location,
      linkedin,
      github,
      website: website && !/linkedin|github/i.test(website) ? website : undefined,
    },
    summary,
    experiences: parseExperiences(sections.experience ?? ''),
    education: parseEducation(sections.education ?? ''),
    skills: parseSkillLines(sections.skills ?? '', text),
    languages: parseLanguages(sections.languages ?? '', text),
    certifications: [],
    updatedAt: new Date().toISOString(),
    sourceFileName: fileName,
    rawText: text.slice(0, 20000),
  }
}

export function hydrateResume(resume: Resume): Resume {
  if (!resume.rawText) return resume

  const parsed = parseResumeText(resume.rawText, resume.sourceFileName)
  const nameBroken =
    !resume.personal.fullName.trim() ||
    resume.personal.fullName.length > 70 ||
    /linkedin|github|http/i.test(resume.personal.fullName)
  const expBroken =
    resume.experiences.some((item) => item.role.length > 160) ||
    (resume.experiences.length === 0 && parsed.experiences.length > 0)

  if (!nameBroken && !expBroken) return resume

  return {
    ...(expBroken ? parsed : resume),
    id: resume.id,
    personal: {
      ...(expBroken ? parsed.personal : resume.personal),
      fullName: nameBroken ? parsed.personal.fullName || resume.personal.fullName : resume.personal.fullName,
      desiredRole: resume.personal.desiredRole || parsed.personal.desiredRole,
      email: resume.personal.email || parsed.personal.email,
      phone: resume.personal.phone || parsed.personal.phone,
      linkedin: resume.personal.linkedin || parsed.personal.linkedin,
      github: resume.personal.github || parsed.personal.github,
    },
    rawText: resume.rawText,
    sourceFileName: resume.sourceFileName,
    updatedAt: resume.updatedAt,
  }
}
