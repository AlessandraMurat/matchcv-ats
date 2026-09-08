import { createId } from '@/lib/text'
import { fontLabel, styleLabel } from '@/lib/resumeLook'
import { hydrateResume } from '@/services/parseResumeText'
import { polishResumeForAts } from '@/services/polishResumeForAts'
import type { Resume, ResumeFont, ResumeStyle, ResumeVersion } from '@/types/models'

function cloneResume(resume: Resume): Resume {
  return JSON.parse(JSON.stringify(resume)) as Resume
}

export function createRestyleVersion(
  resume: Resume,
  options: { style: ResumeStyle; font: ResumeFont },
): ResumeVersion {
  const content = polishResumeForAts(hydrateResume(cloneResume(resume)))
  const now = new Date().toISOString()

  return {
    id: createId('version'),
    resumeId: resume.id,
    jobId: '',
    matchId: '',
    kind: 'restyle',
    title: `Versão visual · ${styleLabel(options.style)} · ${fontLabel(options.font)}`,
    content: {
      ...content,
      id: createId('resume'),
      updatedAt: now,
    },
    matchScore: 0,
    atsScore: 0,
    previousMatchScore: 0,
    previousAtsScore: 0,
    language: 'pt',
    style: options.style,
    font: options.font,
    atsLevel: 'equilibrado',
    createdAt: now,
    updatedAt: now,
  }
}
