import { Logo } from '@/components/layout/Logo'
import { SidebarNav } from '@/components/layout/SidebarNav'

export function AppSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center px-6 text-sidebar-foreground">
        <Logo compact />
      </div>
      <div className="flex-1 py-4">
        <SidebarNav />
      </div>
      <div className="border-t border-sidebar-border px-6 py-4">
        <p className="text-sm font-medium text-sidebar-foreground">Modo demonstração</p>
        <p className="text-sm text-sidebar-foreground">Sem login neste momento</p>
      </div>
    </aside>
  )
}
