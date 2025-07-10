/*
  # Esquema inicial para Relatórios Terapêuticos

  1. Novas Tabelas
    - `app_configs`
      - `id` (uuid, chave primária)
      - `introduction_text` (text)
      - `cover_settings` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `frequencies`
      - `id` (integer, chave primária)
      - `title` (text)
      - `description` (text)
      - `image_url` (text, opcional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `session_reports`
      - `id` (uuid, chave primária)
      - `therapist_name` (text)
      - `client_name` (text)
      - `session_date` (date)
      - `session_time` (time, opcional)
      - `selected_frequencies` (integer array)
      - `created_at` (timestamp)

  2. Segurança
    - Habilitar RLS em todas as tabelas
    - Adicionar políticas para usuários autenticados
*/

-- Criar tabela de configurações da aplicação
CREATE TABLE IF NOT EXISTS app_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  introduction_text text NOT NULL DEFAULT '',
  cover_settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de frequências
CREATE TABLE IF NOT EXISTS frequencies (
  id integer PRIMARY KEY,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de relatórios de sessão
CREATE TABLE IF NOT EXISTS session_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_name text NOT NULL,
  client_name text NOT NULL,
  session_date date NOT NULL,
  session_time time,
  selected_frequencies integer[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE app_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE frequencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_reports ENABLE ROW LEVEL SECURITY;

-- Políticas para app_configs (permitir acesso público para leitura e escrita)
CREATE POLICY "Permitir acesso público a configurações"
  ON app_configs
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Políticas para frequencies (permitir acesso público para leitura e escrita)
CREATE POLICY "Permitir acesso público a frequências"
  ON frequencies
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Políticas para session_reports (permitir acesso público para leitura e escrita)
CREATE POLICY "Permitir acesso público a relatórios"
  ON session_reports
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Inserir configuração padrão
INSERT INTO app_configs (introduction_text, cover_settings) 
VALUES (
  'Caro(a) [NOME_CLIENTE],

Este relatório apresenta as frequências terapêuticas utilizadas em sua sessão. Cada frequência foi selecionada especificamente para suas necessidades terapêuticas atuais.

As frequências são ferramentas importantes no processo de harmonização e equilíbrio energético, contribuindo para seu bem-estar geral.',
  '{"backgroundImage": "https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=800", "backgroundType": "mandala"}'
) ON CONFLICT DO NOTHING;

-- Inserir frequências padrão (1 a 28)
INSERT INTO frequencies (id, title, description) 
SELECT 
  generate_series(1, 28) as id,
  'Frequência ' || generate_series(1, 28) as title,
  'Descrição da frequência ' || generate_series(1, 28) || '. Configure este texto na área administrativa.' as description
ON CONFLICT (id) DO NOTHING;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_app_configs_updated_at 
  BEFORE UPDATE ON app_configs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_frequencies_updated_at 
  BEFORE UPDATE ON frequencies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();