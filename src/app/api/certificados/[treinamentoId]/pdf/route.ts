export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { readFile } from 'fs/promises'
import path from 'path'

// Lazy import com fallback: usa @sparticuz/chromium + puppeteer-core em produção
// e faz fallback para puppeteer (com Chromium empacotado) no dev/Windows.
async function gerarPDFHtml(html: string): Promise<Buffer | null> {
  try {
    let browser: any
    try {
      const chromium = (await import('@sparticuz/chromium')).default || (await import('@sparticuz/chromium'))
      const puppeteerCore = (await import('puppeteer-core')).default || (await import('puppeteer-core'))
      const executablePath = await (chromium as any).executablePath()
      if (!executablePath) throw new Error('No chromium executablePath')
      browser = await (puppeteerCore as any).launch({
        args: (chromium as any).args,
        defaultViewport: (chromium as any).defaultViewport,
        executablePath,
        headless: (chromium as any).headless,
      })
    } catch (err) {
      // Fallback local (Windows/dev): usa puppeteer completo com Chromium empacotado
      const puppeteer = (await import('puppeteer')).default || (await import('puppeteer'))
      browser = await (puppeteer as any).launch({ headless: 'new' })
    }

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdf: Buffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      preferCSSPageSize: true,
      scale: 0.97
    })

    await browser.close()
    return pdf
  } catch (e) {
    console.error('Falha ao gerar PDF via Puppeteer:', e)
    return null
  }
}

async function getLogoDataUrl(): Promise<string | null> {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png')
    const buf = await readFile(logoPath)
    return `data:image/png;base64,${buf.toString('base64')}`
  } catch {
    return null
  }
}

