'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Download, Printer, ArrowLeft, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface CertificadoViewProps {
  certificado: any
  profile: any
}

export default function CertificadoView({ certificado, profile }: CertificadoViewProps) {
  const router = useRouter()
  const [baixando, setBaixando] = useState(false)
  
  const handleImprimir = () => {
    window.print()
  }

  const handleBaixarPdf = async () => {
    try {
      setBaixando(true)
      const res = await fetch(`/api/certificados/${certificado.treinamento_id}/pdf`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Falha ao gerar PDF')
      if (data.fallback) {
        window.open(`/certificados/${certificado.treinamento_id}`, '_blank')
        return
      }
      if (data.url) {
        // Força download no mesmo gesto do usuário
        const fileName = `certificado-${(certificado.treinamentos?.titulo || 'treinamento').toString().replace(/[^a-z0-9-_]+/gi, '_')}.pdf`
        const link = document.createElement('a')
        link.href = data.url
        link.setAttribute('download', fileName)
        link.rel = 'noopener'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (e) {
      console.error(e)
      alert('Não foi possível gerar o PDF agora. Tente novamente em instantes.')
    } finally {
      setBaixando(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra de Ações - NÃO IMPRIME */}
      <div className="no-print bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleBaixarPdf}
                disabled={baixando}
              >
                <Download className="w-4 h-4 mr-2" />
                {baixando ? 'Gerando...' : 'Baixar PDF'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleImprimir}
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir/PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Certificado */}
      <div className="certificado-container max-w-[1000px] mx-auto my-8">
        <div className="certificado bg-white shadow-2xl" style={{
          width: '297mm',
          minHeight: '210mm',
          padding: '40mm 30mm',
          position: 'relative',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fb 100%)'
        }}>
          {/* Borda Decorativa */}
          <div style={{
            position: 'absolute',
            top: '15mm',
            left: '15mm',
            right: '15mm',
            bottom: '15mm',
            border: '3px solid #014175',
            borderRadius: '8px'
          }}>
            <div style={{
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              right: '-2px',
              bottom: '-2px',
              border: '1px solid #FF6B00',
              borderRadius: '10px'
            }}></div>
          </div>
          
          {/* Conteúdo */}
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            {/* Logo */}
            <div className="mb-8">
              <img 
                src="/logo.png" 
                alt="DF Corretora" 
                style={{ 
                  width: '280px', 
                  height: 'auto',
                  margin: '0 auto'
                }}
              />
            </div>
            
            {/* Título */}
            <h1 style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#014175',
              marginBottom: '20px',
              textTransform: 'uppercase',
              letterSpacing: '3px'
            }}>
              Certificado
            </h1>
            
            <p style={{
              fontSize: '18px',
              color: '#666',
              marginBottom: '40px'
            }}>
              de Conclusão
            </p>
            
            {/* Texto Principal */}
            <p style={{
              fontSize: '16px',
              color: '#333',
              marginBottom: '30px',
              lineHeight: '1.8'
            }}>
              Certificamos que
            </p>
            
            <h2 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#014175',
              marginBottom: '30px',
              borderBottom: '2px solid #FF6B00',
              display: 'inline-block',
              paddingBottom: '10px'
            }}>
              {profile.nome}
            </h2>
            
            <p style={{
              fontSize: '16px',
              color: '#333',
              marginBottom: '15px',
              lineHeight: '1.8'
            }}>
              concluiu com sucesso o treinamento
            </p>
            
            <h3 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#014175',
              marginBottom: '40px',
              padding: '20px',
              background: 'rgba(1, 65, 117, 0.05)',
              borderRadius: '8px'
            }}>
              {certificado.treinamentos.titulo}
            </h3>
            
            {/* Informações */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '30px',
              marginBottom: '50px',
              textAlign: 'center'
            }}>
              <div>
                <p style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>
                  Data de Conclusão
                </p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                  {new Date(certificado.data_conclusao).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              
              <div>
                <p style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>
                  Nota Final
                </p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#FF6B00' }}>
                  {certificado.nota_final.toFixed(1)}%
                </p>
              </div>
            </div>
            
            {/* Código de Validação */}
            <div style={{
              background: '#f8f9fb',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '40px'
            }}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-primary" />
                <p style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase' }}>
                  Código de Validação
                </p>
              </div>
              <p style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: '#014175',
                fontFamily: 'monospace',
                letterSpacing: '2px'
              }}>
                {certificado.codigo_validacao}
              </p>
            </div>
            
            {/* Rodapé */}
            <p style={{
              fontSize: '12px',
              color: '#999',
              marginTop: '60px'
            }}>
              Emitido por DF Corretora em {new Date(certificado.data_emissao).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Estilos de Impressão */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .certificado-container {
            margin: 0 !important;
            max-width: none !important;
          }
          
          .certificado {
            box-shadow: none !important;
            margin: 0 !important;
            page-break-after: always;
          }
          
          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
      `}</style>
    </div>
  )
}

