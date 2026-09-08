import { createId } from '@/lib/text'
import { extractKeywords, splitLines } from '@/services/extractKeywords'
import type { Job, Seniority, WorkMode } from '@/types/models'

export interface JobInput {
  url?: string
  title?: string
  company?: string
  location?: string
  description: string
  extraSkills?: string[]
}

function detectWorkMode(text: string): WorkMode {
  const value = text.toLowerCase()
  if (value.includes('remoto') || value.includes('remote')) return 'remoto'
  if (value.includes('híbrido') || value.includes('hibrido') || value.includes('hybrid')) {
    return 'híbrido'
  }
  if (value.includes('presencial') || value.includes('on-site') || value.includes('onsite')) {
    return 'presencial'
  }
  return 'remoto'
}

function detectSeniority(text: string): Seniority {
  const value = text.toLowerCase()
  if (value.includes('estágio') || value.includes('estagio') || value.includes('intern')) {
    return 'estágio'
  }
  if (value.includes('júnior') || value.includes('junior')) return 'júnior'
  if (value.includes('sênior') || value.includes('senior') || value.includes('sr.')) {
    return 'sênior'
  }
  if (value.includes('especialista') || value.includes('staff') || value.includes('principal')) {
    return 'especialista'
  }
  return 'pleno'
}

function firstMeaningfulLine(text: string): string {
  return (
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.length > 3) ?? 'Vaga analisada'
  )
}

function extractSalary(text: string): string {
  const match = text.match(/R\$\s*[\d.]+\s*(?:–|-|a|até)\s*R\$\s*[\d.]+/i)
  return match?.[0] ?? ''
}

// Futuro: substituir por um provider de IA (análise de vaga e extração de requisitos).
export function parseJobInput(input: JobInput): Job {
  const description = input.description.trim()
  const skills = [
    ...extractKeywords(`${input.title ?? ''} ${input.company ?? ''} ${description}`),
    ...(input.extraSkills ?? []),
  ].filter((skill, index, list) => list.indexOf(skill) === index)

  const requirementBlock = description.split(/requisitos|requirements|você precisa|o que buscamos/i)[1]
  const requirements = splitLines(requirementBlock ?? description).slice(0, 8)

  return {
    id: createId('job'),
    title: input.title?.trim() || firstMeaningfulLine(description),
    company: input.company?.trim() || 'Empresa não informada',
    location: input.location?.trim() || 'Não informada',
    workMode: detectWorkMode(description),
    seniority: detectSeniority(`${input.title ?? ''} ${description}`),
    salary: extractSalary(description),
    description,
    requirements:
      requirements.length > 0 ? requirements : ['Requisitos extraídos da descrição da vaga.'],
    skills: skills.length > 0 ? skills : extractKeywords(description),
    postedAt: new Date().toISOString().slice(0, 10),
    sourceUrl: input.url?.trim() || undefined,
    rawText: description,
  }
}
