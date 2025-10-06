export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'palestrante' | 'aluno'
          nome: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'admin' | 'palestrante' | 'aluno'
          nome: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'palestrante' | 'aluno'
          nome?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      treinamentos: {
        Row: {
          id: string
          titulo: string
          descricao: string | null
          categoria: string | null
          duracao: string | null
          imagem: string | null
          tipo_conteudo: 'slides' | 'video' | 'texto' | 'misto'
          ativo: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          descricao?: string | null
          categoria?: string | null
          duracao?: string | null
          imagem?: string | null
          tipo_conteudo?: 'slides' | 'video' | 'texto' | 'misto'
          ativo?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          descricao?: string | null
          categoria?: string | null
          duracao?: string | null
          imagem?: string | null
          ativo?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      modulos: {
        Row: {
          id: string
          treinamento_id: string
          titulo: string
          descricao: string | null
          conteudo: string | null
          ordem: number
          duracao: string | null
          video_url: string | null
          video_duracao: number | null
          video_plataforma: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          treinamento_id: string
          titulo: string
          descricao?: string | null
          conteudo?: string | null
          ordem: number
          duracao?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          treinamento_id?: string
          titulo?: string
          descricao?: string | null
          conteudo?: string | null
          ordem?: number
          duracao?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      slides: {
        Row: {
          id: string
          modulo_id: string
          titulo: string | null
          conteudo: string | null
          imagem: string | null
          video_url: string | null
          tipo: 'texto' | 'imagem' | 'video' | 'markdown' | null
          ordem: number
          created_at: string
        }
        Insert: {
          id?: string
          modulo_id: string
          titulo?: string | null
          conteudo?: string | null
          imagem?: string | null
          video_url?: string | null
          ordem: number
          created_at?: string
        }
        Update: {
          id?: string
          modulo_id?: string
          titulo?: string | null
          conteudo?: string | null
          imagem?: string | null
          video_url?: string | null
          ordem?: number
          created_at?: string
        }
      }
      testes: {
        Row: {
          id: string
          modulo_id: string
          titulo: string
          descricao: string | null
          tempo_limite: number | null
          nota_minima: number
          created_at: string
        }
        Insert: {
          id?: string
          modulo_id: string
          titulo: string
          descricao?: string | null
          tempo_limite?: number | null
          nota_minima?: number
          created_at?: string
        }
        Update: {
          id?: string
          modulo_id?: string
          titulo?: string
          descricao?: string | null
          tempo_limite?: number | null
          nota_minima?: number
          created_at?: string
        }
      }
      questoes: {
        Row: {
          id: string
          teste_id: string
          enunciado: string
          tipo: 'multipla' | 'vf' | 'dissertativa'
          alternativas: Json | null
          resposta_correta: string | null
          ordem: number
          pontos: number
          created_at: string
        }
        Insert: {
          id?: string
          teste_id: string
          enunciado: string
          tipo: 'multipla' | 'vf' | 'dissertativa'
          alternativas?: Json | null
          resposta_correta?: string | null
          ordem: number
          pontos?: number
          created_at?: string
        }
        Update: {
          id?: string
          teste_id?: string
          enunciado?: string
          tipo?: 'multipla' | 'vf' | 'dissertativa'
          alternativas?: Json | null
          resposta_correta?: string | null
          ordem?: number
          pontos?: number
          created_at?: string
        }
      }
      respostas: {
        Row: {
          id: string
          user_id: string
          questao_id: string
          resposta: string
          correta: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          questao_id: string
          resposta: string
          correta?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          questao_id?: string
          resposta?: string
          correta?: boolean | null
          created_at?: string
        }
      }
      resultados: {
        Row: {
          id: string
          user_id: string
          teste_id: string
          pontuacao: number
          total_questoes: number
          acertos: number
          aprovado: boolean
          tempo_gasto: number | null
          data: string
        }
        Insert: {
          id?: string
          user_id: string
          teste_id: string
          pontuacao: number
          total_questoes: number
          acertos: number
          aprovado: boolean
          tempo_gasto?: number | null
          data?: string
        }
        Update: {
          id?: string
          user_id?: string
          teste_id?: string
          pontuacao?: number
          total_questoes?: number
          acertos?: number
          aprovado?: boolean
          tempo_gasto?: number | null
          data?: string
        }
      }
      progresso_treinamento: {
        Row: {
          id: string
          user_id: string
          treinamento_id: string
          modulo_id: string
          concluido: boolean
          data_inicio: string
          data_conclusao: string | null
        }
        Insert: {
          id?: string
          user_id: string
          treinamento_id: string
          modulo_id: string
          concluido?: boolean
          data_inicio?: string
          data_conclusao?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          treinamento_id?: string
          modulo_id?: string
          concluido?: boolean
          data_inicio?: string
          data_conclusao?: string | null
        }
      }
      apostilas: {
        Row: {
          id: string
          treinamento_id: string
          versao: number
          capa: Json | null
          apresentacao: string | null
          glossario: Json | null
          checklist: Json | null
          faq: Json | null
          paginas_anotacoes: number
          watermark: string | null
          ativo: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          treinamento_id: string
          versao?: number
          capa?: Json | null
          apresentacao?: string | null
          glossario?: Json | null
          checklist?: Json | null
          faq?: Json | null
          paginas_anotacoes?: number
          watermark?: string | null
          ativo?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          treinamento_id?: string
          versao?: number
          capa?: Json | null
          apresentacao?: string | null
          glossario?: Json | null
          checklist?: Json | null
          faq?: Json | null
          paginas_anotacoes?: number
          watermark?: string | null
          ativo?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      apostilas_arquivos: {
        Row: {
          id: string
          apostila_id: string
          versao: number
          arquivo_url: string
          tamanho_bytes: number | null
          hash: string | null
          created_at: string
        }
        Insert: {
          id?: string
          apostila_id: string
          versao: number
          arquivo_url: string
          tamanho_bytes?: number | null
          hash?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          apostila_id?: string
          versao?: number
          arquivo_url?: string
          tamanho_bytes?: number | null
          hash?: string | null
          created_at?: string
        }
      }
    }
  }
}

