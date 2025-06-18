import React, { useState, useEffect } from 'react'
import { Card, Button, Input, Avatar } from '@/components/shared/ui'
import { FormField } from '@/components/shared/forms'
import { useAuth } from '@/hooks/auth'
import { useToast } from '@/hooks/shared'
import { supabase } from '@/config/supabase'
import { authValidations } from '@/utils/validations'
import { 
  User, 
  Mail, 
  Save, 
  Upload, 
  Camera,
  Key,
  Shield
} from 'lucide-react'

/**
 * Página de configurações do perfil do usuário
 */
export const ProfilePage = () => {
  const { user, updateProfile } = useAuth()
  const { showToast } = useToast()
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    avatar_url: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Carrega dados do usuário
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        avatar_url: user.avatar_url || ''
      })
    }
  }, [user])

  // Valida formulário
  const validateForm = () => {
    const validation = authValidations.validateProfileUpdate(formData)
    setErrors(validation.errors)
    return validation.isValid
  }

  // Handle mudanças nos campos
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Remove erro do campo quando usuário corrige
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  // Upload de avatar
  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validações
    if (file.size > 2 * 1024 * 1024) { // 2MB
      showToast('Imagem deve ter no máximo 2MB', 'error')
      return
    }

    if (!file.type.startsWith('image/')) {
      showToast('Arquivo deve ser uma imagem', 'error')
      return
    }

    setIsUploadingAvatar(true)
    
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload para Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Gera URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      handleChange('avatar_url', publicUrl)
      showToast('Avatar atualizado com sucesso!', 'success')
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error)
      showToast('Erro ao fazer upload da imagem', 'error')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Salva perfil
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      await updateProfile(formData)
      showToast('Perfil atualizado com sucesso!', 'success')
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      showToast('Erro ao atualizar perfil', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasChanges = JSON.stringify(formData) !== JSON.stringify({
    full_name: user?.full_name || '',
    email: user?.email || '',
    avatar_url: user?.avatar_url || ''
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <User className="h-6 w-6 text-gray-600" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Perfil Pessoal
          </h2>
          <p className="text-sm text-gray-500">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Foto do Perfil
          </h3>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar
                src={formData.avatar_url}
                name={formData.full_name}
                size="lg"
                className="h-20 w-20"
              />
              
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Escolha uma foto de perfil. Recomendamos imagens quadradas de pelo menos 200x200px.
              </p>
              
              <div className="flex gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploadingAvatar}
                    className="pointer-events-none"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploadingAvatar ? 'Enviando...' : 'Alterar Foto'}
                  </Button>
                </label>
                
                {formData.avatar_url && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleChange('avatar_url', '')}
                  >
                    Remover
                  </Button>
                )}
              </div>
              
              <p className="text-xs text-gray-500">
                PNG, JPG ou GIF até 2MB
              </p>
            </div>
          </div>
        </Card>

        {/* Informações Pessoais */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Informações Pessoais
          </h3>
          
          <div className="space-y-4">
            <FormField
              label="Nome Completo"
              error={errors.full_name}
              required
            >
              <Input
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="Seu nome completo"
                maxLength={100}
              />
            </FormField>

            <FormField
              label="Email"
              error={errors.email}
              helpText="Usado para login e notificações"
            >
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="seu@email.com"
                disabled // Email não pode ser alterado por enquanto
              />
              <p className="text-xs text-gray-500 mt-1">
                Para alterar o email, entre em contato com o suporte
              </p>
            </FormField>
          </div>
        </Card>

        {/* Segurança */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Segurança
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Senha</p>
                  <p className="text-sm text-gray-500">
                    Última alteração há mais de 30 dias
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Alterar Senha
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Autenticação de Dois Fatores</p>
                  <p className="text-sm text-gray-500">
                    Adicione uma camada extra de segurança
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Configurar 2FA
              </Button>
            </div>

            <p className="text-xs text-gray-500">
              Recursos de segurança avançados estarão disponíveis em breve
            </p>
          </div>
        </Card>

        {/* Ações */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-gray-500">
            Suas informações são mantidas privadas e seguras
          </p>
          
          <Button
            type="submit"
            disabled={!hasChanges || isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  )
}