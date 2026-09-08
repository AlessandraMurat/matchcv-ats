import { ExportPdfButton } from '@/components/resume/ExportPdfButton'
import { ResumeStage } from '@/components/resume/ResumeStage'
import { SkillInput } from '@/components/resume/SkillInput'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  getJobById,
  getMatchById,
  getResume,
  getVersionByMatchId,
  saveVersion,
} from '@/lib/storage'
import { calculateMatch } from '@/services/calculateMatch'
import { generateResumeVersion } from '@/services/generateResumeVersion'
import {
  lookSelectClass,
  RESUME_FONTS,
  RESUME_STYLES,
} from '@/lib/resumeLook'
import type { AtsLevel, Resume, ResumeFont, ResumeStyle, ResumeVersion } from '@/types/models'
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

export function GeneratorPage() {
  const { matchId } = useParams()
  const match = matchId ? getMatchById(matchId) : undefined
  const job = match ? getJobById(match.jobId) : undefined
  const existing = match ? getVersionByMatchId(match.id) : undefined
  const [language, setLanguage] = useState<'pt' | 'en'>(existing?.language ?? 'pt')
  const [style, setStyle] = useState<ResumeStyle>(existing?.style ?? 'moderno')
  const [font, setFont] = useState<ResumeFont>(existing?.font ?? 'calibri')
  const [atsLevel, setAtsLevel] = useState<AtsLevel>(existing?.atsLevel ?? 'equilibrado')
  const [version, setVersion] = useState<ResumeVersion | null>(existing ?? null)
  const [saved, setSaved] = useState(Boolean(existing))
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')

  useEffect(() => {
    if (!match || !job || version) return
    setVersion(
      generateResumeVersion(getResume(), job, match, {
        language,
        style,
        font,
        atsLevel,
      }),
    )
  }, [match, job, version, language, style, font, atsLevel])

  if (!match || !job) {
    return <Navigate to="/" replace />
  }

  function regenerate() {
    if (!match || !job) return
    const next = generateResumeVersion(getResume(), job, match, {
      language,
      style,
      font,
      atsLevel,
    })
    if (existing) next.id = existing.id
    setVersion(next)
    setSaved(false)
  }

  function updateContent(content: Resume) {
    if (!version || !job) return
    const preview = calculateMatch(content, job)
    setVersion({
      ...version,
      content,
      matchScore: preview.score,
      atsScore: preview.atsScore,
      language,
      style,
      font,
      atsLevel,
      updatedAt: new Date().toISOString(),
    })
    setSaved(false)
  }

  function handleSave() {
    if (!version) return
    saveVersion({ ...version, language, style, font, atsLevel })
    setSaved(true)
  }

  if (!version) return null

  const editor = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="summary">Resumo</Label>
        <Textarea
          id="summary"
          className="min-h-32"
          value={version.content.summary}
          onChange={(event) =>
            updateContent({ ...version.content, summary: event.target.value })
          }
        />
      </div>
      {version.content.experiences.map((experience, index) => (
        <div key={experience.id} className="space-y-2 rounded-lg border p-3">
          <p className="text-sm font-medium">
            {experience.role} · {experience.company}
          </p>
          <Textarea
            value={experience.highlights.join('\n')}
            onChange={(event) => {
              const experiences = version.content.experiences.map((item, itemIndex) =>
                itemIndex === index
                  ? {
                      ...item,
                      highlights: event.target.value
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean),
                    }
                  : item,
              )
              updateContent({ ...version.content, experiences })
            }}
          />
        </div>
      ))}
      <div className="space-y-2">
        <Label>Skills</Label>
        <SkillInput
          skills={version.content.skills.map((skill) => skill.name)}
          onChange={(names) =>
            updateContent({
              ...version.content,
              skills: names.map((name, index) => ({
                id: version.content.skills[index]?.id ?? `sk-${index}`,
                name,
              })),
            })
          }
        />
      </div>
    </div>
  )

  return (
    <section>
      <PageHeader
        title="Personalize seu currículo"
        description="Reorganizamos e destacamos só o que já existe no seu currículo. Suas tecnologias não mudam."
        actions={
          <>
            <Button onClick={handleSave}>{saved ? 'Versão salva' : 'Salvar versão'}</Button>
            <ExportPdfButton resume={version.content} style={style} font={font} />
          </>
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vaga selecionada</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="font-medium">{job.title}</p>
            <p className="text-muted-foreground">{job.company}</p>
            <p className="mt-2">Match original: {match.score}%</p>
            <p className="text-muted-foreground">Versão ATS: {version.matchScore}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Antes / depois</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Antes</p>
              <p>Match {version.previousMatchScore}%</p>
              <p>ATS {version.previousAtsScore}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Depois</p>
              <p className="font-medium">
                Match{' '}
                <span className="rounded bg-primary px-1.5 text-primary-foreground">
                  {version.matchScore}%
                </span>
              </p>
              <p>ATS {version.atsScore}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configuração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="language">Idioma</Label>
              <select
                id="language"
                className={lookSelectClass}
                value={language}
                onChange={(event) => setLanguage(event.target.value as 'pt' | 'en')}
              >
                <option value="pt">Português</option>
                <option value="en">Inglês</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="style">Estilo</Label>
              <select
                id="style"
                className={lookSelectClass}
                value={style}
                onChange={(event) => setStyle(event.target.value as ResumeStyle)}
              >
                {RESUME_STYLES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="font">Fonte</Label>
              <select
                id="font"
                className={lookSelectClass}
                value={font}
                onChange={(event) => setFont(event.target.value as ResumeFont)}
              >
                {RESUME_FONTS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="ats">Nível ATS</Label>
              <select
                id="ats"
                className={lookSelectClass}
                value={atsLevel}
                onChange={(event) => setAtsLevel(event.target.value as AtsLevel)}
              >
                <option value="equilibrado">Equilibrado</option>
                <option value="maximo">Máximo ATS</option>
              </select>
            </div>
            <Button variant="outline" className="w-full" onClick={regenerate}>
              Gerar novamente
            </Button>
          </CardContent>
        </Card>
      </div>

      <Alert className="mb-6">
        <AlertTitle>Suas tecnologias permanecem as mesmas</AlertTitle>
        <AlertDescription>
          Reorganizamos e destacamos só o que já existe no currículo. Não incluímos stacks, ferramentas
          ou conhecimentos que você não informou.
        </AlertDescription>
      </Alert>

      {language === 'en' ? (
        <Alert className="mb-6">
          <AlertTitle>Tradução automática em breve</AlertTitle>
          <AlertDescription>
            O conteúdo continua em português para não inventar uma versão em inglês do seu histórico.
          </AlertDescription>
        </Alert>
      ) : null}

      <p className="mb-4 text-sm text-muted-foreground">
        Seu currículo foi reorganizado para esta vaga. As tecnologias listadas continuam sendo as suas.
      </p>

      <div className="mb-4 flex gap-2 lg:hidden">
        <Button
          variant={tab === 'edit' ? 'default' : 'outline'}
          onClick={() => setTab('edit')}
        >
          Editar
        </Button>
        <Button
          variant={tab === 'preview' ? 'default' : 'outline'}
          onClick={() => setTab('preview')}
        >
          Visualizar
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className={cn(tab === 'preview' && 'hidden lg:block')}>
          <CardHeader>
            <CardTitle className="text-base">Editar</CardTitle>
          </CardHeader>
          <CardContent>{editor}</CardContent>
        </Card>
        <div className={cn(tab === 'edit' && 'hidden lg:block')}>
          <ResumeStage resume={version.content} style={style} font={font} />
        </div>
      </div>

      <div className="mt-6">
        <Button asChild variant="ghost">
          <Link to={`/analise/${match.id}`}>Voltar para a análise</Link>
        </Button>
      </div>
    </section>
  )
}
