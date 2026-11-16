# Food Store

Sistema de pedidos de comida. Trabajo Práctico Integrador de **Programación 4** (TUPaD · UTN).

- **Alumno:** Santiago Bongiorno
- **Repositorio:** https://github.com/sbongi22/food-store-tpi.git
- **Video de demostración:** https://youtu.be/0dg6P8Hx154

Dos proyectos independientes que se comunican por HTTP:

| Carpeta | Qué es | Puerto |
|---|---|---|
| `backend/` | API REST con FastAPI + SQLModel + PostgreSQL | 8000 |
| `frontend/` | Aplicación React + TypeScript + Vite + Tailwind CSS 4 | 5173 |

La sesión viaja en una cookie **HttpOnly** (`access_token`, JWT de 30 minutos). El frontend nunca lee ni guarda el token.

## Requisitos

| Herramienta | Versión |
|---|---|
| Python | 3.11 a 3.13 (SQLModel 0.0.22 no funciona con 3.14) |
| PostgreSQL | 15 o superior (para desarrollo local se acepta SQLite, ver más abajo) |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior (`npm install -g pnpm`) |

## 1. Backend

Desde la carpeta `backend/`.

**Crear la base de datos** (una sola vez; ejemplo con `psql`):

```sql
CREATE DATABASE foodstore_db;
```

**Instalar dependencias**

```bash
# Windows (PowerShell o CMD)
python -m venv .venv
.venv\Scripts\activate

# Linux / macOS
python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt
```

**Variables de entorno:** copiar `.env.example` a `.env` y ajustar `DATABASE_URL` con el usuario y la contraseña de tu PostgreSQL.

```bash
# Windows
copy .env.example .env
# Linux / macOS
cp .env.example .env
```

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://postgres:postgres@localhost:5432/foodstore_db` (alternativa local: `sqlite:///./foodstore.db`) |
| `SECRET_KEY` | Firma del JWT, mínimo 32 caracteres | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración de la cookie y del token | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS (con credenciales) | `http://localhost:5173` |

**Cargar los datos iniciales** (idempotente: se puede ejecutar varias veces)

```bash
python -m app.db.seed
```

Crea el usuario administrador, 5 categorías y 10 productos con stock.

**Ejecutar**

```bash
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Documentación Swagger: http://localhost:8000/docs
- Documentación ReDoc: http://localhost:8000/redoc

## 2. Frontend

Desde la carpeta `frontend/`, con el backend ya corriendo.

```bash
# Windows
copy .env.example .env
# Linux / macOS
cp .env.example .env

pnpm install
pnpm build     # verifica los tipos (TypeScript strict) y compila
pnpm dev
```

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API (incluye `/api/v1`) | `http://localhost:8000/api/v1` |

Abrir http://localhost:5173.

## Usuario administrador (seed)

| Campo | Valor |
|---|---|
| Usuario | `admin` |
| Contraseña | `Admin1234!` |
| Rol | `admin` |

El registro público siempre crea usuarios con rol `user`.

## Funcionalidades

**Cliente:** registro e inicio de sesión, catálogo paginado en el servidor con búsqueda y filtro por categoría, carrito persistido en el navegador, checkout con dirección y forma de pago (efectivo o transferencia), «Mis pedidos» con detalle y cancelación mientras el pedido está en `PENDIENTE`.

**Administrador:** resumen del negocio, ABM de categorías y productos (con cambio de stock y disponibilidad), gestión de pedidos con la máquina de estados, y gestión de usuarios (activar y desactivar).

**Reglas de negocio:**

- **RN-01** El pedido se crea completo o no se crea: se valida el stock y se descuenta en una sola transacción.
- **RN-02** Máquina de estados: `PENDIENTE → EN_PREPARACION → ENTREGADO`; se puede pasar a `CANCELADO` desde `PENDIENTE` o `EN_PREPARACION`. Una transición inválida responde 400.
- **RN-03** Al cancelar se restituye el stock de cada línea en la misma transacción.
- **RN-04** El cliente solo ve y cancela sus pedidos, y solo desde `PENDIENTE`. El admin ve todos.
- **RN-05** Las líneas y el total no cambian: cada línea guarda una copia del nombre y del precio.
- **RN-06** `forma_pago` es `EFECTIVO` o `TRANSFERENCIA`; `direccion_entrega` tiene entre 5 y 200 caracteres.

## Arquitectura

**Backend:** un paquete por dominio en `app/modules/` (`auth`, `usuarios`, `categorias`, `productos`, `pedidos`), con la cadena Router → Service → Unit of Work → Repository → Model. El `commit` ocurre únicamente en el `__exit__` del Unit of Work; ningún Service ni Router llama a `session.commit()`. Infraestructura compartida en `app/core/`.

**Frontend:** organizado por features (`src/features/<dominio>/{pages,components,hooks,api,types}`), con `shared/`, `store/` y `routes/`. Estado del servidor con TanStack Query; estado del cliente (sesión y carrito) con Zustand + `persist`; Axios con `withCredentials` e interceptor de 401; rutas protegidas por rol con `ProtectedRoute`.
