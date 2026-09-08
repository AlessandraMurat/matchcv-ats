import { downloadResumeDataPdf } from '@/lib/downloadResumeDataPdf'
import { Button } from '@/components/ui/button'
import type { Resume, ResumeFont, ResumeStyle } from '@/types/models'
import { useState } from 'react'

interface ExportPdfButtonProps {
  resume: Resume
  style: ResumeStyle
  font?: ResumeFont
  variant?: 'default' | 'outline'
}

export function ExportPdfButton({
  resume,
  style,
  font = 'calibri',
  variant = 'outline',
}: ExportPdfButtonProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleExport() {
    setBusy(true)
    setError('')
    try {
      await downloadResumeDataPdf(resume, style, font)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível baixar o PDF.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <Button variant={variant} onClick={() => void handleExport()} disabled={busy}>
        {busy ? 'Preparando PDF…' : 'Baixar PDF'}
      </Button>
      {error ? <span className="max-w-56 text-right text-xs text-destructive">{error}</span> : null}
    </span>
  )
}
