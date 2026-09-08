import { ResumeUploader } from '@/components/resume/ResumeUploader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SAMPLE_JOB_TEXT } from '@/data/mock'
import { formatDate } from '@/lib/text'
import { getJobById, getMatches, getResume, saveJob, saveMatch } from '@/lib/storage'
import { calculateMatch } from '@/services/calculateMatch'
import { persistOptimizedVersion } from '@/services/generateResumeVersion'
import { parseJobInput } from '@/services/parseJob'
import type { Resume } from '@/types/models'
import { ArrowRight, Check, FileText, Link2, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function HomePage() {
  const navigate = useNavigate()
  const [resume, setResume] = useState<Resume>(() => getResume())
  const recent = getMatches().slice(0, 3)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const hasResume = Boolean(
    resume.personal.fullName || resume.skills.length || resume.rawText,
  )

  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return
    document.querySelector(hash)?.scrollIntoView()
  }, [])

  function fillSample() {
    setTitle('Desenvolvedor Frontend React')
    setCompany('Aurora Fintech')
    setUrl('https://exemplo.com/vagas/frontend-react')
    setDescription(SAMPLE_JOB_TEXT)
    setError('')
    document.getElementById('analisar')?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleAnalyze() {
    if (!description.trim()) {
      setError('Cole o texto da vaga para continuar. O link sozinho ainda não é lido automaticamente.')
      return
    }
    if (!hasResume) {
      setError('Envie o arquivo do seu currículo para analisar a vaga.')
      return
    }

    const job = parseJobInput({ url, title, company, description })
    const match = calculateMatch(resume, job)
    saveJob(job)
    saveMatch(match)
    persistOptimizedVersion(match, resume)
    navigate(`/analise/${match.id}`)
  }

  return (
    <div>
      <section className="relative overflow-hidden border-b">
        <div className="pointer-events-none absolute -top-32 -right-16 h-96 w-96 rounded-full bg-primary/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-[oklch(0.42_0.3_284_/_0.45)] blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 right-1/4 h-40 w-40 rounded-full bg-[oklch(0.7_0.3_300_/_0.35)] blur-2xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <p className="mb-5 inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Modo demonstração · sem cadastro
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
            Cole a vaga. Envie seu currículo. Melhore para o ATS.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            MatchCV compara o seu currículo com a oportunidade, mostra o Match Score e gera uma versão
            mais compatível com sistemas ATS — sem inventar experiências nem mudar suas tecnologias.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <a href="#analisar">
                Analisar uma vaga
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/curriculo">Corrigir currículo</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-20 border-b bg-black/20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-3 md:px-6">
          {[
            {
              icon: Link2,
              title: '1. Cole a vaga',
              text: 'Link e descrição da oportunidade. Nós extraímos requisitos e skills.',
            },
            {
              icon: FileText,
              title: '2. Envie o currículo',
              text: 'Suba o PDF ou DOCX. Depois do match você corrige o que a leitura não pegou.',
            },
            {
              icon: Sparkles,
              title: '3. Otimize para ATS',
              text: 'Depois do match, reorganizamos o que você já tem. Sem adicionar tecnologias novas.',
            },
          ].map((step) => (
            <div key={step.title}>
              <span className="mb-4 flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <step.icon className="size-4" />
              </span>
              <h2 className="text-lg font-semibold">{step.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="analisar" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight">Faça a análise agora</h2>
            <p className="mt-2 text-muted-foreground">
              Não precisa explorar um mural de vagas. Traga a oportunidade e compare com o seu currículo.
            </p>
          </div>

          {error ? (
            <Alert className="mb-6 border-destructive/30">
              <AlertTitle>Não foi possível analisar</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="overflow-hidden rounded-2xl border-2 border-border bg-card shadow-sm">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4 p-6 md:p-8">
                <p className="text-sm font-medium">Vaga</p>
                <div className="space-y-2">
                  <Label htmlFor="job-url">Link da vaga</Label>
                  <Input
                    id="job-url"
                    value={url}
                    placeholder="https://linkedin.com/jobs/..."
                    onChange={(event) => setUrl(event.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="job-title">Cargo</Label>
                    <Input
                      id="job-title"
                      value={title}
                      placeholder="Frontend Developer"
                      onChange={(event) => setTitle(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job-company">Empresa</Label>
                    <Input
                      id="job-company"
                      value={company}
                      placeholder="Nome da empresa"
                      onChange={(event) => setCompany(event.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job-description">Cole a descrição da vaga</Label>
                  <Textarea
                    id="job-description"
                    className="min-h-40"
                    value={description}
                    placeholder="Requisitos, skills, responsabilidades..."
                    onChange={(event) => setDescription(event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    A leitura automática do link ainda não está disponível. Cole o texto para analisar.
                  </p>
                </div>
                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <Button size="lg" onClick={handleAnalyze}>
                    Analisar match
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button size="lg" variant="outline" type="button" onClick={fillSample}>
                    Usar vaga de exemplo
                  </Button>
                </div>
              </div>

              <div className="border-t bg-muted p-6 md:p-8 lg:border-t-0 lg:border-l">
                <p className="text-sm font-semibold">Seu currículo</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Envie o arquivo. Não é obrigatório preencher o formulário.
                </p>
                <div className="mt-4">
                  <ResumeUploader onImported={setResume} />
                </div>
                {hasResume ? (
                  <div className="mt-4">
                    <p className="text-lg font-semibold">
                      {resume.personal.fullName || resume.sourceFileName || 'Currículo importado'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {resume.sourceFileName
                        ? `Arquivo: ${resume.sourceFileName}`
                        : resume.personal.desiredRole || 'Pronto para o match'}
                    </p>
                    <ul className="mt-4 space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="size-4 text-primary" />
                        {resume.skills.length} skills lidas
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="size-4 text-primary" />
                        {resume.experiences.length} experiências lidas
                      </li>
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {recent.length > 0 ? (
        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
            <h2 className="mb-4 text-lg font-semibold">Análises recentes</h2>
            <div className="grid gap-3">
              {recent.map((match) => {
                const job = getJobById(match.jobId)
                return (
                  <Link
                    key={match.id}
                    to={`/analise/${match.id}`}
                    className="flex items-center justify-between rounded-xl border bg-background p-4 hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{job?.title ?? 'Vaga'}</p>
                      <p className="text-sm text-muted-foreground">
                        {job?.company} · {formatDate(match.createdAt)}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary px-2.5 py-1 text-sm font-semibold text-primary-foreground">
                      {match.score}%
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
