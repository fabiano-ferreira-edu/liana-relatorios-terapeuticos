import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { AppConfig, Frequency, CoverSettings } from '../types'

export const useSupabase = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Testar conexão na inicialização
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase
          .from('app_configs')
          .select('id')
          .limit(1)
        
        if (error) {
          throw error
        }
        
        setIsConnected(true)
        setError(null)
      } catch (err) {
        console.error('Erro de conexão com Supabase:', err)
        setError('Erro ao conectar com o banco de dados')
        setIsConnected(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()
  }, [])

  // Carregar configurações
  const loadConfig = async (): Promise<AppConfig | null> => {
    try {
      // Carregar configuração da aplicação
      const { data: configData, error: configError } = await supabase
        .from('app_configs')
        .select('*')
        .limit(1)
        .single()

      if (configError) throw configError

      // Carregar frequências
      const { data: frequenciesData, error: frequenciesError } = await supabase
        .from('frequencies')
        .select('*')
        .order('id')

      if (frequenciesError) throw frequenciesError

      return {
        introductionText: configData.introduction_text,
        frequencies: frequenciesData.map(freq => ({
          id: freq.id,
          title: freq.title,
          description: freq.description,
          imageUrl: freq.image_url
        })),
        coverSettings: configData.cover_settings
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err)
      setError('Erro ao carregar configurações')
      return null
    }
  }

  // Salvar texto de introdução
  const saveIntroductionText = async (text: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('app_configs')
        .update({ introduction_text: text })
        .eq('id', (await supabase.from('app_configs').select('id').limit(1).single()).data?.id)

      if (error) throw error
      return true
    } catch (err) {
      console.error('Erro ao salvar texto de introdução:', err)
      setError('Erro ao salvar texto de introdução')
      return false
    }
  }

  // Atualizar frequência
  const updateFrequency = async (id: number, frequency: Partial<Frequency>): Promise<boolean> => {
    try {
      const updateData: any = {}
      if (frequency.title !== undefined) updateData.title = frequency.title
      if (frequency.description !== undefined) updateData.description = frequency.description
      if (frequency.imageUrl !== undefined) updateData.image_url = frequency.imageUrl

      const { error } = await supabase
        .from('frequencies')
        .update(updateData)
        .eq('id', id)

      if (error) throw error
      return true
    } catch (err) {
      console.error('Erro ao atualizar frequência:', err)
      setError('Erro ao atualizar frequência')
      return false
    }
  }

  // Salvar configurações da capa
  const saveCoverSettings = async (settings: CoverSettings): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('app_configs')
        .update({ cover_settings: settings })
        .eq('id', (await supabase.from('app_configs').select('id').limit(1).single()).data?.id)

      if (error) throw error
      return true
    } catch (err) {
      console.error('Erro ao salvar configurações da capa:', err)
      setError('Erro ao salvar configurações da capa')
      return false
    }
  }

  // Salvar relatório de sessão
  const saveSessionReport = async (sessionData: any): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('session_reports')
        .insert({
          therapist_name: sessionData.therapistName,
          client_name: sessionData.clientName,
          session_date: sessionData.sessionDate,
          session_time: sessionData.sessionTime,
          selected_frequencies: sessionData.selectedFrequencies
        })

      if (error) throw error
      return true
    } catch (err) {
      console.error('Erro ao salvar relatório de sessão:', err)
      setError('Erro ao salvar relatório de sessão')
      return false
    }
  }

  return {
    isConnected,
    isLoading,
    error,
    loadConfig,
    saveIntroductionText,
    updateFrequency,
    saveCoverSettings,
    saveSessionReport
  }
}