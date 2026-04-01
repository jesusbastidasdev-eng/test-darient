# Darient - Fullstack Reservas + IoT

Proyecto fullstack en TypeScript para gestionar reservas de espacios de coworking, con backend en Node.js/Fastify + Prisma/PostgreSQL, frontend en React, y bonus IoT con consumo MQTT y dashboard en tiempo real.

## Arquitectura

- `backend`: API REST, reglas de negocio, autenticacion por API key, pruebas, ingestion IoT y stream en tiempo real.
- `frontend`: app React para listar espacios, listar/paginar reservas, crear/eliminar reservas y dashboard admin IoT.
- `infra`: `docker-compose.yml` para levantar PostgreSQL, MQTT broker, backend y frontend.

## Requisitos

- Node.js 20+
- npm 10+
- Docker + Docker Compose (opcional, recomendado)

## Variables de entorno

### Backend (`backend/.env`)

Basado en `backend/.env.example`:

```
NODE_ENV=development
PORT=3001
API_KEY=dev-api-key
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/darient
MQTT_URL=mqtt://localhost:1883
MQTT_TOPIC="telemetry/#"
```

### Frontend (`frontend/.env`)

Basado en `frontend/.env.example`:

```
VITE_API_BASE_URL=http://localhost:3001
VITE_API_KEY=dev-api-key
```

## Ejecucion local (sin Docker)

1. Instalar dependencias:
   - `cd backend && npm install`
   - `cd ../frontend && npm install`
2. Configurar entornos:
   - Copiar `backend/.env.example` a `backend/.env`
   - Copiar `frontend/.env.example` a `frontend/.env`
3. Generar cliente Prisma y migrar base:
   - `cd backend`
   - `npm run prisma:generate`
   - `npm run prisma:migrate`
4. Levantar backend:
   - `npm run dev`
5. Levantar frontend en otra terminal:
   - `cd frontend`
   - `npm run dev`

## Ejecucion con Docker (bonus)

Desde la raiz:

1. `cd infra`
2. `docker compose up --build`

Servicios:

- Frontend: `http://localhost:4173`
- Backend: `http://localhost:3001`
- PostgreSQL: `localhost:5432`
- MQTT broker: `localhost:1883`

## Endpoints principales

Todos requieren `x-api-key: <API_KEY>` (el stream SSE acepta tambien `?apiKey=<API_KEY>`).

- Lugares:
  - `GET /lugares`
  - `GET /lugares/:id`
  - `POST /lugares`
- Espacios:
  - `GET /espacios`
  - `GET /espacios/:id`
  - `POST /espacios`
  - `PUT /espacios/:id`
  - `DELETE /espacios/:id`
- Reservas:
  - `GET /reservas?page=1&pageSize=10`
  - `GET /reservas/:id`
  - `POST /reservas`
  - `PUT /reservas/:id`
  - `DELETE /reservas/:id`
- Admin IoT:
  - `GET /admin/telemetria`
  - `GET /admin/telemetria/stream`

## Reglas de negocio implementadas

- No permite solapamiento de reservas en el mismo espacio y fecha.
- Limite de maximo 3 reservas por cliente por semana.
- Validaciones de payload y manejo consistente de errores HTTP.

## IoT Bonus

- El backend se suscribe a `MQTT_TOPIC` y procesa telemetria (`office/site`, ocupacion, CO2, humedad, temperatura, bateria).
- En archivos `.env`, el valor con wildcard debe ir entre comillas: `MQTT_TOPIC="telemetry/#"`.
- Se persiste historico (`TelemetrySample`) y ultimo estado por espacio (`SpaceLiveState`).
- Se emiten actualizaciones en vivo por SSE hacia el dashboard admin de frontend.

## Tests

Backend:

- Unitario: `src/services/__tests__/reservationRules.test.ts`
- Integracion (API + auth + flujo de reserva): `src/routes/__tests__/reservations.integration.test.ts`

Comando:

- `cd backend && npm test`

Verificacion realizada en este repo:

- `cd backend && npm test`
- `cd backend && npm run build`
- `cd frontend && npm run build`

## Notas para evaluacion

- Se incluye la migracion inicial de Prisma en `backend/prisma/migrations`.
- El bonus IoT requiere tener el broker MQTT activo antes de publicar telemetria.
