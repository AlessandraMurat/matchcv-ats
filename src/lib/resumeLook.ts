import type { ResumeFont, ResumeStyle, ResumeVersion } from '@/types/models'

export const RESUME_STYLES: { value: ResumeStyle; label: string; description: string }[] = [
  {
    value: 'tradicional',
    label: 'Tradicional',
    description: 'Uma coluna, cabeçalho centralizado e seções clássicas para ATS.',
  },
  {
    value: 'moderno',
    label: 'Moderno',
    description: 'Uma coluna com títulos em destaque e competências agrupadas.',
  },
  {
    value: 'executivo',
    label: 'Executivo',
    description: 'Faixa superior sóbria e o mesmo conjunto de seções profissionais.',
  },
  {
    value: 'tech',
    label: 'Tech',
    description: 'Uma coluna, nome em destaque, barra lateral e seções com linha divisória.',
  },
]

export const RESUME_FONTS: { value: ResumeFont; label: string }[] = [
  { value: 'calibri', label: 'Calibri' },
  { value: 'arial', label: 'Arial' },
  { value: 'georgia', label: 'Georgia' },
  { value: 'garamond', label: 'Garamond' },
  { value: 'verdana', label: 'Verdana' },
]

export const RESUME_PAGE_WIDTH = 794
export const RESUME_PAGE_HEIGHT = 1123

export const lookSelectClass =
  'h-11 w-full rounded-md border-2 border-input bg-background px-3 text-base text-foreground outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/40'

export function styleLabel(style: ResumeStyle): string {
  return RESUME_STYLES.find((item) => item.value === style)?.label ?? style
}

export function fontLabel(font: ResumeFont): string {
  return RESUME_FONTS.find((item) => item.value === font)?.label ?? font
}

export function isRestyleVersion(version: ResumeVersion): boolean {
  return version.kind === 'restyle' || !version.matchId
}
