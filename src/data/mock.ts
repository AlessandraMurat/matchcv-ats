import type { Job, Resume } from '@/types/models'

export const MOCK_RESUME: Resume = {
  id: 'resume-base',
  personal: {
    fullName: 'Alessandro Costa',
    desiredRole: 'Desenvolvedor Fullstack',
    email: 'alessandro.costa@email.com',
    phone: '(11) 98888-1200',
    location: 'São Paulo, SP',
    linkedin: 'linkedin.com/in/alessandrocosta',
    github: 'github.com/alessandrocosta',
  },
  summary:
    'Desenvolvedor fullstack com 6 anos de experiência em produtos web. Atua com React, TypeScript e Node.js, com foco em interfaces acessíveis, APIs REST e entrega contínua. Já liderou melhorias de performance e colaborou com produto e design em squads ágeis.',
  experiences: [
    {
      id: 'exp-1',
      company: 'Nimbus Digital',
      role: 'Desenvolvedor Fullstack Pleno',
      startDate: '2022-03',
      endDate: null,
      current: true,
      location: 'São Paulo, SP',
      description:
        'Desenvolvimento de aplicações web para clientes B2B, da interface ao backend.',
      highlights: [
        'Implementou dashboard de métricas em React e TypeScript usado por 40 contas ativas.',
        'Reduziu tempo de carregamento inicial em 32% com code splitting e cache de API.',
        'Construiu APIs REST em Node.js e PostgreSQL para o módulo de relatórios.',
      ],
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    },
    {
      id: 'exp-2',
      company: 'Orbita Labs',
      role: 'Desenvolvedor Frontend',
      startDate: '2019-08',
      endDate: '2022-02',
      current: false,
      location: 'Remoto',
      description:
        'Manutenção e evolução de SPA de onboarding financeiro.',
      highlights: [
        'Migrou componentes de JavaScript para TypeScript em um design system interno.',
        'Implementou fluxos de formulário com validação e testes em Jest.',
        'Colaborou com design na padronização de 20+ componentes reutilizáveis.',
      ],
      skills: ['React', 'JavaScript', 'TypeScript', 'Jest', 'CSS'],
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'Universidade Presbiteriana Mackenzie',
      degree: 'Bacharelado',
      field: 'Ciência da Computação',
      startDate: '2015-02',
      endDate: '2019-12',
    },
  ],
  skills: [
    { id: 'sk-1', name: 'React', level: 'avançado' },
    { id: 'sk-2', name: 'TypeScript', level: 'avançado' },
    { id: 'sk-3', name: 'JavaScript', level: 'avançado' },
    { id: 'sk-4', name: 'Node.js', level: 'intermediário' },
    { id: 'sk-5', name: 'PostgreSQL', level: 'intermediário' },
    { id: 'sk-6', name: 'Tailwind CSS', level: 'avançado' },
    { id: 'sk-7', name: 'Git', level: 'avançado' },
    { id: 'sk-8', name: 'REST APIs', level: 'avançado' },
    { id: 'sk-9', name: 'Jest', level: 'intermediário' },
    { id: 'sk-10', name: 'HTML', level: 'avançado' },
    { id: 'sk-11', name: 'CSS', level: 'avançado' },
    { id: 'sk-12', name: 'Figma', level: 'básico' },
  ],
  languages: [
    { id: 'lang-1', name: 'Português', level: 'Nativo' },
    { id: 'lang-2', name: 'Inglês', level: 'Avançado' },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'Meta Front-End Developer',
      issuer: 'Coursera',
      date: '2023-06',
    },
  ],
  updatedAt: '2026-09-01T12:00:00.000Z',
}

export const EMPTY_RESUME: Resume = {
  id: 'resume-base',
  personal: {
    fullName: '',
    desiredRole: '',
    email: '',
    phone: '',
    location: '',
  },
  summary: '',
  experiences: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
  updatedAt: new Date().toISOString(),
}

