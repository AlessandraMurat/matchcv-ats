import { parseResumeText } from '@/services/parseResumeText'
import { polishResumeForAts } from '@/services/polishResumeForAts'
import type { Resume } from '@/types/models'

const MAX_BYTES = 8 * 1024 * 1024

async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString()

  const data = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data }).promise
  const pages: string[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const lines: string[] = []
    let current: string[] = []
    let lastY: number | null = null

    for (const item of content.items) {
      if (!('str' in item) || !item.str) continue
      const y = 'transform' in item ? Number(item.transform[5]) : 0
      if (lastY !== null && Math.abs(lastY - y) > 3) {
        lines.push(current.join(' ').trim())
        current = []
      }
      current.push(item.str)
      lastY = y
    }
    if (current.length > 0) lines.push(current.join(' ').trim())
    pages.push(lines.filter(Boolean).join('\n'))
  }

  return pages.join('\n')
}

async function extractDocxText(file: File): Promise<string> {
  const imported = await import('mammoth')
  const mammoth = imported.default ?? imported
  const data = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer: data })
  return result.value
}

export async function extractResumeFromFile(file: File): Promise<Resume> {
  if (file.size > MAX_BYTES) {
    throw new Error('O arquivo deve ter no máximo 8 MB.')
  }

  const name = file.name.toLowerCase()
  let text = ''

  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    text = await extractPdfText(file)
  } else if (name.endsWith('.docx')) {
    text = await extractDocxText(file)
  } else if (name.endsWith('.txt') || file.type === 'text/plain') {
    text = await file.text()
  } else {
    throw new Error('Envie um arquivo PDF, DOCX ou TXT.')
  }

  const cleaned = text.replace(/\s+\n/g, '\n').trim()
  if (cleaned.length < 40) {
    throw new Error(
      'Não foi possível ler texto suficiente neste arquivo. Tente um PDF com texto selecionável.',
    )
  }

  return polishResumeForAts(parseResumeText(cleaned, file.name))
}
