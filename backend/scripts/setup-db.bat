@echo off
REM Script para configurar a base de dados MedFlow Pro no Windows
REM Execute este script como administrador ou com permissões adequadas

echo 🚀 Configurando base de dados MedFlow Pro...

REM Criar base de dados
psql -U postgres -c "CREATE DATABASE medflow_pro;" 2>nul || echo Base de dados já existe ou erro ao criar

echo ✅ Base de dados criada!

REM Executar migrações do Prisma
echo 📦 Executando migrações do Prisma...
cd /d "%~dp0.."
call npm run prisma:migrate

echo ✅ Configuração concluída!
echo 💡 Agora você pode executar: npm run dev

pause

