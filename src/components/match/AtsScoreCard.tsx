import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { AtsBreakdown } from '@/types/models'

interface AtsScoreCardProps {
  score: number
  breakdown: AtsBreakdown
  explanation: string
}

const ITEMS: { key: keyof AtsBreakdown; label: string }[] = [
  { key: 'structure', label: 'Estrutura' },
  { key: 'keywords', label: 'Palavras-chave' },
  { key: 'experience', label: 'Experiência' },
  { key: 'skills', label: 'Skills' },
  { key: 'readability', label: 'Legibilidade' },
]

export function AtsScoreCard({ score, breakdown, explanation }: AtsScoreCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ATS Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-4xl font-semibold tracking-tight">
          <span className="rounded-md bg-primary px-2 py-0.5 text-primary-foreground">
            {score}
          </span>
          <span className="ml-1 text-lg text-muted-foreground">/100</span>
        </p>
        <div className="space-y-3">
          {ITEMS.map((item) => (
            <div key={item.key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{item.label}</span>
                <span className="text-muted-foreground">{breakdown[item.key]}%</span>
              </div>
              <Progress value={breakdown[item.key]} />
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{explanation}</p>
      </CardContent>
    </Card>
  )
}
