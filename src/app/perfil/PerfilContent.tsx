'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { User, Mail, Shield, Upload, Loader2, CheckCircle } from 'lucide-react'

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
  
  return (
    <AppLayout user={profile}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Meu Perfil
          </h2>
          <p className="text-gray-600">
          Gerencie suas informações pessoais e foto de perfil
        </p>
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
          
          {/* Card de Informações */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <h3 className="text-lg font-bold text-gray-900">Informações Pessoais</h3>
            </CardHeader>
            <CardBody className="space-y-6">
              {/* Nome */}
              <div>
                <Input
                  label="Nome Completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>
              
              {/* Email (somente leitura) */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1.5">
                  <Mail className="w-4 h-4" />
                  <span>E-mail</span>
                </label>
                <div className="px-4 py-2.5 bg-gray-100 rounded-lg border border-border text-gray-600">
                  {profile.email}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  O e-mail não pode ser alterado
                </p>
              </div>
              
              {/* Perfil (somente leitura) */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1.5">
                  <Shield className="w-4 h-4" />
                  <span>Perfil de Acesso</span>
                </label>
                <div className="flex items-center space-x-2">
                  <span className={`inline-block px-3 py-1.5 text-sm font-medium rounded-lg ${
                    profile.role === 'admin' 
                      ? 'bg-orange/10 text-orange border border-orange/20' 
                      : profile.role === 'palestrante'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                    {roleLabels[profile.role as keyof typeof roleLabels]}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Entre em contato com um administrador para alterar seu perfil
                </p>
              </div>
              
              {/* Data de Cadastro */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-gray-600">
                  <strong>Membro desde:</strong>{' '}
                  {new Date(profile.created_at).toLocaleDateString('pt-BR', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              
              {/* Botões */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
                
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={saving || nome === profile.nome}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

