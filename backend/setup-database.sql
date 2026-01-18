-- Script de configuración de base de datos para MedFlow Pro
-- Ejecutar como usuario postgres en PostgreSQL

-- Crear la base de datos si no existe
CREATE DATABASE medflow_pro;

-- Conectar a la base de datos
\c medflow_pro;

-- Verificar que la base de datos se creó correctamente
SELECT current_database();