export const SAMPLE_JOB_TEXT = `Desenvolvedor Frontend React
Empresa: Aurora Fintech
Local: São Paulo, SP · Híbrido
Faixa: R$ 9.000 – R$ 12.000

Buscamos alguém para evoluir o internet banking em React e TypeScript, com atenção a acessibilidade, performance e design system.

Requisitos:
- Experiência sólida com React e TypeScript
- Familiaridade com Tailwind CSS
- Consumo de REST APIs
- Testes com Jest
- Git e code review
- Diferencial: Next.js, Docker e CI/CD
`

export const MOCK_JOBS: Job[] = [
  {
    id: 'job-01',
    title: 'Desenvolvedor Frontend React',
    company: 'Aurora Fintech',
    location: 'São Paulo, SP',
    workMode: 'híbrido',
    seniority: 'pleno',
    salary: 'R$ 9.000 – R$ 12.000',
    description:
      'Buscamos alguém para evoluir o internet banking em React e TypeScript, com atenção a acessibilidade, performance e design system.',
    requirements: [
      'Experiência sólida com React e TypeScript',
      'Familiaridade com Tailwind CSS ou CSS-in-JS',
      'Consumo de APIs REST',
      'Inglês intermediário',
    ],
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'REST APIs', 'Jest', 'Git', 'Acessibilidade'],
    postedAt: '2026-08-28',
  },
  {
    id: 'job-02',
    title: 'Desenvolvedor Fullstack',
    company: 'Vertice Saúde',
    location: 'Remoto',
    workMode: 'remoto',
    seniority: 'pleno',
    salary: 'R$ 10.000 – R$ 14.000',
    description:
      'Squad responsável pelo portal de pacientes. Stack principal: React, Node.js e PostgreSQL.',
    requirements: [
      'Experiência com React e Node.js',
      'Modelagem básica em PostgreSQL',
      'Entrega em sprints e code review',
    ],
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST APIs', 'Docker', 'Git'],
    postedAt: '2026-08-30',
  },
  {
    id: 'job-03',
    title: 'Engenheiro de Software Backend',
    company: 'Atlas Logística',
    location: 'Campinas, SP',
    workMode: 'híbrido',
    seniority: 'sênior',
    salary: 'R$ 14.000 – R$ 18.000',
    description:
      'Evolução de microsserviços de rastreio em Java e Kafka, com foco em resiliência e observabilidade.',
    requirements: [
      'Java 17+ e Spring Boot',
      'Mensageria com Kafka',
      'Experiência com sistemas distribuídos',
    ],
    skills: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL', 'Docker', 'Kubernetes', 'Observabilidade'],
    postedAt: '2026-08-20',
  },
  {
    id: 'job-04',
    title: 'Product Designer',
    company: 'Lume Educação',
    location: 'Rio de Janeiro, RJ',
    workMode: 'híbrido',
    seniority: 'pleno',
    salary: 'R$ 8.000 – R$ 11.000',
    description:
      'Desenhar jornadas de aprendizado para professores e alunos, do discovery ao handoff.',
    requirements: [
      'Portfólio de produto digital',
      'Domínio de Figma',
      'Pesquisa com usuários',
    ],
    skills: ['Figma', 'Pesquisa', 'Design System', 'Prototipação', 'UX Writing'],
    postedAt: '2026-08-22',
  },
  {
    id: 'job-05',
    title: 'Analista de Dados',
    company: 'Norte Retail',
    location: 'São Paulo, SP',
    workMode: 'presencial',
    seniority: 'pleno',
    salary: 'R$ 7.500 – R$ 10.000',
    description:
      'Construção de dashboards e análises de sell-out para o time comercial.',
    requirements: [
      'SQL avançado',
      'Python para análise',
      'Power BI ou Looker',
    ],
    skills: ['SQL', 'Python', 'Power BI', 'Excel', 'Estatística'],
    postedAt: '2026-08-18',
  },
  {
    id: 'job-06',
    title: 'Desenvolvedor Mobile React Native',
    company: 'Pulse Bank',
    location: 'Remoto',
    workMode: 'remoto',
    seniority: 'pleno',
    salary: 'R$ 11.000 – R$ 15.000',
    description:
      'Evolução do app de conta digital em React Native, com TypeScript e testes.',
    requirements: [
      'React Native em produção',
      'TypeScript',
      'Publicação nas stores',
    ],
    skills: ['React Native', 'TypeScript', 'Jest', 'Redux', 'CI/CD', 'Git'],
    postedAt: '2026-09-01',
  },
  {
    id: 'job-07',
    title: 'Engenheiro DevOps',
    company: 'Cirrus Cloud',
    location: 'Belo Horizonte, MG',
    workMode: 'híbrido',
    seniority: 'sênior',
    salary: 'R$ 15.000 – R$ 20.000',
    description:
      'Pipelines, observabilidade e infraestrutura como código para produtos SaaS.',
    requirements: [
      'AWS ou GCP',
      'Terraform e Kubernetes',
      'CI/CD com GitHub Actions ou similar',
    ],
    skills: ['AWS', 'Terraform', 'Kubernetes', 'Docker', 'GitHub Actions', 'Observabilidade'],
    postedAt: '2026-08-15',
  },
  {
    id: 'job-08',
    title: 'Desenvolvedor Frontend Júnior',
    company: 'Estúdio Pixel',
    location: 'Curitiba, PR',
    workMode: 'presencial',
    seniority: 'júnior',
    salary: 'R$ 4.500 – R$ 6.000',
    description:
      'Apoiar o time em landing pages e painéis internos com React.',
    requirements: [
      'HTML, CSS e JavaScript',
      'Noções de React',
      'Vontade de aprender TypeScript',
    ],
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
    postedAt: '2026-09-03',
  },
  {
    id: 'job-09',
    title: 'Tech Lead Frontend',
    company: 'Horizon Insurance',
    location: 'São Paulo, SP',
    workMode: 'híbrido',
    seniority: 'sênior',
    salary: 'R$ 16.000 – R$ 22.000',
    description:
      'Liderar o frontend do portal de apólices, mentorar o time e garantir qualidade técnica.',
    requirements: [
      'Experiência avançada com React e TypeScript',
      'Liderança técnica de squad',
      'Design system e testes',
    ],
    skills: [
      'React',
      'TypeScript',
      'Design System',
      'Jest',
      'Liderança técnica',
      'Arquitetura frontend',
      'Git',
    ],
    postedAt: '2026-08-25',
  },
  {
    id: 'job-10',
    title: 'Analista de QA',
    company: 'Folio Jurídico',
    location: 'Remoto',
    workMode: 'remoto',
    seniority: 'pleno',
    salary: 'R$ 7.000 – R$ 9.500',
    description:
      'Testes manuais e automatizados para um SaaS de gestão de processos.',
    requirements: [
      'Casos de teste e evidências',
      'Automação com Cypress ou Playwright',
      'Noções de APIs REST',
    ],
    skills: ['Cypress', 'Playwright', 'Testes manuais', 'REST APIs', 'Jira'],
    postedAt: '2026-08-27',
  },
  {
    id: 'job-11',
    title: 'Desenvolvedor Backend Python',
    company: 'AgroData',
    location: 'Piracicaba, SP',
    workMode: 'híbrido',
    seniority: 'pleno',
    salary: 'R$ 9.500 – R$ 13.000',
    description:
      'APIs de ingestão de dados agrícolas em Python, FastAPI e PostgreSQL.',
    requirements: [
      'Python e FastAPI',
      'PostgreSQL',
      'Integrações com filas ou jobs',
    ],
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Redis', 'REST APIs'],
    postedAt: '2026-08-12',
  },
  {
    id: 'job-12',
    title: 'Desenvolvedor Frontend TypeScript',
    company: 'Clara RH',
    location: 'Remoto',
    workMode: 'remoto',
    seniority: 'pleno',
    salary: 'R$ 8.500 – R$ 11.500',
    description:
      'Construção do módulo de avaliação de desempenho em React, TypeScript e testes.',
    requirements: [
      'React com TypeScript',
      'Componentes reutilizáveis',
      'Git e code review',
    ],
    skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'Jest', 'Git', 'Figma'],
    postedAt: '2026-09-05',
  },
]
