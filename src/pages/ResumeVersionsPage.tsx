import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { downloadResumeDataPdf } from '@/lib/downloadResumeDataPdf'
import { formatDate } from '@/lib/text'
import { deleteVersion, getJobById, getVersions } from '@/lib/storage'
import { fontLabel, isRestyleVersion, styleLabel } from '@/lib/resumeLook'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function ResumeVersionsPage() {
  const [versions, setVersions] = useState(() => getVersions())
  const [exportingId, setExportingId] = useState<string | null>(null)

  function handleDelete(id: string) {
    deleteVersion(id)
    setVersions(getVersions())
  }

  async function handleExport(version: (typeof versions)[number]) {
    setExportingId(version.id)
    try {
      await downloadResumeDataPdf(version.content, version.style, version.font ?? 'calibri')
    } finally {
      setExportingId(null)
    }
  }

  return (
    <section>
      <PageHeader
        title="Currículos gerados"
        description="Versões por vaga e versões visuais (fonte e estilo), salvas neste navegador."
      />
      {versions.length === 0 ? (
        <EmptyState
          title="Nenhum currículo gerado"
          description="Analise uma vaga e crie uma versão ATS do seu currículo para ela."
          actionLabel="Analisar vaga"
          actionTo="/"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {versions.map((version) => {
            const job = getJobById(version.jobId)
            const restyle = isRestyleVersion(version)
            return (
              <Card key={version.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {restyle ? version.title : (job?.title ?? version.title)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {restyle
                      ? `${styleLabel(version.style)} · ${fontLabel(version.font ?? 'calibri')}`
                      : job?.company}
                  </p>
                  {restyle ? (
                    <p className="text-sm text-muted-foreground">
                      Mesmas informações do currículo base · {formatDate(version.createdAt)}
                    </p>
                  ) : (
                    <div className="flex gap-4 text-sm">
                      <span>
                        Match{' '}
                        <strong className="rounded bg-primary px-1.5 text-primary-foreground">
                          {version.matchScore}%
                        </strong>
                      </span>
                      <span>ATS {version.atsScore}</span>
                      <span className="text-muted-foreground">
                        {formatDate(version.createdAt)}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm">
                      <Link
                        to={
                          restyle
                            ? `/curriculo/versao/${version.id}`
                            : `/analise/${version.matchId}/otimizar`
                        }
                      >
                        Editar
                      </Link>
                    </Button>
                    {restyle ? (
                      <Button asChild size="sm" variant="outline">
                        <Link to="/curriculo">Ver currículo base</Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/analise/${version.matchId}`}>Ver análise</Link>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={exportingId === version.id}
                      onClick={() => void handleExport(version)}
                    >
                      {exportingId === version.id ? 'Baixando…' : 'Baixar PDF'}
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                          Excluir
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Excluir esta versão?</DialogTitle>
                          <DialogDescription>
                            A versão otimizada será removida deste navegador. O currículo base permanece.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 flex justify-end gap-2">
                          <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button
                              variant="destructive"
                              onClick={() => handleDelete(version.id)}
                            >
                              Excluir
                            </Button>
                          </DialogClose>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </section>
  )
}
