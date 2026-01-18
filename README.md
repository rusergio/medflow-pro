<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# MedFlow Pro - Sistema de Gestão Hospitalar

Sistema completo de gestão hospitalar com assistente de IA integrado.

## Requisitos

- Node.js 18+ 
- PostgreSQL (para backend)
- API Key de IA (Google GenAI)

## Instalação

### Frontend

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure as variáveis de ambiente:
   Crie um arquivo `.env.local` na raiz do projeto:
   ```
   AI_API_KEY=sua_chave_api_aqui
   ```

3. Execute o frontend:
   ```bash
   npm run dev
   ```

### Backend

1. Entre na pasta do backend:
   ```bash
   cd backend
   npm install
   ```

2. Configure o banco de dados no arquivo `.env`:
   ```
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/medflow_pro"
   JWT_SECRET="seu_jwt_secret_aqui"
   AI_API_KEY="sua_chave_api_aqui"
   ```

3. Execute as migrações:
   ```bash
   npx prisma migrate dev
   ```

4. Execute o servidor:
   ```bash
   npm run dev
   ```

## Tecnologias

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript, Prisma
- **Database:** PostgreSQL
- **IA:** Google GenAI
