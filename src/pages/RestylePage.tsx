import { ResumeLookPicker } from '@/components/resume/ResumeLookPicker'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { getVersionById, saveVersion } from '@/lib/storage'
import { fontLabel, styleLabel } from '@/lib/resumeLook'
import type { ResumeFont, ResumeStyle } from '@/types/models'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

export function RestylePage() {
  const { versionId } = useParams()
  const stored = versionId ? getVersionById(versionId) : undefined
  const [version, setVersion] = useState(stored)
  const [saved, setSaved] = useState(true)

  if (!version) {
    return <Navigate to="/curriculo" replace />
  }

  function updateLook(style: ResumeStyle, font: ResumeFont) {
    setVersion((current) =>
      current
        ? {
            ...current,
            style,
            font,
            title: `Versão visual · ${styleLabel(style)} · ${fontLabel(font)}`,
            updatedAt: new Date().toISOString(),
          }
        : current,
    )
    setSaved(false)
  }

  function handleSave() {
    if (!version) return
    saveVersion(version)
    setSaved(true)
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title={version.title}
        description="Escolha o modelo, confira a prévia A4 e baixe o PDF para o seu computador. Experiências e tecnologias continuam iguais."
        actions={
          <>
            <Button onClick={handleSave}>{saved ? 'Versão salva' : 'Salvar visual'}</Button>
            <Button asChild variant="outline">
              <Link to="/curriculos">Ver currículos gerados</Link>
            </Button>
          </>
        }
      />

      <Alert>
        <AlertTitle>Gerador de currículo</AlertTitle>
        <AlertDescription>
          Escolha um modelo profissional, veja a prévia em A4 e baixe o PDF. O texto continua sendo o
          seu — não inventamos experiências nem tecnologias.
        </AlertDescription>
      </Alert>

      <ResumeLookPicker
        resume={version.content}
        style={version.style}
        font={version.font ?? 'calibri'}
        onStyleChange={(style) => updateLook(style, version.font ?? 'calibri')}
        onFontChange={(font) => updateLook(version.style, font)}
        actionLabel={saved ? 'Visual salvo' : 'Salvar este visual'}
        onCreate={handleSave}
      />
    </section>
  )
}
