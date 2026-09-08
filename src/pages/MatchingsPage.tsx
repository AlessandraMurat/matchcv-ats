import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/text'
import { getJobById, getMatches } from '@/lib/storage'
import { Link } from 'react-router-dom'

export function MatchingsPage() {
  const matches = getMatches()

  return (
    <section>
      <PageHeader
        title="Análises"
        description="Histórico das vagas que você comparou com o seu currículo."
      />
      {matches.length === 0 ? (
        <EmptyState
          title="Nenhuma análise ainda"
          description="Cole uma vaga na tela inicial para calcular o Match Score e o ATS Score."
          actionLabel="Analisar vaga"
          actionTo="/"
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium">Vaga</th>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Match</th>
                <th className="px-4 py-3 font-medium">ATS</th>
                <th className="px-4 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => {
                const job = getJobById(match.jobId)
                return (
                  <tr key={match.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <Link className="font-medium underline-offset-4 hover:underline" to={`/analise/${match.id}`}>
                        {job?.title ?? 'Vaga'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{job?.company}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                        {match.score}%
                      </span>
                    </td>
                    <td className="px-4 py-3">{match.atsScore}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(match.createdAt)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
