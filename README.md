# ProyectoGPS

ProyectoGPS es un sistema web para la gestión de niños y pulseras de localización, desarrollado con **React.js en el frontend** y **Node.js/Express en el backend**.

## Tecnologías utilizadas

### Backend
- Node.js
- Express
- Base de datos (MySQL)
- Axios (para manejo de requests internos)
- JWT para autenticación

### Frontend
- React.js
- Material-UI (MUI) para componentes
- Axios para comunicación con backend
- React Router DOM

## Instalación y ejecución

### Backend

1. Entrar a la carpeta backend:
```bash
cd backend

2. Instalar dependencias
```bash
npm install

3. Configurar archivo .env con tus credenciales y puerto:
PORT=4000
DB_USER=...
DB_PASSWORD=...
DB_HOST=...
JWT_SECRET=...

4. Ejecutar el servidor:
npm start

### Frontend
1. Entrar a la carpeta frontend:
cd frontend

2. Instalar dependencias:
npm install

3. Ejecutar la aplicación:
npm start

Uso
Desde el frontend puedes registrar, editar, actualizar y eliminar niños, y asignarles pulseras.
El sistema maneja control de pulseras disponibles/asignadas.
