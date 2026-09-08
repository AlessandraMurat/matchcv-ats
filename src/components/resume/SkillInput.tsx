import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { useState } from 'react'

interface SkillInputProps {
  skills: string[]
  onChange: (skills: string[]) => void
  placeholder?: string
}

export function SkillInput({ skills, onChange, placeholder }: SkillInputProps) {
  const [value, setValue] = useState('')

  function addSkill() {
    const next = value.trim()
    if (!next) return
    if (!skills.some((skill) => skill.toLowerCase() === next.toLowerCase())) {
      onChange([...skills, next])
    }
    setValue('')
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={value}
          placeholder={placeholder ?? 'Digite uma skill e pressione Enter'}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              addSkill()
            }
          }}
        />
        <Button type="button" variant="outline" onClick={addSkill}>
          Adicionar
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge key={skill} variant="secondary" className="gap-1">
            {skill}
            <button
              type="button"
              aria-label={`Remover ${skill}`}
              onClick={() => onChange(skills.filter((item) => item !== skill))}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )
}
