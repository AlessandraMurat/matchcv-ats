# MatchCV

SPA para comparar um currículo com uma vaga e gerar uma versão mais compatível com ATS — **sem inventar experiências, empresas, resultados ou tecnologias**.

Não tem backend, autenticação nem API. Tudo roda no browser e persiste no `localStorage`.

## Stack

- React 19 + TypeScript + Vite 8
- React Router 7
- Tailwind CSS v4 + componentes no estilo shadcn/ui (Radix)
- Extração de arquivo: `pdfjs-dist` (PDF), `mammoth` (DOCX)
- Exportação A4: `html-to-image` + `jspdf`

## O que faz

1. Você cola o texto da vaga (URL é só metadado; o link **não** é crawleado).
2. Envia um currículo em PDF, DOCX ou TXT (máx. 8 MB, PDF com texto selecionável).
3. O app calcula **Match Score** e **ATS Score**, lista o que bateu / o que falta e gera uma versão otimizada.
4. Dá para corrigir a extração, restilizar (Tradicional, Moderno, Executivo, Tech) e baixar PDF.

A otimização **só reordena e destaca o que já existe** no currículo. Skill da vaga que não aparece no texto do usuário não entra.

## Como rodar

```bash
npm install
npm run dev
```

App em [http://localhost:5173](http://localhost:5173).

```bash
npm run build    # tsc -b && vite build
npm run preview
npm run lint     # oxlint
```

Node 20+ recomendado. Sem variáveis de ambiente.

## Rotas

| Rota | Página |
| --- | --- |
| `/` | Landing: vaga + upload do currículo |
| `/curriculo` | Correção dos dados extraídos + restyle |
| `/analises` | Histórico de matches |
| `/analise/:matchId` | Resultado do match |
| `/analise/:matchId/otimizar` | Editor da versão ATS |
| `/curriculos` | Versões geradas |
| `/curriculo/versao/:versionId` | Preview / restyle de uma versão |
| `/configuracoes` | Tema e limpeza do `localStorage` |

Na primeira visita o storage é seedado com um currículo mock (`Alessandro Costa`). Isso some quando o usuário envia o próprio arquivo ou limpa os dados em Configurações.

## Arquitetura

```
src/
  pages/            rotas
  components/       layout, UI, preview A4
  services/         parse, match, ATS, extração de arquivo
  lib/              storage, export PDF, helpers
  types/models.ts   contratos
  data/mock.ts      seed de demo
```

Fluxo principal:

```
arquivo → extractResumeFile → parseResumeText → polishResumeForAts
vaga    → parseJobInput
          ↓
     calculateMatch
          ↓
     applyMatchSuggestions → optimizeForATS → versão salva
          ↓
     AtsDocument (preview A4) → PDF
```

Matching é **determinístico** (keywords + estrutura + experiência). Não tem LLM. Tem comentário no código apontando matching semântico como evolução.

### Persistência

Chaves no `localStorage` (`src/lib/storage.ts`):

- `matchcv:v2:resume`
- `matchcv:v2:jobs`
- `matchcv:v2:matches`
- `matchcv:v2:versions`
- `matchcv:v3:prefs`

Tudo local. Limpar o site apaga currículo, vagas e versões.

### Extração do currículo

PDF usa posição Y do `pdf.js` para reconstruir linhas (senão o cabeçalho vira um blob só). O parser tenta nome no topo; se o PDF não entregar, cai no handle do GitHub/LinkedIn ou no nome do arquivo.

O preview hidrata de novo a partir do `rawText` quando o nome veio vazio ou a experiência veio quebrada.

### Preview e PDF

Folha A4 em CSS (`794×1123px`, fundo branco). Export não usa `html2canvas` — oklch do tema quebrava a captura. O fluxo atual monta o sheet no DOM e rasteriza com `html-to-image`.

Modelos visuais compartilham o mesmo conteúdo (`AtsDocument`). Só mudam header, barra e hierarquia das seções. O modelo antigo em duas colunas (sidebar escura) foi descartado porque esmagava o texto.

## Regras de negócio

- Não inventar cargo, empresa, data, métrica ou stack.
- Skill missing da vaga **não** é injetada; só sobe o que `userHasKnowledge` encontra no currículo.
- Corrigir extração é esperado (PDF mal extraído). Depois do match dá para ajustar e recalcular.
- A URL da vaga não substitui o texto colado.

## Licença

Uso pessoal / demonstração. Sem licença definida ainda.
