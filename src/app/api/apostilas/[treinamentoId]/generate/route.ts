import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ treinamentoId: string }> }
) {
  try {
    const { treinamentoId } = await params
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    // Buscar apostila
    const { data: apostila } = await supabase
      .from('apostilas')
      .select('*')
      .eq('treinamento_id', treinamentoId)
      .eq('ativo', true)
      .order('versao', { ascending: false })
      .limit(1)
      .single()
    
    if (!apostila) {
      return NextResponse.json({ error: 'Apostila não encontrada' }, { status: 404 })
    }
    
    // NOTA: Implementação simplificada
    // Em produção, você pode usar:
    // 1. Puppeteer + @sparticuz/chromium para gerar PDF server-side
    // 2. Serviço externo como PDFShift, DocRaptor, etc.
    // 3. @react-pdf/renderer para geração em JS puro
    
    // Por enquanto, retorna a URL da página para impressão manual
    const baseUrl = request.nextUrl.origin
    const apostilaUrl = `${baseUrl}/treinamentos/${treinamentoId}/apostila`
    
    // Simular geração de PDF (em produção, fazer o upload real)
    // const pdfBuffer = await gerarPDFComPuppeteer(apostilaUrl)
    // const { data: upload } = await supabase.storage
    //   .from('apostilas')
    //   .upload(`treinamento-${treinamentoId}-v${apostila.versao}.pdf`, pdfBuffer)
    
    // await supabase.from('apostilas_arquivos').insert({
    //   apostila_id: apostila.id,
    //   versao: apostila.versao,
    //   arquivo_url: upload.path,
    //   tamanho_bytes: pdfBuffer.length
    // })
    
    return NextResponse.json({ 
      url: apostilaUrl,
      message: 'Use o botão Imprimir para salvar como PDF no navegador'
    })
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar PDF' },
      { status: 500 }
    )
  }
}

// Função exemplo de geração com Puppeteer (não implementada nesta versão)
// async function gerarPDFComPuppeteer(url: string): Promise<Buffer> {
//   const chromium = require('@sparticuz/chromium')
//   const puppeteer = require('puppeteer-core')
//   
//   const browser = await puppeteer.launch({
//     args: chromium.args,
//     defaultViewport: chromium.defaultViewport,
//     executablePath: await chromium.executablePath(),
//     headless: chromium.headless,
//   })
//   
//   const page = await browser.newPage()
//   await page.goto(url, { waitUntil: 'networkidle0' })
//   
//   const pdf = await page.pdf({
//     format: 'A4',
//     printBackground: true,
//     margin: {
//       top: '20mm',
//       right: '16mm',
//       bottom: '20mm',
//       left: '16mm'
//     }
//   })
//   
//   await browser.close()
//   return pdf
// }

