import { parseResumeText, hydrateResume } from '../src/services/parseResumeText'

const sample = `Alessandra Murat linkedin.com/in/alessandramurat | github.com/AlessandraMurat
RESUMO PROFISSIONAL
Profissional de tecnologia com trajetoria em desenvolvimento web.
COMPETENCIAS TECNICAS
Front-end: React, Next.js, TypeScript
EXPERIENCIA PROFISSIONAL
Atuei no desenvolvimento de sistemas web com React, Next.js e Node.js em squads agiles.
Desenvolvedora Full Stack Pleno | JSMX | Remoto | 11/2025 - Atual`

const parsed = parseResumeText(sample, 'curriculo-alessandra-murat.pdf')
const hydrated = hydrateResume({
  ...parsed,
  personal: { ...parsed.personal, fullName: '' },
})

const githubOnly = parseResumeText(
  `linkedin.com/in/alessandramurat | github.com/AlessandraMurat
RESUMO PROFISSIONAL
Texto de resumo profissional suficiente para passar no parser.
EXPERIENCIA PROFISSIONAL
Atuei no desenvolvimento de sistemas web com React e Node.js.
Desenvolvedora Full Stack Pleno | JSMX | Remoto | 11/2025 - Atual`,
)

console.log(
  JSON.stringify(
    {
      name: parsed.personal.fullName,
      hydratedName: hydrated.personal.fullName,
      githubFallback: githubOnly.personal.fullName,
      linkedin: parsed.personal.linkedin,
      github: parsed.personal.github,
      experience: parsed.experiences.map((item) => ({
        role: item.role,
        company: item.company,
        location: item.location,
        description: item.description.slice(0, 80),
      })),
    },
    null,
    2,
  ),
)
