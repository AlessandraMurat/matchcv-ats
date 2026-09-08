import { ResumeStage } from '@/components/resume/ResumeStage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { downloadResumeDataPdf } from '@/lib/downloadResumeDataPdf'
import {
  lookSelectClass,
  RESUME_FONTS,
  RESUME_STYLES,
} from '@/lib/resumeLook'
import { cn } from '@/lib/utils'
import type { Resume, ResumeFont, ResumeStyle } from '@/types/models'
import { useState } from 'react'

interface ResumeLookPickerProps {
  resume: Resume
  style: ResumeStyle
  font: ResumeFont
  onStyleChange: (style: ResumeStyle) => void
  onFontChange: (font: ResumeFont) => void
  actionLabel: string
  onCreate: () => void
  disabled?: boolean
}

export function ResumeLookPicker({
  resume,
  style,
  font,
  onStyleChange,
  onFontChange,
  actionLabel,
  onCreate,
  disabled,
}: ResumeLookPickerProps) {
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')

  async function handleExport() {
    setExporting(true)
    setExportError('')
    try {
      await downloadResumeDataPdf(resume, style, font)
    } catch (cause) {
      setExportError(cause instanceof Error ? cause.message : 'Não foi possível baixar o PDF.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-semibold">Modelo</p>
          <div className="grid grid-cols-2 gap-2">
            {RESUME_STYLES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => onStyleChange(item.value)}
                className={cn(
                  'rounded-lg border-2 p-2 text-left transition-colors',
                  style === item.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-muted/60',
                )}
              >
                <TemplateThumb style={item.value} />
                <p className="mt-2 text-xs font-semibold">{item.label}</p>
                <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{item.description}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="resume-font">Fonte</Label>
          <select
            id="resume-font"
            className={lookSelectClass}
            value={font}
            onChange={(event) => onFontChange(event.target.value as ResumeFont)}
          >
            {RESUME_FONTS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <Button className="w-full" onClick={onCreate} disabled={disabled}>
          {actionLabel}
        </Button>
        <Button className="w-full" variant="outline" onClick={() => void handleExport()} disabled={disabled || exporting}>
          {exporting ? 'Preparando PDF…' : 'Baixar PDF para o computador'}
        </Button>
        {exportError ? <p className="text-sm text-destructive">{exportError}</p> : null}
      </div>
      <ResumeStage resume={resume} style={style} font={font} />
    </div>
  )
}

function TemplateThumb({ style }: { style: ResumeStyle }) {
  if (style === 'tradicional') {
    return (
      <div className="h-16 rounded bg-white p-1.5 text-black">
        <div className="mx-auto h-1.5 w-10 rounded bg-neutral-800" />
        <div className="mx-auto mt-1 h-px w-6 bg-neutral-400" />
        <div className="mt-2 space-y-1">
          <div className="h-1 w-full bg-neutral-300" />
          <div className="h-1 w-4/5 bg-neutral-200" />
          <div className="h-1 w-full bg-neutral-200" />
        </div>
      </div>
    )
  }
  if (style === 'moderno') {
    return (
      <div className="flex h-16 overflow-hidden rounded bg-white">
        <div className="w-1.5 bg-indigo-700" />
        <div className="flex-1 p-1.5">
          <div className="h-1.5 w-8 rounded bg-neutral-800" />
          <div className="mt-1 h-1 w-6 bg-indigo-400" />
          <div className="mt-2 h-1 w-full bg-neutral-200" />
        </div>
      </div>
    )
  }
  if (style === 'executivo') {
    return (
      <div className="h-16 overflow-hidden rounded bg-white">
        <div className="h-6 bg-[#1a1a2e]" />
        <div className="space-y-1 p-1.5">
          <div className="h-1 w-8 bg-amber-700" />
          <div className="h-1 w-full bg-neutral-200" />
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-16 overflow-hidden rounded bg-white">
      <div className="w-1 bg-[#1e1b4b]" />
      <div className="flex-1 space-y-1 p-1.5">
        <div className="h-2 w-12 bg-neutral-800" />
        <div className="h-px w-10 bg-neutral-400" />
        <div className="h-1 w-full bg-neutral-200" />
        <div className="h-1 w-4/5 bg-neutral-200" />
      </div>
    </div>
  )
}

export function ResumeLookCard(props: ResumeLookPickerProps & { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{props.title}</CardTitle>
        <CardDescription>{props.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResumeLookPicker {...props} />
      </CardContent>
    </Card>
  )
}
