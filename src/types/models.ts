export type WorkMode = 'remoto' | 'híbrido' | 'presencial'
export type Seniority = 'estágio' | 'júnior' | 'pleno' | 'sênior' | 'especialista'
export type SkillLevel = 'básico' | 'intermediário' | 'avançado'
export type ResumeStyle = 'tradicional' | 'moderno' | 'executivo' | 'tech'
export type ResumeFont = 'arial' | 'calibri' | 'georgia' | 'garamond' | 'verdana'
export type ResumeVersionKind = 'ats' | 'restyle'
export type AtsLevel = 'equilibrado' | 'maximo'
export type AppTheme = 'light' | 'dark'

export interface PersonalInfo {
  fullName: string
  desiredRole?: string
  email: string
  phone: string
  location: string
  linkedin?: string
  github?: string
  website?: string
}

export interface Experience {
  id: string
  company: string
  role: string
  startDate: string
  endDate: string | null
  current: boolean
  location?: string
  description: string
  highlights: string[]
  skills: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string | null
}

export interface Skill {
  id: string
  name: string
  level?: SkillLevel
}

export interface Language {
  id: string
  name: string
  level: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  date: string
}

export interface Resume {
  id: string
  personal: PersonalInfo
  summary: string
  experiences: Experience[]
  education: Education[]
  skills: Skill[]
  languages: Language[]
  certifications: Certification[]
  updatedAt: string
  sourceFileName?: string
  rawText?: string
}

export interface Job {
  id: string
  title: string
  company: string
  location: string
  workMode: WorkMode
  seniority: Seniority
  salary: string
  description: string
  requirements: string[]
  skills: string[]
  postedAt: string
  sourceUrl?: string
  rawText?: string
}

export interface ResumeAnalysis {
  keywordSet: string[]
  skillNames: string[]
  hasSummary: boolean
  hasExperiences: boolean
  hasEducation: boolean
  hasContact: boolean
  bulletCount: number
}

export interface JobAnalysis {
  keywordSet: string[]
  skillNames: string[]
  seniority: Seniority
}

export interface AtsBreakdown {
  structure: number
  keywords: number
  experience: number
  skills: number
  readability: number
}

export interface MatchBreakdown {
  skills: number
  experience: number
  keywords: number
  seniority: number
}

export interface Match {
  id: string
  jobId: string
  resumeId: string
  score: number
  atsScore: number
  atsBreakdown: AtsBreakdown
  matchBreakdown: MatchBreakdown
  matchedSkills: string[]
  partialSkills: string[]
  missingSkills: string[]
  foundKeywords: string[]
  missingKeywords: string[]
  keywords: string[]
  createdAt: string
}

export interface ResumeVersion {
  id: string
  resumeId: string
  jobId: string
  matchId: string
  kind?: ResumeVersionKind
  title: string
  content: Resume
  matchScore: number
  atsScore: number
  previousMatchScore: number
  previousAtsScore: number
  language: 'pt' | 'en'
  style: ResumeStyle
  font?: ResumeFont
  atsLevel: AtsLevel
  createdAt: string
  updatedAt: string
}

export interface AppPreferences {
  theme: AppTheme
  language: 'pt' | 'en'
}
