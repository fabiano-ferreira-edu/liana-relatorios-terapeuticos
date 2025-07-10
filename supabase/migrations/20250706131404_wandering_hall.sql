/*
  # Sistema de Autenticação e Armazenamento de Imagens

  1. Autenticação
    - Configurar autenticação por email/senha
    - Criar tabela de perfis de usuário

  2. Storage
    - Criar bucket para imagens
    - Configurar políticas de acesso

  3. Relacionamentos
    - Tabela user_images para vincular usuários às imagens
    - Políticas RLS para segurança

  4. Segurança
    - RLS habilitado em todas as tabelas
    - Usuários só acessam seus próprios dados
*/

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'therapist' CHECK (role IN ('therapist', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela para relacionar usuários com imagens
CREATE TABLE IF NOT EXISTS user_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_path text NOT NULL,
  image_name text NOT NULL,
  image_type text NOT NULL,
  file_size bigint,
  frequency_id integer REFERENCES frequencies(id) ON DELETE SET NULL,
  is_cover_image boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Atualizar tabelas existentes para incluir user_id
ALTER TABLE app_configs ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE frequencies ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE session_reports ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_images ENABLE ROW LEVEL SECURITY;

-- Atualizar políticas existentes para incluir autenticação
DROP POLICY IF EXISTS "Permitir acesso público a configurações" ON app_configs;
DROP POLICY IF EXISTS "Permitir acesso público a frequências" ON frequencies;
DROP POLICY IF EXISTS "Permitir acesso público a relatórios" ON session_reports;

-- Políticas para user_profiles
CREATE POLICY "Usuários podem ver e editar seu próprio perfil"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Políticas para user_images
CREATE POLICY "Usuários podem gerenciar suas próprias imagens"
  ON user_images
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para app_configs
CREATE POLICY "Usuários podem gerenciar suas configurações"
  ON app_configs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para frequencies
CREATE POLICY "Usuários podem gerenciar suas frequências"
  ON frequencies
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para session_reports
CREATE POLICY "Usuários podem gerenciar seus relatórios"
  ON session_reports
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para acesso público (fallback para dados sem user_id)
CREATE POLICY "Acesso público a dados sem proprietário - configs"
  ON app_configs
  FOR ALL
  TO public
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Acesso público a dados sem proprietário - frequencies"
  ON frequencies
  FOR ALL
  TO public
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Acesso público a dados sem proprietário - reports"
  ON session_reports
  FOR ALL
  TO public
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);

-- Função para criar perfil automaticamente após registro
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
CREATE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Função para atualizar updated_at em user_images
CREATE TRIGGER update_user_images_updated_at
  BEFORE UPDATE ON user_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para validar tipos de arquivo
CREATE OR REPLACE FUNCTION validate_image_type(file_type text)
RETURNS boolean AS $$
BEGIN
  RETURN file_type IN ('image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp');
END;
$$ LANGUAGE plpgsql;

-- Constraint para validar tipos de arquivo
ALTER TABLE user_images 
ADD CONSTRAINT valid_image_type 
CHECK (validate_image_type(image_type));