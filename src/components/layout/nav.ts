import {
  FileText,
  LayoutDashboard,
  Settings,
  Sparkles,
  UserRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Início', icon: LayoutDashboard },
  { to: '/curriculo', label: 'Meu currículo', icon: UserRound },
  { to: '/analises', label: 'Análises', icon: Sparkles },
  { to: '/curriculos', label: 'Currículos', icon: FileText },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
]
