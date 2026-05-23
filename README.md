# MediDesk

Sistema web de gestión de citas médicas desarrollado con Node.js, Express, MySQL y JavaScript.

---

# Características

- Inicio de sesión con JWT
- Gestión de usuarios
- Roles y permisos
- Gestión de citas médicas
- Cambio de estados de citas
- Dashboard administrativo
- Frontend responsive
- Middleware de autenticación
- API REST

---

# Tecnologías utilizadas

## Backend
- Node.js
- Express
- MySQL
- JWT
- bcrypt

## Frontend
- HTML
- CSS
- JavaScript

---

# Roles del sistema

## Admin
- Crear usuarios
- Eliminar usuarios
- Crear citas
- Eliminar citas
- Cambiar estados
- Ver dashboard

## Técnico
- Gestionar citas
- Cambiar estados
- Ver usuarios

## Usuario
- Ver citas
- Crear citas

---

# Autenticación JWT

El sistema utiliza JWT para proteger rutas privadas.

Ejemplo de token:

```json
{
  "token": "jwt_token"
}
```

---

# Endpoints principales

## Usuarios

### Login

POST `/api/usuarios/login`

### Crear usuario

POST `/api/usuarios`

### Obtener usuarios

GET `/api/usuarios`

---

## Citas

### Obtener citas

GET `/api/citas`

### Crear cita

POST `/api/citas`

### Cambiar estado

PUT `/api/citas/:id/estado`

### Eliminar cita

DELETE `/api/citas/:id`

---

# Instalación

## Clonar repositorio

```bash
git clone https://github.com/Darkwarnog/medidesk.git
```

## Instalar dependencias

```bash
npm install
```

## Ejecutar servidor

```bash
npm start
```

---

# Variables de entorno

Crear archivo `.env`

```env
PORT=3000
JWT_SECRET=tu_clave
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=citas_medicas
```

---

# Estructura del proyecto

```bash
controllers/
middlewares/
routes/
frontend/
```

---

# Estado del proyecto

Proyecto finalizado y funcional.