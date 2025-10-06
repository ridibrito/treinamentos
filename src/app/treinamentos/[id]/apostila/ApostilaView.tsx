'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Printer, Download } from 'lucide-react'

interface ApostilaViewProps {
  treinamento: any
  apostila: any
}

export function ApostilaView({ treinamento, apostila }: ApostilaViewProps) {
  const router = useRouter()
  
  const capa = apostila?.capa ? JSON.parse(apostila.capa) : {}
  const glossario = apostila?.glossario ? JSON.parse(apostila.glossario) : []
  const checklist = apostila?.checklist ? JSON.parse(apostila.checklist) : []
  const faq = apostila?.faq ? JSON.parse(apostila.faq) : []
  
  const handleImprimir = () => {
    window.print()
  }
  
  const handleBaixarPDF = () => {
    // Usa o print nativo do navegador que permite salvar como PDF
    // Chamada direta sem toast para não aparecer na impressão
    window.print()
  }
  
  return (
    <div>
      {/* Cabeçalho (não imprime) */}
      <div className="no-print sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleImprimir}
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              
              <Button
                variant="primary"
                onClick={handleBaixarPDF}
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Watermark */}
      {apostila?.watermark && (
        <div className="watermark">
          {apostila.watermark}
        </div>
      )}
      
      {/* Conteúdo da Apostila */}
      <article className="apostila bg-white">
        {/* Cabeçalho de impressão */}
        <header className="print hidden">
          <img src="/logo.png" alt="DF Corretora" style={{ width: '250px', height: 'auto' }} />
        </header>
        
        {/* Capa */}
        <section className="capa page">
          <img src="/logo.png" alt="DF Corretora" className="logo mb-8" style={{ width: '250px', height: 'auto' }} />
          <h1 className="text-5xl font-bold text-primary mb-4">
            {capa.titulo || treinamento.titulo}
          </h1>
          {capa.subtitulo && (
            <h2 className="text-2xl text-gray-600 mb-8">{capa.subtitulo}</h2>
          )}
          <div className="mt-12 text-gray-600">
            {capa.turma && <p className="mb-2"><strong>Turma:</strong> {capa.turma}</p>}
            {capa.data && <p className="mb-2"><strong>Data:</strong> {capa.data}</p>}
            {capa.instrutor && <p className="mb-2"><strong>Instrutor:</strong> {capa.instrutor}</p>}
          </div>
        </section>
        
        {/* Apresentação */}
        {apostila?.apresentacao && (
          <section className="page-break-before p-12">
            <h2 className="text-3xl font-bold text-primary mb-6">Apresentação</h2>
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: apostila.apresentacao }} />
          </section>
        )}
        
        {/* Sumário */}
        <section className="sumario page-break-before p-12">
          <h2 className="text-3xl font-bold text-primary mb-8">Sumário</h2>
          <ol className="space-y-3">
            {treinamento.modulos.map((modulo: any, index: number) => (
              <li key={modulo.id} className="text-lg">
                {modulo.titulo}
              </li>
            ))}
            {glossario.length > 0 && <li className="text-lg">Glossário</li>}
            {checklist.length > 0 && <li className="text-lg">Checklist</li>}
            {faq.length > 0 && <li className="text-lg">FAQ</li>}
            {apostila?.paginas_anotacoes > 0 && <li className="text-lg">Anotações</li>}
          </ol>
        </section>
        
        {/* Módulos */}
        {treinamento.modulos.map((modulo: any, index: number) => (
          <section key={modulo.id} className="modulo page-break-before p-12">
            <h2 className="text-3xl font-bold text-primary mb-6">
              Módulo {index + 1}: {modulo.titulo}
            </h2>
            
            {modulo.descricao && (
              <p className="text-lg text-gray-700 mb-6">{modulo.descricao}</p>
            )}
            
            {modulo.conteudo && (
              <div className="prose prose-lg max-w-none mb-8" dangerouslySetInnerHTML={{ __html: modulo.conteudo }} />
            )}
            
            {/* Slides do Módulo */}
            {modulo.slides.map((slide: any) => (
              <div key={slide.id} className="slide mb-8 p-6 bg-gray-50 rounded-lg">
                {slide.titulo && (
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{slide.titulo}</h3>
                )}
                
                {slide.imagem && (
                  <div className="mb-4">
                    <img src={slide.imagem} alt={slide.titulo || 'Slide'} className="max-w-full h-auto rounded-lg" />
                  </div>
                )}
                
                {slide.conteudo && (
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: slide.conteudo }} />
                )}
              </div>
            ))}
          </section>
        ))}
        
        {/* Glossário */}
        {glossario.length > 0 && (
          <section className="glossario page-break-before p-12">
            <h2 className="text-3xl font-bold text-primary mb-8">Glossário</h2>
            <dl className="space-y-4">
              {glossario.map((item: any, index: number) => (
                <div key={index}>
                  <dt className="font-bold text-lg text-gray-900">{item.termo}</dt>
                  <dd className="text-gray-700 ml-4">{item.definicao}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
        
        {/* FAQ */}
        {faq.length > 0 && (
          <section className="faq page-break-before p-12">
            <h2 className="text-3xl font-bold text-primary mb-8">FAQ - Perguntas Frequentes</h2>
            <div className="space-y-6">
              {faq.map((item: any, index: number) => (
                <div key={index}>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{item.pergunta}</h3>
                  <p className="text-gray-700">{item.resposta}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Checklist */}
        {checklist.length > 0 && (
          <section className="checklist page-break-before p-12">
            <h2 className="text-3xl font-bold text-primary mb-8">Checklist</h2>
            <ul className="space-y-3">
              {checklist.map((item: any, index: number) => (
                <li key={index} className="flex items-start space-x-3 text-lg">
                  <span className="w-6 h-6 border-2 border-primary rounded flex-shrink-0 mt-1"></span>
                  <span>
                    {item.item}
                    {item.obrigatorio && <span className="text-red-600 ml-1">*</span>}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-600 mt-6">* Item obrigatório</p>
          </section>
        )}
        
        {/* Páginas de Anotações */}
        {apostila?.paginas_anotacoes > 0 && Array.from({ length: apostila.paginas_anotacoes }).map((_, index) => (
          <section key={`anotacoes-${index}`} className="anotacoes page-break-before p-12">
            <h2 className="text-3xl font-bold text-primary mb-8">Anotações</h2>
            <div className="linhas"></div>
          </section>
        ))}
        
        {/* Rodapé de impressão */}
        <footer className="print hidden text-center text-sm text-gray-600">
          <p>DF Corretora - Nosso plano é cuidar bem</p>
        </footer>
      </article>
    </div>
  )
}

