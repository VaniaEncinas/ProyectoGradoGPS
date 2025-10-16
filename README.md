**ProyectoGPS**

ProyectoGPS es un sistema web para la gestión de niños y pulseras de localización. Permite registrar niños, asignarles pulseras, monitorear su ubicación en tiempo real, asignarles zonas seguras y recibir alertas.  
Desarrollado con **React.js en el frontend** y **Node.js/Express en el backend**, con base de datos **MySQL**.

**Tecnologías utilizadas**

**Backend**
- Node.js
- Express
- MySQL (Base de datos)
- Axios (para requests internos)
- JWT (para autenticación)
- Nodemailer (envío de correos electrónicos, por ejemplo con Gmail)
- SweetAlert2 (para alertas y confirmaciones interactivas)

**Frontend**
- React.js
- Material-UI (MUI) para componentes
- Axios para comunicación con backend
- React Router DOM
- SweetAlert2 (para mensajes, alertas y confirmaciones)
- Diseño responsivo

**Instalación y ejecución**

**Backend**
1. Entrar a la carpeta backend (bash):
cd backend
2. Intalar dependencias (bash):
npm install
3. Configurar archivo .env con tus credenciales:
PORT=4000
DB_USER=...
DB_PASSWORD=...
DB_HOST=...
JWT_SECRET=...
EMAIL_USER=...    # correo para envío de alertas (Nodemailer)
EMAIL_PASS=...    # contraseña de aplicación
4. Ejecutar el servidor (bash):
npm start

**Frontend**
1. Entrar a la carpeta frontend (bash):
cd frontend
2. Instalar dependencias (bash):
npm install
3. Ejecutar la aplicación (bash):
npm start

**Base de Datos**
Para recrear la BD:

1. Abre **phpMyAdmin**.
2. Crea una base de datos llamada **pulsera_gps**.
3. Importa el archivo **database/pulsera_gps.sql** incluido en este respositorio.
4. Verifica que las tablas se hayan creado correctamente.

**Funcionalidades**

1. Registro, edición, actualización y eliminación de niños y pulseras.
2. Asiganción de pulseras a los niños y control de pulseras disponibles/asignadas.
3. Alertas y confirmaciones con SweetAlert2.
4. Envío de correos electrónicos mediante Nodelaimer.
5. Sidebar fijo y responsivo para navegación entre pantallas.
6. Tablas con scroll horizontal y vertical según el contenido.
7. Modales con blur de fondo para mejorar UX.
8. Diseño responsivo en móvil y escritorio.
9. Botones de acción con hover y estilo moderno (MUI).

**Estructura del proyecto**

ProyectoGPS/
├─ backend/          # API y lógica del servidor
├─ frontend/         # Aplicación React
├─ database/         # Archivos SQL para la base de datos
└─ README.md

**Notas importantes**

1. Los scrolls de las tablas aparecen solo al pasar el mouse o cuando el contenido excede el tamaño del contenedor.
2. Los modales son responsivos y centrados.
3. No olvides configurar correctamente .env para base de datos, JWT y correo.