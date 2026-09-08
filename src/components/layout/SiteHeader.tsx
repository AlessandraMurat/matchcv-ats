import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const LINKS = [
  { to: { pathname: '/', hash: 'como-funciona' }, label: 'Como funciona' },
  { to: '/curriculo', label: 'Meu currículo' },
  { to: '/analises', label: 'Análises' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 text-foreground backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {LINKS.map((item) => (
            <Link key={item.label} to={item.to} className="transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ))}
          <Button asChild>
            <Link to={{ pathname: '/', hash: 'analisar' }}>Analisar vaga</Link>
          </Button>
        </nav>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-sidebar text-sidebar-foreground">
            <SheetHeader>
              <SheetTitle className="text-sidebar-foreground">MatchCV</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-3 px-4">
              {LINKS.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="py-2 text-sm text-sidebar-foreground"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Button asChild onClick={() => setOpen(false)}>
                <Link to={{ pathname: '/', hash: 'analisar' }}>Analisar vaga</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