function buildCertificateHtml(params: {
  nome: string
  tituloTreinamento: string
  dataConclusao: string
  notaFinal: string
  codigoValidacao: string
  dataEmissao: string
  logoDataUrl?: string | null
}): string {
  const { nome, tituloTreinamento, dataConclusao, notaFinal, codigoValidacao, dataEmissao, logoDataUrl } = params
  return `<!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Certificado - ${tituloTreinamento}</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; background: #f3f4f6; font-family: Arial, Helvetica, sans-serif; }
      /* Margem visual menor (5mm) e sem overflow para não cortar borda */
      .wrap { width: calc(297mm - 10mm); height: calc(210mm - 10mm); margin: 5mm auto; background: white; position: relative; overflow: visible; page-break-inside: avoid; }
      .inner { padding: 14mm 16mm; position: relative; background: linear-gradient(135deg, #ffffff 0%, #f8f9fb 100%); page-break-inside: avoid; }
      .frame { position: absolute; inset: 12mm; border: 3px solid #014175; border-radius: 8px; }
      .frame:after { content: ''; position: absolute; inset: -2px; border: 1px solid #FF6B00; border-radius: 10px; }
      h1 { font-size: 48px; font-weight: 700; color: #014175; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 3px; text-align: center; }
      .subtitle { font-size: 18px; color: #666; margin: 0 0 28px; text-align: center; }
      .label { font-size: 16px; color: #333; line-height: 1.7; text-align: center; margin: 0 0 22px; }
      .name { font-size: 36px; font-weight: 700; color: #014175; display: inline-block; border-bottom: 2px solid #FF6B00; padding-bottom: 8px; margin: 0 0 22px; }
      .title { font-size: 28px; font-weight: 700; color: #014175; background: rgba(1,65,117,.05); padding: 16px; border-radius: 8px; text-align: center; margin: 0 0 28px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 0 0 24px; page-break-inside: avoid; }
      .grid h6 { font-size: 14px; color: #999; margin: 0 0 8px; text-align: center; font-weight: 400; }
      .grid p { font-size: 18px; font-weight: 700; color: #333; margin: 0; text-align: center; }
      .grid .nota { color: #FF6B00; }
      .code { background: #f8f9fb; padding: 14px; border-radius: 8px; text-align: center; page-break-inside: avoid; }
      .code .label { font-size: 12px; color: #999; text-transform: uppercase; margin: 0 0 8px; }
      .code .value { font-size: 20px; font-weight: 700; color: #014175; letter-spacing: 2px; font-family: monospace; }
      .footer { font-size: 12px; color: #999; text-align: center; margin-top: 20px; page-break-inside: avoid; }
      @page { size: A4 landscape; margin: 0; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="inner">
        <div class="frame"></div>
        ${logoDataUrl ? `<div style="text-align:center; margin-bottom: 32px;"><img src="${logoDataUrl}" alt="DF Corretora" style="width:280px;height:auto;"/></div>` : ''}
        <h1>Certificado</h1>
        <p class="subtitle">de Conclusão</p>
        <p class="label">Certificamos que</p>
        <div style="text-align:center"><span class="name">${nome}</span></div>
        <p class="label">concluiu com sucesso o treinamento</p>
        <h3 class="title">${tituloTreinamento}</h3>
        <div class="grid">
          <div>
            <h6>Data de Conclusão</h6>
            <p>${dataConclusao}</p>
          </div>
          <div>
            <h6>Nota Final</h6>
            <p class="nota">${notaFinal}%</p>
          </div>
        </div>
        <div class="code">
          <div class="label">Código de Validação</div>
          <div class="value">${codigoValidacao}</div>
        </div>
        <p class="footer">Emitido por DF Corretora em ${dataEmissao}</p>
      </div>
    </div>
  </body>
  </html>`
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ treinamentoId: string }> }
) {
  try {
    const { treinamentoId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    // Confirma certificado do usuário
    const { data: certificado } = await supabase
      .from('certificados')
      .select('id, user_id, treinamento_id, data_conclusao, nota_final, codigo_validacao, data_emissao, treinamentos(titulo)')
      .eq('user_id', user.id)
      .eq('treinamento_id', treinamentoId)
      .single()

    if (!certificado) {
      return NextResponse.json({ error: 'Certificado não encontrado' }, { status: 404 })
    }

    // Busca nome do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('nome')
      .eq('id', user.id)
      .single()

    const logoDataUrl = await getLogoDataUrl()

    // Monta HTML e gera PDF (sem navegar para URL protegida)
    const html = buildCertificateHtml({
      nome: profile?.nome || 'Usuário',
      tituloTreinamento: certificado.treinamentos?.titulo || 'Treinamento',
      dataConclusao: new Date(certificado.data_conclusao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
      notaFinal: Number(certificado.nota_final || 0).toFixed(1),
      codigoValidacao: certificado.codigo_validacao,
      dataEmissao: new Date(certificado.data_emissao).toLocaleDateString('pt-BR'),
      logoDataUrl,
    })

    const pdfBuffer = await gerarPDFHtml(html)

    if (!pdfBuffer) {
      // Fallback: abrir a página para impressão manual
      const baseUrl = request.nextUrl.origin
      const certificadoUrl = `${baseUrl}/certificados/${treinamentoId}`
      return NextResponse.json({ url: certificadoUrl, fallback: true })
    }

    // Upload no Storage (bucket 'apostilas' ou 'certificados')
    const filePath = `certificados/${user.id}-${treinamentoId}-${Date.now()}.pdf`
    const { data: upload, error: upErr } = await supabase.storage
      .from('apostilas')
      .upload(filePath, pdfBuffer, { contentType: 'application/pdf', upsert: true })

    if (upErr) {
      console.error('Erro de upload do PDF:', upErr)
      const baseUrl = request.nextUrl.origin
      const certificadoUrl = `${baseUrl}/certificados/${treinamentoId}`
      return NextResponse.json({ url: certificadoUrl, fallback: true })
    }

    const { data: pub } = await supabase.storage
      .from('apostilas')
      .getPublicUrl(filePath)

    // Atualiza certificado com pdf_url
    await supabase
      .from('certificados')
      .update({ pdf_url: pub.publicUrl })
      .eq('id', certificado.id)

    return NextResponse.json({ url: pub.publicUrl })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Falha ao gerar PDF' }, { status: 500 })
  }
}


