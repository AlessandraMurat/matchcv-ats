import { groupSkills } from '@/services/polishResumeForAts'
import { formatMonth } from '@/lib/text'
import { cn } from '@/lib/utils'
import type { Experience, Resume, ResumeStyle } from '@/types/models'

function headingClass(style: ResumeStyle) {
  if (style === 'moderno') {
    return 'mb-2 border-b-2 border-[#4338ca] pb-1 text-[11px] font-bold tracking-[0.14em] text-[#3730a3] uppercase'
  }
  if (style === 'executivo') {
    return 'mb-2 text-[11px] font-semibold tracking-[0.2em] text-[#1a1a2e] uppercase'
  }
  if (style === 'tech') {
    return 'mb-1.5 border-b border-neutral-300 pb-1 text-[11px] font-bold tracking-[0.12em] uppercase'
  }
  return 'mb-2 text-[12px] font-bold uppercase'
}

function prettyContact(value: string) {
  return value.replace(/^https?:\/\//i, '').replace(/^www\./i, '')
}

function contactLine(resume: Resume, style: ResumeStyle) {
  const items =
    style === 'tech'
      ? [
          resume.personal.linkedin,
          resume.personal.github,
          resume.personal.email,
          resume.personal.phone,
          resume.personal.location,
          resume.personal.website,
        ]
      : [
          resume.personal.location,
          resume.personal.email,
          resume.personal.phone,
          resume.personal.linkedin,
          resume.personal.github,
          resume.personal.website,
        ]

  return items.filter(Boolean).map((item) => prettyContact(item as string))
}

function experienceDates(experience: Experience) {
  if (!experience.startDate && !experience.endDate && !experience.current) return ''
  return `${formatMonth(experience.startDate || null)} - ${formatMonth(experience.endDate, experience.current)}`
}

function experienceMeta(experience: Experience) {
  return [experience.role, experience.company, experience.location, experienceDates(experience)]
    .filter(Boolean)
    .join(' | ')
}

function ExperienceBlock({ experience, style }: { experience: Experience; style: ResumeStyle }) {
  const body = [experience.description, ...experience.highlights].filter(Boolean)
  const meta = experienceMeta(experience)

  if (style === 'tech') {
    return (
      <div>
        {body.length > 0 ? (
          <p className="text-[12px] leading-5">{body.join(' ')}</p>
        ) : null}
        {meta ? <p className="mt-1 text-[11.5px] italic text-neutral-700">{meta}</p> : null}
      </div>
    )
  }

  return (
    <div>
      <p className="text-[13px] font-bold">{experience.role}</p>
      <p className="text-[11.5px] italic text-neutral-700">
        {[experience.company, experience.location, experienceDates(experience)].filter(Boolean).join(' | ')}
      </p>
      {experience.description ? (
        <p className="mt-1 text-[12px] leading-5">{experience.description}</p>
      ) : null}
      {experience.highlights.length > 0 ? (
        <ul className="mt-1 list-none space-y-0.5 text-[12px] leading-5">
          {experience.highlights.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function AtsDocument({ resume, style }: { resume: Resume; style: ResumeStyle }) {
  const contact = contactLine(resume, style)
  const skillGroups = groupSkills(resume.skills)

  return (
    <div
      className={cn(
        'box-border min-h-[1123px] bg-white text-[#111]',
        style === 'tech' && 'border-l-[10px] border-[#1e1b4b]',
      )}
    >
      {style === 'executivo' ? (
        <header className="bg-[#1a1a2e] px-12 py-7 text-white">
          <h1 className="text-[22px] font-bold tracking-[0.12em] uppercase">
            {resume.personal.fullName || 'Seu nome'}
          </h1>
          {resume.personal.desiredRole ? (
            <p className="mt-2 text-[12px] text-white/90">{resume.personal.desiredRole}</p>
          ) : null}
          {contact.length > 0 ? (
            <p className="mt-3 text-[11px] leading-5 text-white/75">{contact.join(' | ')}</p>
          ) : null}
        </header>
      ) : (
        <header className={cn('px-12 pt-10 pb-4', style === 'tradicional' ? 'text-center' : 'text-left')}>
          <h1
            className={cn(
              'font-bold uppercase',
              style === 'tech' ? 'text-[26px] leading-tight tracking-[0.04em]' : 'text-[22px] tracking-[0.08em]',
            )}
          >
            {resume.personal.fullName || 'Seu nome'}
          </h1>
          {style !== 'tech' && resume.personal.desiredRole ? (
            <p className={cn('mt-1 text-[12.5px]', style === 'moderno' && 'font-medium text-[#4338ca]')}>
              {resume.personal.desiredRole}
            </p>
          ) : null}
          {contact.length > 0 ? (
            <p className="mt-2 text-[11px] leading-5 text-neutral-600">{contact.join(' | ')}</p>
          ) : null}
        </header>
      )}

      <div className="space-y-5 px-12 py-5">
        {resume.summary ? (
          <section>
            <h2 className={headingClass(style)}>Resumo profissional</h2>
            <p className="text-[12px] leading-5">{resume.summary}</p>
          </section>
        ) : null}

        {skillGroups.length > 0 ? (
          <section>
            <h2 className={headingClass(style)}>Competências técnicas</h2>
            <div className="space-y-1">
              {skillGroups.map((group) => (
                <p key={group.label} className="text-[12px] leading-5">
                  <span className="font-bold">{group.label}:</span> {group.items.join(', ')}.
                </p>
              ))}
            </div>
          </section>
        ) : null}

        {resume.experiences.length > 0 ? (
          <section>
            <h2 className={headingClass(style)}>Experiência profissional</h2>
            <div className="space-y-3.5">
              {resume.experiences.map((experience) => (
                <ExperienceBlock key={experience.id} experience={experience} style={style} />
              ))}
            </div>
          </section>
        ) : null}

        {resume.education.length > 0 ? (
          <section>
            <h2 className={headingClass(style)}>Formação acadêmica</h2>
            <div className="space-y-1.5">
              {resume.education.map((item) => (
                <p key={item.id} className="text-[12px] leading-5">
                  <span className="font-bold">
                    {item.degree}
                    {item.field ? ` em ${item.field}` : ''}
                  </span>
                  {item.institution ? ` — ${item.institution}` : ''}
                </p>
              ))}
            </div>
          </section>
        ) : null}

        {resume.languages.length > 0 ? (
          <section>
            <h2 className={headingClass(style)}>Idiomas</h2>
            <p className="text-[12px] leading-5">
              {resume.languages
                .map((language) =>
                  language.level ? `${language.name} (${language.level})` : language.name,
                )
                .join(' · ')}
              .
            </p>
          </section>
        ) : null}

        {resume.certifications.length > 0 ? (
          <section>
            <h2 className={headingClass(style)}>Certificações</h2>
            <div className="space-y-1">
              {resume.certifications.map((item) => (
                <p key={item.id} className="text-[12px] leading-5">
                  {item.name}
                  {item.issuer ? ` — ${item.issuer}` : ''}
                  {item.date ? ` (${item.date})` : ''}.
                </p>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
