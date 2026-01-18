# Correcciones de Configuración de Base de Datos

## Problemas Identificados y Solucionados

### 1. Incompatibilidad de Tipos entre Frontend y Backend

**Problema:** El frontend usa strings con acentos y espacios, mientras que el backend usa enums en mayúsculas.

**Solución:** Se crearon funciones de transformación en `backend/src/utils/transformers.ts` que convierten automáticamente entre los formatos.

#### Transformaciones Implementadas:

- **UserRole:**
  - Backend: `DOCTOR`, `NURSE`, `ADMIN`
  - Frontend: `Médico(a)`, `Enfermeiro(a)`, `Administrador`

- **PatientStatus:**
  - Backend: `ESTAVEL`, `CRITICO`, `EM_OBSERVACAO`, `ALTA`
  - Frontend: `Estável`, `Crítico`, `Em Observação`, `Alta`

- **AppointmentType:**
  - Backend: `CONSULTA`, `RETORNO`, `EXAME`, `EMERGENCIA`
  - Frontend: `Consulta`, `Retorno`, `Exame`, `Emergência`

- **AppointmentStatus:**
  - Backend: `AGENDADO`, `CONCLUIDO`, `CANCELADO`
  - Frontend: `Agendado`, `Concluído`, `Cancelado`

### 2. Campos Faltantes en el Schema

**Problema:** El frontend espera campos que no existen en el schema de Prisma:
- `Patient.lastVisit` - no existe en el schema
- `Appointment.time` - el schema solo tiene `date` (DateTime)

**Solución:**
- Se agregó función `getLastVisit()` que calcula la última visita basada en citas o registros médicos
- Se agregó función `formatDateTime()` que extrae `date` y `time` de un DateTime
- Los controladores transforman automáticamente las respuestas al formato esperado por el frontend

### 3. Validación de Schemas

**Problema:** Los schemas de Zod solo aceptaban formatos del backend.

**Solución:** Se actualizaron los schemas para aceptar ambos formatos (frontend y backend) y transformarlos automáticamente usando `.transform()` de Zod.

## Archivos Modificados

1. **backend/src/utils/transformers.ts** (NUEVO)
   - Funciones de transformación entre formatos
   - `formatDateTime()` para extraer date y time
   - `getLastVisit()` para calcular última visita

2. **backend/src/controllers/patientController.ts**
   - Transforma status al formato frontend en respuestas
   - Agrega campo `lastVisit` calculado
   - Acepta status en formato frontend en requests

3. **backend/src/controllers/appointmentController.ts**
   - Transforma type y status al formato frontend
   - Separa date y time en respuestas
   - Acepta date y time separados en requests
   - Maneja ambos formatos (datetime completo o date+time separados)

4. **backend/src/controllers/authController.ts**
   - Transforma role al formato frontend en respuestas

## Uso

Las transformaciones son automáticas. El backend:
- **Acepta** datos en formato frontend o backend
- **Devuelve** datos siempre en formato frontend

### Ejemplo de Request (Frontend → Backend):

```json
{
  "name": "João Silva",
  "status": "Estável",  // Se transforma automáticamente a "ESTAVEL"
  "age": 45
}
```

### Ejemplo de Response (Backend → Frontend):

```json
{
  "id": "123",
  "name": "João Silva",
  "status": "Estável",  // Siempre en formato frontend
  "lastVisit": "2024-05-20",  // Calculado automáticamente
  "age": 45
}
```

## Próximos Pasos

1. ✅ Transformaciones implementadas
2. ✅ Schemas actualizados
3. ✅ Controladores actualizados
4. ⏳ Probar con datos reales
5. ⏳ Actualizar componentes del frontend para usar API real

## Notas

- Los enums en Prisma se mantienen en mayúsculas (mejor práctica)
- Las transformaciones son bidireccionales cuando es necesario
- El campo `lastVisit` se calcula dinámicamente, no se almacena en la BD
- El campo `time` se extrae de `date` (DateTime), no se almacena por separado

