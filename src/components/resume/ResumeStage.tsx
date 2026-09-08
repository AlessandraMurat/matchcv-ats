import { ResumePreview } from '@/components/resume/ResumePreview'
import { RESUME_PAGE_HEIGHT, RESUME_PAGE_WIDTH } from '@/lib/resumeLook'
import type { Resume, ResumeFont, ResumeStyle } from '@/types/models'
import { useEffect, useRef, useState, type Ref } from 'react'

interface ResumeStageProps {
  resume: Resume
  style: ResumeStyle
  font: ResumeFont
  sheetRef?: Ref<HTMLElement>
}

export function ResumeStage({ resume, style, font, sheetRef }: ResumeStageProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const node = viewportRef.current
    if (!node) return

    function update() {
      if (!node) return
      const available = Math.max(280, node.clientWidth - 24)
      setScale(Math.min(1, available / RESUME_PAGE_WIDTH))
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={viewportRef}
      className="overflow-auto rounded-xl border border-white/20 bg-neutral-300 p-3"
    >
      <div
        className="mx-auto bg-white shadow-md"
        style={{
          width: RESUME_PAGE_WIDTH * scale,
          minHeight: RESUME_PAGE_HEIGHT * scale,
        }}
      >
        <div
          style={{
            width: RESUME_PAGE_WIDTH,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <ResumePreview ref={sheetRef} resume={resume} style={style} font={font} />
        </div>
      </div>
    </div>
  )
}
