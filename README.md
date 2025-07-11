# Plataforma de Relatórios Terapêuticos

Uma aplicação web para criação e personalização de relatórios terapêuticos em PDF, integrada com Supabase para persistência de dados.

## 🚀 Funcionalidades

- **Geração de Relatórios**: Crie relatórios personalizados em PDF
- **Área Administrativa**: Configure textos, frequências e design da capa
- **Integração Supabase**: Dados persistidos na nuvem com fallback local
- **Design Responsivo**: Interface moderna e intuitiva
- **Personalização de Capa**: Designer visual para capas profissionais

## 🛠️ Configuração do Supabase

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Preencha os dados do projeto:
   - Nome: `relatorios-terapeuticos`
   - Organização: Sua organização
   - Região: Escolha a mais próxima
   - Senha do banco: Crie uma senha segura

### 2. Configurar Variáveis de Ambiente

1. No dashboard do Supabase, vá para **Settings > API**
2. Copie a **Project URL** e **anon public key**
3. Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_project_url_aqui
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

### 3. Executar Migrações

As migrações serão executadas automaticamente quando você acessar a aplicação pela primeira vez. O sistema criará:

- Tabela `app_configs`: Configurações da aplicação
- Tabela `frequencies`: Dados das 28 frequências
- Tabela `session_reports`: Histórico de relatórios gerados

### 4. Verificar Conexão 

1. Inicie a aplicação: `npm run dev`
2. Verifique o status de conexão no canto superior direito
3. Se aparecer "Conectado ao Supabase", a integração foi bem-sucedida

## 📦 Instalação e Execução

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais do Supabase

# Executar em modo de desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🔧 Estrutura do Banco de Dados

### app_configs
- `id`: UUID (chave primária)
- `introduction_text`: Texto de introdução padrão
- `cover_settings`: Configurações da capa (JSON)
- `created_at`, `updated_at`: Timestamps

### frequencies
- `id`: Integer (1-28)
- `title`: Título da frequência
- `description`: Descrição detalhada
- `image_url`: URL da imagem (opcional)
- `created_at`, `updated_at`: Timestamps

### session_reports
- `id`: UUID (chave primária)
- `therapist_name`: Nome do terapeuta
- `client_name`: Nome do cliente
- `session_date`: Data da sessão
- `session_time`: Horário da sessão (opcional)
- `selected_frequencies`: Array de IDs das frequências
- `created_at`: Timestamp

## 🔒 Segurança

- **RLS (Row Level Security)** habilitado em todas as tabelas
- Políticas configuradas para acesso público (adequado para uso single-user)
- Fallback para localStorage em caso de falha de conexão

## 🎨 Personalização

- **Capa**: Designer visual com imagens pré-definidas ou upload personalizado
- **Frequências**: Edição completa de títulos, descrições e imagens
- **Introdução**: Texto personalizável com variável `[NOME_CLIENTE]`

## 📱 Status de Conexão

A aplicação exibe o status da conexão com Supabase:
- 🟢 **Conectado ao Supabase**: Dados sincronizados na nuvem
- 🟡 **Modo offline**: Usando dados locais (localStorage)
- 🔴 **Erro de conexão**: Problema de conectividade

## 🚨 Solução de Problemas

### Erro de Conexão
1. Verifique se as variáveis de ambiente estão corretas
2. Confirme se o projeto Supabase está ativo
3. Verifique a conectividade com a internet

### Dados não Salvos
1. Verifique o status de conexão
2. Em modo offline, os dados são salvos localmente
3. Ao reconectar, sincronize manualmente se necessário

### Quota Excedida (localStorage)
- A aplicação agora filtra automaticamente imagens grandes
- Use o Supabase para armazenamento ilimitado

## 📄 Licença

Este projeto é de uso interno para terapeutas e profissionais da área holística.