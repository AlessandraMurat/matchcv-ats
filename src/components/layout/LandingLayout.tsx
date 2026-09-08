import { SiteHeader } from '@/components/layout/SiteHeader'
import { Outlet } from 'react-router-dom'

export function LandingLayout() {
  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
          <p>MatchCV · Modo demonstração</p>
          <p>Sem login. Seus dados ficam neste navegador.</p>
        </div>
      </footer>
    </div>
  )
}
