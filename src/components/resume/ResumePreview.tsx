import { AtsDocument } from '@/components/resume/templates/AtsDocument'
import { hydrateResume } from '@/services/parseResumeText'
import { polishResumeForAts } from '@/services/polishResumeForAts'
import { cn } from '@/lib/utils'
import type { Resume, ResumeFont, ResumeStyle } from '@/types/models'
import { forwardRef } from 'react'

interface ResumePreviewProps {
  resume: Resume
  style?: ResumeStyle
  font?: ResumeFont
}

export const ResumePreview = forwardRef<HTMLElement, ResumePreviewProps>(
  function ResumePreview({ resume, style = 'tradicional', font = 'calibri' }, ref) {
    const content = polishResumeForAts(hydrateResume(resume))

    return (
      <article
        ref={ref}
        data-resume-sheet
        className={cn('resume-sheet mx-auto bg-white text-black', `resume-font-${font}`)}
      >
        <AtsDocument resume={content} style={style} />
      </article>
    )
  },
)
