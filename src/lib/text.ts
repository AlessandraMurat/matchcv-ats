export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
}

export function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/[^a-z0-9.+#]+/u)
    .filter((token) => token.length > 2)
}

export function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

export function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatMonth(value: string | null, current = false): string {
  if (current) return 'Atual'
  if (!value) return ''
  if (value.includes('/')) return value
  const [year, month] = value.split('-')
  if (!year) return value
  if (!month) return year
  return `${month}/${year}`
}
