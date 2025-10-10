'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { User, Mail, Shield, Upload, Loader2, CheckCircle } from 'lucide-react'
import { Award, KeyRound, ExternalLink } from 'lucide-react'

interface PerfilContentProps {
  profile: any
}

export function PerfilContent({ profile: initialProfile }: PerfilContentProps) {
  const router = useRouter()
  const toast = useToast()
  const [profile, setProfile] = useState(initialProfile)
  const [nome, setNome] = useState(profile.nome)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [saving, setSaving] = useState(false)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [trocandoSenha, setTrocandoSenha] = useState(false)
  const [certificados, setCertificados] = useState<any[] | null>(null)
  const [loadingCerts, setLoadingCerts] = useState(true)
  
  const roleLabels = {
    admin: 'Administrador',
    palestrante: 'Palestrante',
    aluno: 'Aluno'
  }
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo inválido', 'Por favor, selecione uma imagem (JPG, PNG, GIF)')
      return
    }
    
    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Arquivo muito grande', 'A imagem deve ter no máximo 2MB')
      return
    }
    
    setUploadingAvatar(true)
    
    try {
      const supabase = createClient()
      
      // Nome único para o arquivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`
      
      // Upload para o bucket 'avatares'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatares')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })
      
      if (uploadError) {
        console.error('Erro detalhado do upload:', uploadError)
        
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error('Bucket "avatares" não encontrado. Verifique se:\n1. O bucket foi criado no Supabase\n2. O nome está exatamente como "avatares" (minúsculas)\n3. O bucket está marcado como PÚBLICO')
        }
        
        throw uploadError
      }
      
      // Pegar URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatares')
        .getPublicUrl(fileName)
      
      // Atualizar perfil com nova URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)
      
      if (updateError) throw updateError
      
      // Atualizar estado local
      setProfile({ ...profile, avatar_url: publicUrl })
      toast.success('Foto atualizada!', 'Seu avatar foi alterado com sucesso')
      
      // Recarregar após 1 segundo
      setTimeout(() => {
        router.refresh()
      }, 1000)
      
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error)
      
      if (error.message.includes('Bucket not found')) {
        toast.error('Bucket não configurado', 'Execute storage-policies.sql no Supabase')
      } else {
        toast.error('Erro ao fazer upload', error.message)
      }
    } finally {
      setUploadingAvatar(false)
    }
  }
  
  const handleSave = async () => {
    if (!nome.trim()) {
      toast.warning('Nome vazio', 'Por favor, preencha seu nome')
      return
    }
    
    setSaving(true)
    
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('profiles')
        .update({ nome: nome.trim() })
        .eq('id', profile.id)
      
      if (error) throw error
      
      toast.success('Perfil atualizado!', 'Suas informações foram salvas')
      setProfile({ ...profile, nome: nome.trim() })
      
      setTimeout(() => {
        router.refresh()
      }, 1000)
      
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar', error.message)
    } finally {
      setSaving(false)
    }
  }

  // Carregar certificados do usuário
  const handleLoadCertificados = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('certificados')
        .select(`id, codigo_validacao, data_emissao, treinamento_id, treinamentos:treinamentos(titulo)`)  
        .order('data_emissao', { ascending: false })
      setCertificados(data || [])
    } catch (e) {
      setCertificados([])
    } finally { setLoadingCerts(false) }
  }

  useEffect(() => {
    handleLoadCertificados()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Trocar senha
  const handleTrocarSenha = async () => {
    if (!novaSenha || novaSenha.length < 6) {
      toast.warning('Senha fraca', 'A nova senha deve ter ao menos 6 caracteres')
      return
    }
    if (novaSenha !== confirmarSenha) {
      toast.error('Senhas diferentes', 'Confirme a nova senha corretamente')
      return
    }
    setTrocandoSenha(true)
    try {
      const supabase = createClient()
      // Se quiser validar a senha atual, seria necessário um fluxo de reautenticação (não suportado diretamente).
      const { error } = await supabase.auth.updateUser({ password: novaSenha })
      if (error) throw error
      toast.success('Senha alterada!', 'Use a nova senha no próximo login')
      setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('')
    } catch (e: any) {
      toast.error('Erro ao alterar senha', e.message || 'Tente novamente')
    } finally {
      setTrocandoSenha(false)
    }
  }
 
  return (
    <AppLayout user={profile}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h2>
          <p className="text-gray-600">Gerencie suas informações, segurança e certificados</p>
        </div>
       
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card do Avatar */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-bold text-gray-900">Foto de Perfil</h3>
            </CardHeader>
            <CardBody className="flex flex-col items-center space-y-4">
              {/* Avatar Atual */}
              <div className="relative">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.nome}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                  />
                ) : (
                  <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center border-4 border-primary">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
                
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              
              {/* Botão Upload */}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
                <div className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg 
                  font-medium transition-colors
                  ${uploadingAvatar 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-primary text-white hover:bg-primary-dark cursor-pointer'
                  }
                `}>
                  {uploadingAvatar ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{uploadingAvatar ? 'Enviando...' : 'Alterar Foto'}</span>
                </div>
              </label>
              
              <p className="text-xs text-gray-500 text-center">
                JPG, PNG ou GIF. Máx 2MB.
              </p>
            </CardBody>
          </Card>
          
          {/* Card de Informações & Segurança */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <h3 className="text-lg font-bold text-gray-900">Informações e Segurança</h3>
            </CardHeader>
            <CardBody className="space-y-8">
              {/* Seção: Dados Pessoais */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Dados Pessoais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      label="Nome Completo"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1.5">
                      <Mail className="w-4 h-4" />
                      <span>E-mail</span>
                    </label>
                    <div className="px-4 py-2.5 bg-gray-100 rounded-lg border border-border text-gray-600">
                      {profile.email}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">O e-mail não pode ser alterado</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    <span className="inline-flex items-center gap-2"><Shield className="w-3 h-3" /> Perfil: <strong className="ml-1">{roleLabels[profile.role as keyof typeof roleLabels]}</strong></span>
                  </div>
                  <Button variant="primary" onClick={handleSave} disabled={saving || nome === profile.nome}>
                    {saving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>) : (<><CheckCircle className="w-4 h-4 mr-2" /> Salvar</>)}
                  </Button>
                </div>
              </div>
              {/* Seção: Alterar Senha */}
              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><KeyRound className="w-4 h-4" /> Alterar Senha</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input type="password" label="Nova Senha" placeholder="Mínimo 6 caracteres" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
                  <Input type="password" label="Confirmar Nova Senha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} />
                </div>
                <div className="flex justify-end mt-3">
                  <Button onClick={handleTrocarSenha} disabled={trocandoSenha}>
                    {trocandoSenha ? 'Trocando...' : 'Atualizar Senha'}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Por segurança, você pode precisar entrar novamente após a troca.</p>
              </div>
            </CardBody>
          </Card>
          {/* Card de Certificados */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Award className="w-4 h-4" /> Meus Certificados</h3>
                <div className="text-sm text-gray-600">{(certificados?.length || 0)} emitidos</div>
              </div>
            </CardHeader>
            <CardBody>
              {loadingCerts ? (
                <div className="space-y-3">
                  <div className="h-10 bg-gray-100 rounded animate-pulse" />
                  <div className="h-10 bg-gray-100 rounded animate-pulse" />
                  <div className="h-10 bg-gray-100 rounded animate-pulse" />
                </div>
              ) : certificados.length === 0 ? (
                <div className="text-center py-10">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">Nenhum certificado emitido ainda</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {certificados.map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-3">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{c.treinamentos?.titulo || 'Treinamento'}</p>
                        <p className="text-xs text-gray-600 truncate">Código: {c.codigo_validacao} · Emitido em {new Date(c.data_emissao).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => window.open(`/certificados/${c.treinamento_id}`, '_blank')}>
                        <ExternalLink className="w-4 h-4 mr-1" /> Ver certificado
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

