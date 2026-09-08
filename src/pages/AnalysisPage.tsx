import { AtsScoreCard } from '@/components/match/AtsScoreCard'
import { MatchScore } from '@/components/match/MatchScore'
import { SkillBadge } from '@/components/match/SkillBadge'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getJobById, getMatchById, getResume, getVersionByMatchId } from '@/lib/storage'
import { classifyMatchSuggestions } from '@/services/applyMatchSuggestions'
import { persistOptimizedVersion } from '@/services/generateResumeVersion'
import { recalculateMatch } from '@/services/recalculateMatch'
import type { ResumeVersion } from '@/types/models'
import { Check, Minus, RefreshCw, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

export function AnalysisPage() {
  const { matchId } = useParams()
  const storedMatch = matchId ? getMatchById(matchId) : undefined
  const [match, setMatch] = useState(storedMatch)
  const job = match ? getJobById(match.jobId) : undefined
  const resume = getResume()
  const [version, setVersion] = useState<ResumeVersion | undefined>(() =>
    match ? getVersionByMatchId(match.id) : undefined,
  )

  useEffect(() => {
    if (!match || version) return
    const created = persistOptimizedVersion(match, getResume())
    if (created) setVersion(created)
  }, [match, version])

  if (!match || !job) {
    return <Navigate to="/" replace />
  }

  function handleRecalculate() {
    if (!match) return
    const updated = recalculateMatch(match.id)
    if (!updated) return
    setMatch(updated)
    setVersion(getVersionByMatchId(updated.id))
  }

  const suggestions = classifyMatchSuggestions(resume, match)

  return (
    <section>
      <PageHeader
        title={job.title}
        description={`${job.company} · ${job.location} · ${job.workMode}${job.salary ? ` · ${job.salary}` : ''}`}
        actions={
          <>
            <Button asChild>
              <Link to={`/analise/${match.id}/otimizar`}>Ver currículo corrigido para ATS</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/curriculo?matchId=${match.id}`}>Corrigir dados extraídos</Link>
            </Button>
            <Button variant="outline" onClick={handleRecalculate}>
              <RefreshCw className="size-4" />
              Recalcular match
            </Button>
          </>
        }
      />

      <Alert className="mb-6">
        <AlertTitle>Currículo ajustado para o ATS desta vaga</AlertTitle>
        <AlertDescription>
          Reorganizamos resumo, experiências e skills que você já tem. Tecnologias e conhecimentos que
          não estão no seu currículo não foram adicionados.
        </AlertDescription>
      </Alert>

      {job.sourceUrl ? (
        <p className="mb-6 text-sm text-muted-foreground">
          Link:{' '}
          <a className="underline" href={job.sourceUrl} target="_blank" rel="noreferrer">
            {job.sourceUrl}
          </a>
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[280px_280px_1fr]">
        <Card>
          <CardContent className="py-8">
            <MatchScore score={match.score} label="Currículo original" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-8">
            <MatchScore
              score={version?.matchScore ?? match.score}
              label="Versão corrigida para ATS"
            />
          </CardContent>
        </Card>

        <AtsScoreCard
          score={version?.atsScore ?? match.atsScore}
          breakdown={match.atsBreakdown}
          explanation={
            version
              ? `ATS original: ${version.previousAtsScore}/100 · ATS após correção: ${version.atsScore}/100. Só destacamos competências que já aparecem no seu currículo.`
              : 'A versão corrigida destaca palavras-chave que você já usa, sem incluir tecnologias novas.'
          }
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por que você combina com esta vaga?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Check className="size-4" /> Você atende
              </p>
              <div className="flex flex-wrap gap-2">
                {match.matchedSkills.length > 0 ? (
                  match.matchedSkills.map((skill) => (
                    <SkillBadge key={skill} label={skill} tone="positive" />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma skill idêntica encontrada.</p>
                )}
              </div>
            </div>
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Minus className="size-4" /> Match parcial
              </p>
              <div className="flex flex-wrap gap-2">
                {match.partialSkills.length > 0 ? (
                  match.partialSkills.map((skill) => (
                    <SkillBadge key={skill} label={skill} tone="partial" />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Sem correspondências parciais.</p>
                )}
              </div>
            </div>
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                <X className="size-4" /> Pedidas na vaga, mas não estão no seu currículo
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.skippedSkills.length > 0 ? (
                  suggestions.skippedSkills.map((skill) => (
                    <SkillBadge key={skill} label={skill} tone="missing" />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma skill obrigatória foi omitida por falta de evidência no currículo.
                  </p>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Estas tecnologias não foram adicionadas. O MatchCV não altera o seu conhecimento.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">O que a correção ATS fez</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-medium">Destacado porque você já usa</p>
              <p className="mt-1 text-muted-foreground">
                {[...match.matchedSkills, ...suggestions.highlightedSkills, ...suggestions.highlightedKeywords]
                  .filter((item, index, list) => list.indexOf(item) === index)
                  .slice(0, 10)
                  .join(', ') || 'Nada extra para promover além das skills já listadas.'}
              </p>
            </div>
            <div>
              <p className="font-medium">Não incluído — não aparece no seu currículo</p>
              <p className="mt-1 text-muted-foreground">
                {[...suggestions.skippedSkills, ...suggestions.skippedKeywords]
                  .filter((item, index, list) => list.indexOf(item) === index)
                  .slice(0, 10)
                  .join(', ') || 'Nenhuma palavra-chave da vaga foi recusada.'}
              </p>
            </div>
            <Alert>
              <AlertTitle>Sem invenção de dados</AlertTitle>
              <AlertDescription>
                A versão ATS só reordena e destaca o que você já informou. Ela não cria empresas,
                cargos, tecnologias ou resultados novos.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Palavras-chave importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium">Encontradas no currículo</p>
              <div className="flex flex-wrap gap-2">
                {match.foundKeywords.map((item) => (
                  <SkillBadge key={item} label={item} tone="positive" />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Ausentes — não foram adicionadas</p>
              <div className="flex flex-wrap gap-2">
                {match.missingKeywords.map((item) => (
                  <SkillBadge key={item} label={item} tone="missing" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Antes e depois da correção</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Currículo original</p>
              <p className="mt-1 text-lg font-semibold">Match {match.score}%</p>
              <p>ATS {version?.previousAtsScore ?? match.atsScore}/100</p>
            </div>
            <div>
              <p className="text-muted-foreground">Versão para esta vaga</p>
              <p className="mt-1 text-lg font-semibold">
                Match{' '}
                <span className="rounded bg-primary px-1.5 text-primary-foreground">
                  {version?.matchScore ?? match.score}%
                </span>
              </p>
              <p>ATS {version?.atsScore ?? match.atsScore}/100</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
