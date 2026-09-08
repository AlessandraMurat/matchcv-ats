import { PageHeader } from '@/components/layout/PageHeader'
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
import { Label } from '@/components/ui/label'
import {
  clearLocalData,
  clearResume,
  getPreferences,
  restoreDemoData,
  savePreferences,
} from '@/lib/storage'
import type { AppTheme } from '@/types/models'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const selectClass =
  'h-11 w-full rounded-md border-2 border-input bg-background px-3 text-base text-foreground outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/40'

export function SettingsPage() {
  const navigate = useNavigate()
  const [prefs, setPrefs] = useState(() => getPreferences())

  function updateTheme(theme: AppTheme) {
    const next = { ...prefs, theme }
    setPrefs(next)
    savePreferences(next)
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Preferências locais. O tema claro usa texto escuro, bordas fortes e botões roxos para melhor leitura."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferências</CardTitle>
        </CardHeader>
        <CardContent className="max-w-sm space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Tema</Label>
            <select
              id="theme"
              className={selectClass}
              value={prefs.theme}
              onChange={(event) => updateTheme(event.target.value as AppTheme)}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Idioma da interface</Label>
            <select id="language" className={selectClass} value="pt" disabled>
              <option value="pt">Português</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              restoreDemoData()
              navigate('/')
            }}
          >
            Restaurar dados demo
          </Button>
          <Confirm
            title="Limpar currículo?"
            description="Seu currículo salvo neste navegador será apagado."
            actionLabel="Limpar currículo"
            onConfirm={() => {
              clearResume()
              navigate('/curriculo')
            }}
          />
          <Confirm
            title="Limpar todos os dados locais?"
            description="Currículo, análises e versões geradas serão removidos deste navegador."
            actionLabel="Limpar dados locais"
            destructive
            onConfirm={() => {
              clearLocalData()
              navigate('/')
            }}
          />
        </CardContent>
      </Card>
    </section>
  )
}

function Confirm({
  title,
  description,
  actionLabel,
  destructive = false,
  onConfirm,
}: {
  title: string
  description: string
  actionLabel: string
  destructive?: boolean
  onConfirm: () => void
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={destructive ? 'destructive' : 'outline'}>{actionLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant={destructive ? 'destructive' : 'default'} onClick={onConfirm}>
              Confirmar
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
