import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import { RESUME_PAGE_WIDTH } from '@/lib/resumeLook'
import type { Resume } from '@/types/models'

export function resumeFileName(resume: Resume, extra?: string) {
  const base = (resume.personal.fullName || 'curriculo')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
  return extra ? `${base}-${extra}` : base
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  window.setTimeout(() => {
    URL.revokeObjectURL(url)
    link.remove()
  }, 1500)
}

export async function downloadResumePdf(element: HTMLElement, filename: string) {
    const dataUrl = await toPng(element, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipFonts: true,
      width: RESUME_PAGE_WIDTH,
    })

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const props = pdf.getImageProperties(dataUrl)
  const imgWidth = pageWidth
  const imgHeight = (props.height * imgWidth) / props.width

  let heightLeft = imgHeight
  let position = 0

  pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight
  while (heightLeft > 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
  triggerDownload(pdf.output('blob'), safeName)
}

export function printResumeElement(element: HTMLElement) {
  const iframe = document.createElement('iframe')
  iframe.setAttribute(
    'style',
    'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0',
  )
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument
  const frameWindow = iframe.contentWindow
  if (!doc || !frameWindow) {
    iframe.remove()
    throw new Error('Não foi possível abrir a impressão do currículo.')
  }

  const styles = [...document.querySelectorAll('style, link[rel="stylesheet"]')]
    .map((node) => node.outerHTML)
    .join('\n')

  doc.open()
  doc.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Currículo</title>
    ${styles}
    <style>
      html, body { background: #fff !important; margin: 0; }
      @page { size: A4; margin: 0; }
    </style>
  </head>
  <body>${element.outerHTML}</body>
</html>`)
  doc.close()

  window.setTimeout(() => {
    frameWindow.focus()
    frameWindow.print()
    window.setTimeout(() => iframe.remove(), 1500)
  }, 300)
}
