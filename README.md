# Gestión de Turnos

Este proyecto es una aplicación web para la gestión de turnos médicos. Permite a los usuarios registrarse, iniciar sesión, reservar turnos, consultar un listado de turnos programados y gestionar la información de los profesionales y especialidades disponibles.

## 📝 Características

- **Autenticación de Usuarios:**
  - Registro de nuevos usuarios mediante correo electrónico y contraseña.
  - Inicio de sesión seguro con Firebase Authentication.
  - Gestión de roles para identificar a los usuarios (pacientes, profesionales, administradores).

- **Reserva de Turnos:**
  - Selección de especialidad médica.
  - Visualización de profesionales disponibles según la especialidad elegida.
  - Restricción de horarios disponibles (de lunes a viernes, entre 07:00 y 19:00).
  - Confirmación de la reserva con fecha y hora.

- **Listado de Turnos Programados:**
  - Visualización en tiempo real de los turnos registrados.

## 🚀 Tecnologías Utilizadas

- **Frontend:**
  - HTML5, CSS3, JavaScript (ES6+).
  - Bootstrap 5 para diseño responsivo.
  - Manipulación dinámica del DOM con JavaScript.

- **Backend/Database:**
  - [Firebase Authentication](https://firebase.google.com/docs/auth) para el manejo de usuarios.
  - [Firebase Realtime Database](https://firebase.google.com/docs/database) para el manejo de turnos.
  - [Firebase Cloud Firestore](https://firebase.google.com/docs/firestore) para el almacenamiento de usuarios.

- **Otras herramientas:**
  - Git/GitHub para control de versiones y colaboración.
  - Firebase SDK para la integración con la base de datos y autenticación.

## 🔧 Configuración del Proyecto

### Prerrequisitos
1. Tener una cuenta de Firebase.
2. Configurar un proyecto en Firebase y habilitar:
   - Authentication (con Email/Password como proveedor).
   - Realtime Database.
   - Cloud Firestore.
   - Firebase Hosting
3. Obtener el archivo de configuración del proyecto (`firebaseConfig`).

## 📌 Funcionalidades por Desarrollar
- Panel de Administración: Interfaz para gestionar usuarios, profesionales y turnos.
- Notificaciones: Enviar confirmaciones de turnos por correo o notificación push.
- Recuperación de Contraseña: Implementar la funcionalidad para recuperar contraseñas a través de Firebase Authentication.

