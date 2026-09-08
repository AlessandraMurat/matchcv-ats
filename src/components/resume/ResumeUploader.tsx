import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { saveResume } from '@/lib/storage'
import { extractResumeFromFile } from '@/services/extractResumeFile'
import type { Resume } from '@/types/models'
import { FileUp, LoaderCircle } from 'lucide-react'
import { useId, useState } from 'react'

interface ResumeUploaderProps {
  onImported: (resume: Resume) => void
}

export function ResumeUploader({ onImported }: ResumeUploaderProps) {
  const inputId = useId()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleFile(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const resume = await extractResumeFromFile(file)
      saveResume(resume)
      onImported(resume)
      setMessage(
        `Arquivo lido: ${file.name}. Depois do match você pode corrigir o que a extração não pegou direito.`,
      )
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível ler o arquivo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <label
        htmlFor={inputId}
        className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-border px-4 py-8 text-center hover:bg-muted/60"
      >
        {busy ? (
          <LoaderCircle className="size-8 animate-spin" aria-hidden />
        ) : (
          <FileUp className="size-8" aria-hidden />
        )}
        <span className="mt-3 font-semibold">
          {busy ? 'Lendo currículo…' : 'Envie o arquivo do currículo'}
        </span>
        <span className="mt-1 text-sm text-muted-foreground">
          PDF, DOCX ou TXT. Não precisa preencher o formulário.
        </span>
        <input
          id={inputId}
          type="file"
          className="sr-only"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          disabled={busy}
          onChange={(event) => {
            void handleFile(event.target.files?.[0])
            event.target.value = ''
          }}
        />
      </label>
      {error ? (
        <Alert className="border-destructive/40">
          <AlertTitle>Falha no envio</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {message ? (
        <Alert>
          <AlertTitle>Currículo importado</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}
