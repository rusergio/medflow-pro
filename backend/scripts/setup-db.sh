#!/bin/bash

# Script para configurar a base de dados MedFlow Pro
# Execute este script como usuário postgres ou com permissões adequadas

echo "🚀 Configurando base de dados MedFlow Pro..."

# Criar base de dados
psql -U postgres -c "CREATE DATABASE medflow_pro;" 2>/dev/null || echo "Base de dados já existe ou erro ao criar"

echo "✅ Base de dados criada!"

# Executar migrações do Prisma
echo "📦 Executando migrações do Prisma..."
cd "$(dirname "$0")/.."
npm run prisma:migrate

echo "✅ Configuração concluída!"
echo "💡 Agora você pode executar: npm run dev"

