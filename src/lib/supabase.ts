import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não encontradas. Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas no arquivo .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Função para testar a conexão
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('_health')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('Teste de conexão realizado - Supabase conectado com sucesso!')
      return true
    }
    
    return true
  } catch (error) {
    console.error('Erro ao conectar com Supabase:', error)
    return false
  }
}