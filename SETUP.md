# Guia de Configuração - MedFlow Pro

## Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL instalado e rodando
- npm ou yarn

## Passo a Passo

### 1. Configurar Banco de Dados PostgreSQL

**Credenciais:**
- Usuário: `postgres`
- Senha: `2025`
- Host: `localhost`
- Porta: `5432` (padrão)

1. **Opção A - Via línea de comando (psql):**
```bash
# Conectar ao PostgreSQL
psql -U postgres

# Dentro do psql, executar:
CREATE DATABASE medflow_pro;
\q
```

2. **Opção B - Via pgAdmin:**
   - Abra o pgAdmin
   - Conecte ao servidor PostgreSQL (usuário: postgres, senha: 2025)
   - Clique direito em "Databases" → "Create" → "Database"
   - Nome: `medflow_pro`
   - Clique em "Save"

3. **Opção C - Executar script SQL:**
```bash
psql -U postgres -f backend/setup-database.sql
```

### 2. Configurar Backend

1. Entre na pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Crie o arquivo `.env` (copie do `env.example`):
```bash
# Windows
copy env.example .env

# Linux/Mac
cp env.example .env
```

4. Edite o arquivo `.env` e configure (já está pre-configurado com as credenciais):
```env
DATABASE_URL="postgresql://postgres:2025@localhost:5432/medflow_pro?schema=public"
JWT_SECRET="gere_um_secret_aleatorio_aqui_mude_em_producao"
AI_API_KEY="sua_chave_api_ai"
```

**Importante:** Gere um JWT_SECRET seguro para produção. Você pode usar:
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Ou online: https://randomkeygen.com/
```

5. Gere o Prisma Client:
```bash
npm run prisma:generate
```

6. Execute as migrações:
```bash
npm run prisma:migrate
```

7. (Opcional) Abra o Prisma Studio para visualizar dados:
```bash
npm run prisma:studio
```

8. Inicie o servidor backend:
```bash
npm run dev
```

O backend estará rodando em `http://localhost:5000`

### 3. Configurar Frontend

1. Volte para a raiz do projeto:
```bash
cd ..
```

2. Instale as dependências (se ainda não fez):
```bash
npm install
```

3. Crie o arquivo `.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
AI_API_KEY=sua_chave_api_ai
```

4. Inicie o frontend:
```bash
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

### 4. Criar Primeiro Usuário

Você pode criar um usuário de duas formas:

#### Opção 1: Via API (usando curl ou Postman)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Admin",
    "email": "admin@medflow.com",
    "password": "senha123",
    "role": "ADMIN"
  }'
```

#### Opção 2: Via Prisma Studio
1. Execute `npm run prisma:studio` no backend
2. Vá para a tabela `users`
3. Clique em "Add record"
4. Preencha os campos (a senha deve ser hash - use bcrypt online ou crie via API)

### 5. Estrutura de Pastas

```
medflow-pro/
├── backend/
│   ├── src/
│   │   ├── config/        # Configurações (DB, env)
│   │   ├── controllers/   # Lógica de negócio
│   │   ├── middleware/    # Auth, error handling
│   │   ├── routes/        # Rotas da API
│   │   ├── services/      # Serviços (AI, etc)
│   │   ├── utils/         # Utilitários
│   │   └── index.ts       # Entry point
│   ├── prisma/
│   │   └── schema.prisma  # Schema do banco
│   └── package.json
├── components/            # Componentes React
├── services/             # Serviços do frontend
└── package.json
```

## Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/me` - Perfil do usuário

### Pacientes
- `GET /api/patients` - Listar pacientes
- `GET /api/patients/:id` - Detalhes do paciente
- `POST /api/patients` - Criar paciente
- `PUT /api/patients/:id` - Atualizar paciente
- `DELETE /api/patients/:id` - Deletar paciente

### Agendamentos
- `GET /api/appointments` - Listar agendamentos
- `GET /api/appointments/:id` - Detalhes do agendamento
- `POST /api/appointments` - Criar agendamento
- `PUT /api/appointments/:id` - Atualizar agendamento
- `DELETE /api/appointments/:id` - Deletar agendamento

### Dashboard
- `GET /api/dashboard/stats` - Estatísticas do dashboard

### IA
- `POST /api/ai/chat` - Chat com assistente IA

## Troubleshooting

### Erro de conexão com banco
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no `.env`
- Teste a conexão: `psql -U seu_usuario -d medflow_pro`

### Erro de migração
- Delete a pasta `node_modules` e reinstale
- Execute `npx prisma migrate reset` (cuidado: apaga dados)

### CORS Error
- Verifique se o backend está rodando na porta 5000
- Confirme o `VITE_API_URL` no frontend

## Próximos Passos

1. Atualizar componentes do frontend para usar a API real
2. Adicionar tratamento de erros no frontend
3. Implementar loading states
4. Adicionar validação de formulários
5. Implementar notificações/toasts

