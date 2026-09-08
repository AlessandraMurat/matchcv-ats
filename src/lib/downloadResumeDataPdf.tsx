import { ResumePreview } from '@/components/resume/ResumePreview'
import { downloadResumePdf, printResumeElement, resumeFileName } from '@/lib/exportResume'
import { RESUME_PAGE_WIDTH } from '@/lib/resumeLook'
import type { Resume, ResumeFont, ResumeStyle } from '@/types/models'
import { createRoot } from 'react-dom/client'

export async function downloadResumeDataPdf(
  resume: Resume,
  style: ResumeStyle,
  font: ResumeFont = 'calibri',
) {
  const host = document.createElement('div')
  host.setAttribute('data-resume-export-host', 'true')
  host.style.cssText = [
    'position:fixed',
    'left:0',
    'top:0',
    `width:${RESUME_PAGE_WIDTH}px`,
    'z-index:2147483646',
    'background:#ffffff',
    'pointer-events:none',
    'opacity:1',
  ].join(';')
  document.body.appendChild(host)

  const root = createRoot(host)
  root.render(<ResumePreview resume={resume} style={style} font={font} />)
  await new Promise((resolve) => window.setTimeout(resolve, 200))

  const sheet = host.querySelector('[data-resume-sheet]')
  if (!(sheet instanceof HTMLElement)) {
    root.unmount()
    host.remove()
    throw new Error('Não foi possível montar o currículo para exportar.')
  }

  try {
    await downloadResumePdf(sheet, resumeFileName(resume, style))
  } catch {
    printResumeElement(sheet)
  } finally {
    root.unmount()
    host.remove()
  }
}
