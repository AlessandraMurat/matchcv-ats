import { PageHeader } from '@/components/layout/PageHeader'
import { ResumeLookCard } from '@/components/resume/ResumeLookPicker'
import { ResumeUploader } from '@/components/resume/ResumeUploader'
import { SkillInput } from '@/components/resume/SkillInput'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createId } from '@/lib/text'
import { getResume, saveResume, saveVersion } from '@/lib/storage'
import { recalculateMatch } from '@/services/recalculateMatch'
import { createRestyleVersion } from '@/services/restyleResume'
import { hydrateResume } from '@/services/parseResumeText'
import type { Certification, Education, Experience, Language, Resume, ResumeFont, ResumeStyle } from '@/types/models'
import { Plus, Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

function emptyExperience(): Experience {
  return {
    id: createId('exp'),
    company: '',
    role: '',
    startDate: '',
    endDate: '',
    current: false,
    location: '',
    description: '',
    highlights: [],
    skills: [],
  }
}

function emptyEducation(): Education {
  return {
    id: createId('edu'),
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
  }
}

function emptyLanguage(): Language {
  return { id: createId('lang'), name: '', level: '' }
}

function emptyCertification(): Certification {
  return { id: createId('cert'), name: '', issuer: '', date: '' }
}

export function ResumePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const matchId = searchParams.get('matchId')
  const [resume, setResume] = useState<Resume>(() => hydrateResume(getResume()))
  const [saved, setSaved] = useState(false)
  const [lookStyle, setLookStyle] = useState<ResumeStyle>('tradicional')
  const [lookFont, setLookFont] = useState<ResumeFont>('calibri')

  function update(next: Resume) {
    setResume(next)
    setSaved(false)
  }

  function handleSave() {
    saveResume(resume)
    setSaved(true)
    if (matchId) {
      const updated = recalculateMatch(matchId)
      if (updated) navigate(`/analise/${updated.id}`)
    }
  }

  function handleCreateVisualVersion() {
    saveResume(resume)
    const version = createRestyleVersion(resume, { style: lookStyle, font: lookFont })
    saveVersion(version)
    navigate(`/curriculo/versao/${version.id}`)
  }

  const canRestyle = Boolean(
    resume.personal.fullName || resume.summary || resume.experiences.length || resume.skills.length,
  )

  return (
    <section className="space-y-6">
      <PageHeader
        title="Corrigir currículo"
        description={
          matchId
            ? 'Ajuste o que a leitura do arquivo errou. Ao salvar, o match é recalculado e a versão ATS é refeita sem alterar suas tecnologias.'
            : 'Envie um arquivo ou ajuste os dados extraídos. O MatchCV não inventa experiências nem tecnologias.'
        }
        actions={
          <>
            <Button onClick={handleSave}>
              {matchId ? 'Salvar e recalcular match' : saved ? 'Currículo salvo' : 'Salvar currículo'}
            </Button>
            <Button asChild variant="outline">
              <Link to={matchId ? `/analise/${matchId}` : '/'}>
                {matchId ? 'Voltar ao match' : 'Analisar uma vaga'}
              </Link>
            </Button>
          </>
        }
      />

      <Alert>
        <AlertTitle>Prefira enviar o arquivo</AlertTitle>
        <AlertDescription>
          PDF, DOCX ou TXT. Depois você corrige só o que estiver errado — principalmente após ver o match.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Arquivo do currículo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResumeUploader onImported={update} />
        </CardContent>
      </Card>

      <ResumeLookCard
        title="Gerar currículo profissional"
        description="Escolha um modelo de verdade (tradicional, moderno, executivo ou tech), a fonte, e baixe o PDF para o seu computador. O conteúdo continua sendo o seu — só o layout muda."
        resume={resume}
        style={lookStyle}
        font={lookFont}
        onStyleChange={setLookStyle}
        onFontChange={setLookFont}
        actionLabel="Criar currículo com este visual"
        onCreate={handleCreateVisualVersion}
        disabled={!canRestyle}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações pessoais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome completo" id="fullName">
            <Input
              id="fullName"
              value={resume.personal.fullName}
              onChange={(event) =>
                update({
                  ...resume,
                  personal: { ...resume.personal, fullName: event.target.value },
                })
              }
            />
          </Field>
          <Field label="Cargo desejado" id="desiredRole">
            <Input
              id="desiredRole"
              value={resume.personal.desiredRole ?? ''}
              onChange={(event) =>
                update({
                  ...resume,
                  personal: { ...resume.personal, desiredRole: event.target.value },
                })
              }
            />
          </Field>
          <Field label="Email" id="email">
            <Input
              id="email"
              type="email"
              value={resume.personal.email}
              onChange={(event) =>
                update({
                  ...resume,
                  personal: { ...resume.personal, email: event.target.value },
                })
              }
            />
          </Field>
          <Field label="Telefone" id="phone">
            <Input
              id="phone"
              value={resume.personal.phone}
              onChange={(event) =>
                update({
                  ...resume,
                  personal: { ...resume.personal, phone: event.target.value },
                })
              }
            />
          </Field>
          <Field label="Cidade" id="location">
            <Input
              id="location"
              value={resume.personal.location}
              onChange={(event) =>
                update({
                  ...resume,
                  personal: { ...resume.personal, location: event.target.value },
                })
              }
            />
          </Field>
          <Field label="LinkedIn" id="linkedin">
            <Input
              id="linkedin"
              value={resume.personal.linkedin ?? ''}
              onChange={(event) =>
                update({
                  ...resume,
                  personal: { ...resume.personal, linkedin: event.target.value },
                })
              }
            />
          </Field>
          <Field label="GitHub" id="github">
            <Input
              id="github"
              value={resume.personal.github ?? ''}
              onChange={(event) =>
                update({
                  ...resume,
                  personal: { ...resume.personal, github: event.target.value },
                })
              }
            />
          </Field>
          <Field label="Portfólio" id="website">
            <Input
              id="website"
              value={resume.personal.website ?? ''}
              onChange={(event) =>
                update({
                  ...resume,
                  personal: { ...resume.personal, website: event.target.value },
                })
              }
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo profissional</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            className="min-h-32"
            maxLength={800}
            value={resume.summary}
            onChange={(event) => update({ ...resume, summary: event.target.value })}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {resume.summary.length}/800 caracteres
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Experiência profissional</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              update({ ...resume, experiences: [...resume.experiences, emptyExperience()] })
            }
          >
            <Plus className="size-4" />
            Adicionar experiência
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {resume.experiences.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma experiência cadastrada. Adicione pelo menos uma para melhorar o match.
            </p>
          ) : (
            resume.experiences.map((experience, index) => (
              <div key={experience.id} className="space-y-3 rounded-lg border p-4">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remover experiência"
                    onClick={() =>
                      update({
                        ...resume,
                        experiences: resume.experiences.filter((item) => item.id !== experience.id),
                      })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Empresa" id={`company-${index}`}>
                    <Input
                      id={`company-${index}`}
                      value={experience.company}
                      onChange={(event) =>
                        updateExperience(resume, update, index, { company: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Cargo" id={`role-${index}`}>
                    <Input
                      id={`role-${index}`}
                      value={experience.role}
                      onChange={(event) =>
                        updateExperience(resume, update, index, { role: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Localização" id={`exploc-${index}`}>
                    <Input
                      id={`exploc-${index}`}
                      value={experience.location ?? ''}
                      onChange={(event) =>
                        updateExperience(resume, update, index, { location: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Data inicial" id={`start-${index}`}>
                    <Input
                      id={`start-${index}`}
                      type="month"
                      value={experience.startDate}
                      onChange={(event) =>
                        updateExperience(resume, update, index, { startDate: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Data final" id={`end-${index}`}>
                    <Input
                      id={`end-${index}`}
                      type="month"
                      disabled={experience.current}
                      value={experience.endDate ?? ''}
                      onChange={(event) =>
                        updateExperience(resume, update, index, { endDate: event.target.value })
                      }
                    />
                  </Field>
                  <label className="flex items-center gap-2 self-end text-sm">
                    <input
                      type="checkbox"
                      checked={experience.current}
                      onChange={(event) =>
                        updateExperience(resume, update, index, {
                          current: event.target.checked,
                          endDate: event.target.checked ? null : experience.endDate,
                        })
                      }
                    />
                    Emprego atual
                  </label>
                </div>
                <Field label="Descrição" id={`desc-${index}`}>
                  <Textarea
                    id={`desc-${index}`}
                    value={experience.description}
                    onChange={(event) =>
                      updateExperience(resume, update, index, { description: event.target.value })
                    }
                  />
                </Field>
                <Field label="Responsabilidades e resultados (um por linha)" id={`high-${index}`}>
                  <Textarea
                    id={`high-${index}`}
                    value={experience.highlights.join('\n')}
                    onChange={(event) =>
                      updateExperience(resume, update, index, {
                        highlights: event.target.value.split('\n'),
                      })
                    }
                  />
                </Field>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Formação</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              update({ ...resume, education: [...resume.education, emptyEducation()] })
            }
          >
            <Plus className="size-4" />
            Adicionar formação
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {resume.education.map((item, index) => (
            <div key={item.id} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
              <Field label="Instituição" id={`inst-${index}`}>
                <Input
                  id={`inst-${index}`}
                  value={item.institution}
                  onChange={(event) =>
                    updateEducation(resume, update, index, { institution: event.target.value })
                  }
                />
              </Field>
              <Field label="Curso" id={`field-${index}`}>
                <Input
                  id={`field-${index}`}
                  value={item.field}
                  onChange={(event) =>
                    updateEducation(resume, update, index, { field: event.target.value })
                  }
                />
              </Field>
              <Field label="Grau" id={`degree-${index}`}>
                <Input
                  id={`degree-${index}`}
                  value={item.degree}
                  onChange={(event) =>
                    updateEducation(resume, update, index, { degree: event.target.value })
                  }
                />
              </Field>
              <div className="flex items-end justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remover formação"
                  onClick={() =>
                    update({
                      ...resume,
                      education: resume.education.filter((edu) => edu.id !== item.id),
                    })
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <SkillInput
            skills={resume.skills.map((skill) => skill.name)}
            onChange={(names) =>
              update({
                ...resume,
                skills: names.map((name, index) => ({
                  id: resume.skills[index]?.id ?? createId('sk'),
                  name,
                })),
              })
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Idiomas</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              update({ ...resume, languages: [...resume.languages, emptyLanguage()] })
            }
          >
            <Plus className="size-4" />
            Adicionar idioma
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {resume.languages.map((item, index) => (
            <div key={item.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <Input
                aria-label="Idioma"
                value={item.name}
                onChange={(event) =>
                  updateLanguage(resume, update, index, { name: event.target.value })
                }
              />
              <Input
                aria-label="Nível"
                value={item.level}
                onChange={(event) =>
                  updateLanguage(resume, update, index, { level: event.target.value })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remover idioma"
                onClick={() =>
                  update({
                    ...resume,
                    languages: resume.languages.filter((language) => language.id !== item.id),
                  })
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Certificações</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              update({
                ...resume,
                certifications: [...resume.certifications, emptyCertification()],
              })
            }
          >
            <Plus className="size-4" />
            Adicionar certificação
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {resume.certifications.map((item, index) => (
            <div key={item.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_8rem_auto]">
              <Input
                aria-label="Certificação"
                value={item.name}
                onChange={(event) =>
                  updateCertification(resume, update, index, { name: event.target.value })
                }
              />
              <Input
                aria-label="Instituição"
                value={item.issuer}
                onChange={(event) =>
                  updateCertification(resume, update, index, { issuer: event.target.value })
                }
              />
              <Input
                aria-label="Ano"
                value={item.date}
                onChange={(event) =>
                  updateCertification(resume, update, index, { date: event.target.value })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remover certificação"
                onClick={() =>
                  update({
                    ...resume,
                    certifications: resume.certifications.filter((cert) => cert.id !== item.id),
                  })
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}

function Field({
  label,
  id,
  children,
}: {
  label: string
  id: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}

function updateExperience(
  resume: Resume,
  update: (resume: Resume) => void,
  index: number,
  patch: Partial<Experience>,
) {
  update({
    ...resume,
    experiences: resume.experiences.map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...patch } : item,
    ),
  })
}

function updateEducation(
  resume: Resume,
  update: (resume: Resume) => void,
  index: number,
  patch: Partial<Education>,
) {
  update({
    ...resume,
    education: resume.education.map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...patch } : item,
    ),
  })
}

function updateLanguage(
  resume: Resume,
  update: (resume: Resume) => void,
  index: number,
  patch: Partial<Language>,
) {
  update({
    ...resume,
    languages: resume.languages.map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...patch } : item,
    ),
  })
}

function updateCertification(
  resume: Resume,
  update: (resume: Resume) => void,
  index: number,
  patch: Partial<Certification>,
) {
  update({
    ...resume,
    certifications: resume.certifications.map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...patch } : item,
    ),
  })
}
