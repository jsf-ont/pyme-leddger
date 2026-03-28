# BeanPCGE - Contabilidad para MYPEs Peruanas

**BeanPCGE** es una plataforma SaaS de contabilidad **100% web**, diseñada específicamente para las MYPEs (Micro y Pequeñas Empresas) Peruanas. Utiliza el Plan Contable General Empresarial (PCGE) y está lista para SUNAT.

> **Nota:** BeanPCGE es una aplicación web exclusivamente. No existe versión móvil ni app nativa.

## Características

- ✅ **Contabilidad PCGE 100% Peruana** - Plan de cuentas preconfigurado según el PCGE
- ✅ **Dashboard Financiero** - Métricas claras: Ingresos, Gastos, Ganancias
- ✅ **Transacciones en Lenguaje Natural** - Describe tus operaciones y la IA las categoriza
- ✅ **Reportes Instantáneos** - Balance General y Estado de Resultados
- ✅ **Compatible con SUNAT** - Genera reportes para declaraciones tributarias
- ✅ **Autenticación Segura** - Supabase Auth o JWT
- ✅ **Demo Mode** - Prueba la plataforma sin registrarte

## Tecnologías

### Frontend
- React 18 + Vite
- React Router (navegación)
- Supabase Client
- Lucide React (iconos)
- CSS personalizado (diseño Emerald/Cream/Amber)

### Backend
- Node.js + Express
- SQLite (better-sqlite3)
- JWT / Supabase JWT Verification
- REST API

### Base de Datos
- SQLite (local)
- Supabase PostgreSQL (producción)

### Deployment
- Docker + Docker Compose
- Dokploy compatible

## Estructura del Proyecto

```
pyme-ledger/
├── frontend/              # Frontend React
│   ├── src/
│   │   ├── pages/       # Landing, Login, Register, Dashboard
│   │   ├── styles/     # CSS global y app
│   │   └── App.jsx      # Router principal
│   ├── dist/            # Build de producción
│   └── package.json
├── backend/             # Backend Express
│   ├── routes/
│   │   ├── auth.js     # Autenticación
│   │   └── api.js      # API de negocios
│   ├── middleware/
│   │   └── auth.js     # JWT middleware
│   ├── data/           # SQLite database
│   ├── server.js       # Servidor principal
│   └── package.json
├── docker-compose.yml  # Docker Compose
├── Dockerfile          # Imagen Docker
└── .env.example        # Variables de entorno
```

## Instalación y Uso Local

### Requisitos
- Node.js 18+
- Docker (opcional)

### Desarrollo

1. **Instalar dependencias del backend:**
```bash
cd backend
npm install
```

2. **Instalar dependencias del frontend:**
```bash
cd frontend
npm install
```

3. **Iniciar el backend:**
```bash
cd backend
npm start
```
El servidor correrá en http://localhost:3001

4. **Iniciar el frontend (desarrollo):**
```bash
cd frontend
npm run dev
```

5. **Acceder:**
- Landing: http://localhost:5173
- Dashboard: http://localhost:5173/dashboard

### Producción

1. **Build del frontend:**
```bash
cd frontend
npm run build
```

2. **Ejecutar con Docker:**
```bash
docker-compose up --build
```

O manualmente:
```bash
cd backend
npm install
npm start
```

## Variables de Entorno

### Backend (.env)
```env
PORT=3001
NODE_ENV=production
JWT_SECRET=tu-secreto-aqui

# Supabase JWT Verification (optional)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_JWT_SECRET=tu-supabase-jwt-secret
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

---

## Supabase Integration

BeanPCGE soporta autenticación con Supabase. Esta es la configuración recomendada para producción.

### 1. Crear Proyecto Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto
2. Anota la URL del proyecto y las keys (anon y service_role)

### 2. Ejecutar Schema SQL

1. En el panel de Supabase, ve a **SQL Editor**
2. Copia el contenido de `supabase/schema.sql`
3. Ejecuta el script

Esto creará:
- Tabla `profiles` - Perfiles de usuarios
- Tabla `companies` - Empresas
- Tabla `accounts` - Plan de cuentas PCGE
- Tabla `transactions` - Transacciones
- Tabla `journal_entries` - Partidas contables
- Tabla `reports` - Reportes cacheados

### 3. Configurar Environment Variables

Copia `.env.example` a `.env` y configura:

```env
# Frontend (.env)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend (opcional - solo si usas JWT de Supabase)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_JWT_SECRET=tu-jwt-secret
```

### 4. Row Level Security (RLS)

El schema incluye políticas RLS que automáticamente:
- Permiten a usuarios ver solo sus propios datos
- Protegen acceso no autorizado a empresas, cuentas y transacciones
- Crean automáticamente perfiles al registrarse

### 5. Funciones PCGE

El schema incluye:
- **seed_pcge_accounts**: Auto-crea cuentas PCGE al crear empresa
- **calculate_igv**: Calcula IGV (18%) para transacciones
- **calculate_total_with_igv**: Calcula total incluyendo IGV

### 6. Autenticación Híbrida

BeanPCGE funciona en dos modos:

| Modo | Frontend | Backend |
|------|----------|---------|
| **Supabase** | Supabase Auth | JWT Supabase |
| **Local** | Backend JWT | JWT Local |

El modo se detecta automáticamente según las variables configuradas.

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/demo` - Modo demo
- `GET /api/auth/me` - Datos del usuario (requiere auth)
- `PUT /api/auth/profile` - Actualizar perfil
- `PUT /api/auth/company` - Actualizar empresa

### Transacciones
- `GET /api/transactions` - Listar transacciones
- `POST /api/transactions` - Crear transacción
- `DELETE /api/transactions/:id` - Eliminar transacción

### Cuentas
- `GET /api/accounts` - Listar plan de cuentas
- `POST /api/accounts` - Crear cuenta

### Reportes
- `GET /api/dashboard` - Datos del dashboard
- `GET /api/reports/balance` - Balance General
- `GET /api/reports/income` - Estado de Resultados

## Deployment con Dokploy

1. **Preparar el servidor Dokploy**
2. **Crear un nuevo proyecto**
3. **Configurar el repositorio Git**
4. **Environment variables:**
   - `JWT_SECRET` - Secret key para JWT local
   - `SUPABASE_URL` - URL de tu proyecto Supabase
   - `SUPABASE_JWT_SECRET` - JWT secret de Supabase
   - `VITE_SUPABASE_URL` - URL para el frontend
   - `VITE_SUPABASE_ANON_KEY` - Anon key para el frontend
   - `DOMAIN` - Tu dominio
5. **Docker Compose** ya está configurado para Dokploy con Traefik

### Supabase en Producción

Para producción con Supabase:
1. Configura tu proyecto Supabase con el schema en `supabase/schema.sql`
2. Establece las variables de entorno en Dokploy
3. El frontend usará Supabase Auth directamente
4. El backend puede verificar tokens de Supabase

### Puertos
- Backend: 3001
- Base de datos: SQLite (archivo local) o Supabase PostgreSQL

## Precio

- **Prueba**: S/0 (para siempre)
  - Hasta 50 transacciones
  - Plan de cuentas básico
  
- **Profesional**: S/50/mes
  - Transacciones ilimitadas
  - PCGE completo
  - Reportes SUNAT
  - IA para categorización
  - Soporte prioritario

## Licencia

MIT License - 2024 BeanPCGE
