import { EMPTY_RESUME, MOCK_RESUME } from '@/data/mock'
import type { AppPreferences, AppTheme, Job, Match, Resume, ResumeVersion } from '@/types/models'

const KEYS = {
  resume: 'matchcv:v2:resume',
  jobs: 'matchcv:v2:jobs',
  matches: 'matchcv:v2:matches',
  versions: 'matchcv:v2:versions',
  prefs: 'matchcv:v3:prefs',
  seeded: 'matchcv:v2:seeded',
} as const

const DEFAULT_PREFS: AppPreferences = {
  theme: 'dark',
  language: 'pt',
}

function readJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getResume(): Resume {
  return readJson(KEYS.resume, MOCK_RESUME)
}

export function saveResume(resume: Resume) {
  writeJson(KEYS.resume, { ...resume, updatedAt: new Date().toISOString() })
}

export function getJobs(): Job[] {
  return readJson<Job[]>(KEYS.jobs, [])
}

export function saveJob(job: Job) {
  writeJson(KEYS.jobs, [job, ...getJobs().filter((item) => item.id !== job.id)])
}

export function getJobById(jobId: string): Job | undefined {
  return getJobs().find((job) => job.id === jobId)
}

export function getMatches(): Match[] {
  return readJson<Match[]>(KEYS.matches, [])
}

export function saveMatch(match: Match) {
  writeJson(KEYS.matches, [match, ...getMatches().filter((item) => item.id !== match.id)])
}

export function replaceMatch(match: Match) {
  writeJson(KEYS.matches, getMatches().map((item) => (item.id === match.id ? match : item)))
}

export function getMatchById(matchId: string): Match | undefined {
  return getMatches().find((match) => match.id === matchId)
}

export function getVersions(): ResumeVersion[] {
  return readJson<ResumeVersion[]>(KEYS.versions, [])
}

export function saveVersion(version: ResumeVersion) {
  const others = getVersions().filter((item) => item.id !== version.id)
  const replaceByMatch = version.kind !== 'restyle' && Boolean(version.matchId)
  writeJson(KEYS.versions, [
    version,
    ...(replaceByMatch ? others.filter((item) => item.matchId !== version.matchId) : others),
  ])
}

export function getVersionById(versionId: string): ResumeVersion | undefined {
  return getVersions().find((version) => version.id === versionId)
}

export function getVersionByMatchId(matchId: string): ResumeVersion | undefined {
  return getVersions().find((version) => version.matchId === matchId)
}

export function deleteVersion(versionId: string) {
  writeJson(
    KEYS.versions,
    getVersions().filter((version) => version.id !== versionId),
  )
}

function applyTheme(theme: AppTheme) {
  document.documentElement.classList.toggle('light', theme === 'light')
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function getPreferences(): AppPreferences {
  return readJson(KEYS.prefs, DEFAULT_PREFS)
}

export function savePreferences(prefs: AppPreferences) {
  writeJson(KEYS.prefs, prefs)
  applyTheme(prefs.theme)
}

export function restoreDemoData() {
  writeJson(KEYS.resume, MOCK_RESUME)
  writeJson(KEYS.jobs, [])
  writeJson(KEYS.matches, [])
  writeJson(KEYS.versions, [])
}

export function clearResume() {
  writeJson(KEYS.resume, {
    ...EMPTY_RESUME,
    updatedAt: new Date().toISOString(),
  })
}

export function clearLocalData() {
  writeJson(KEYS.resume, EMPTY_RESUME)
  writeJson(KEYS.jobs, [])
  writeJson(KEYS.matches, [])
  writeJson(KEYS.versions, [])
}

export function seedStorage() {
  if (localStorage.getItem(KEYS.seeded) === 'true') {
    applyTheme(getPreferences().theme)
    return
  }

  writeJson(KEYS.resume, MOCK_RESUME)
  writeJson(KEYS.jobs, [])
  writeJson(KEYS.matches, [])
  writeJson(KEYS.versions, [])
  writeJson(KEYS.prefs, DEFAULT_PREFS)
  localStorage.setItem(KEYS.seeded, 'true')
  applyTheme('dark')
}
