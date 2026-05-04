# Proyecto Final - Plataforma Eco-Sostenible para Gestión de Ocio Nocturno

Una aplicación web integral diseñada para la gestión de compras de bebidas, validación mediante códigos QR, y un sistema avanzado de sostenibilidad y propinas.

## 👨‍🎓 Autor

- **Alejandro Romero Stankevich**
- **Ciclo:** CFGS en Desarrollo de Aplicaciones Web (DAW) - 2º grado
- **Instituto:** Institut Joaquim Mir
- **Proyecto:** Proyecto Final de Grado

---

## 📖 Descripción del Proyecto

Esta plataforma permite modernizar la experiencia en locales de ocio bajo un enfoque **eco-sostenible**. Ofrece una interfaz dinámica y moderna (Dark Theme) con animaciones fluidas y un sistema multilingüe (Español, Inglés y Ruso). El proyecto destaca por eliminar el uso de papel (tickets) y plástico, cuantificando el impacto ambiental positivo en tiempo real.

El sistema se divide en **4 roles principales**:

1. **Usuario (User):** Puede recargar su monedero virtual, comprar bebidas, generar códigos QR para canjear en la barra, transferir/regalar bebidas a otros usuarios y dejar propinas al personal.
2. **Personal (Staff):** Cuenta con un escáner QR integrado para validar los pedidos de los usuarios en tiempo real, visualizar su historial de propinas recibidas y ver su saldo actualizado.
3. **Administrador (Admin):** Gestiona su local específico. Puede añadir/eliminar empleados, modificar el menú de bebidas, crear promociones y visualizar el **Eco-Dashboard** con estadísticas de impacto ambiental y métricas económicas.
4. **Super Administrador (SuperAdmin):** Tiene control global sobre la plataforma y todos los locales.

---

## 🛠️ Tecnologías Utilizadas

**Frontend (Cliente):**
- **React 19** con **Vite**
- **Redux Toolkit** para la gestión del estado global
- **Tailwind CSS v4** para el diseño responsivo y moderno
- **Lucide React** para la iconografía
- **i18next** para la internacionalización (ES, EN, RU)
- **html5-qrcode** & **qrcode.react** para la gestión de códigos QR

**Backend (Servidor):**
- **Node.js** con **Express.js**
- **MySQL** como base de datos relacional
- **Sequelize ORM** para la gestión de modelos y consultas a la base de datos
- **JWT (JSON Web Tokens)** para la autenticación y seguridad
- **Bcryptjs** para el encriptado seguro de contraseñas
- **Multer** para la subida y gestión de fotos de perfil e imágenes

---

## ⚙️ Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:
- **Node.js** (v18 o superior recomendado)
- **MySQL Server** (XAMPP, WAMP o instalación nativa)
- Git (Opcional, para control de versiones)

---

## 🚀 Guía de Instalación y Ejecución

Sigue estos pasos para arrancar el proyecto en tu entorno local.

### 1. Preparar la Base de Datos
- Abre tu gestor de MySQL (ej. phpMyAdmin, MySQL Workbench).
- Crea una base de datos vacía (por ejemplo, `proyecto_final_db`).

### 2. Configuración del Servidor (Backend)

Abre una terminal y navega a la carpeta del servidor:

```bash
cd server
npm install
```

Configura las variables de entorno:
- En la carpeta `server`, copia el archivo `.env.example` y renómbralo a `.env`.
- Rellena el archivo `.env` con tus credenciales de MySQL y configuración:

```env
PORT=3000
DB_NAME=proyecto_final_db
DB_USER=root
DB_PASS=tu_contraseña_aqui
DB_HOST=localhost
JWT_SECRET=tu_clave_secreta_super_segura
```

Inicia el servidor en modo desarrollo:
```bash
npm run dev
```
*Nota: Sequelize se encargará de crear y sincronizar las tablas en la base de datos automáticamente al arrancar.*

### 3. Configuración del Cliente (Frontend)

Abre **otra pestaña** en tu terminal y navega a la carpeta del cliente:

```bash
cd client
npm install
```

Configura las variables de entorno (si es necesario):
- Crea un archivo `.env` en la carpeta `client`.
- Añade la URL del backend (ejemplo):
```env
VITE_API_URL=http://localhost:3000/api
```

Inicia el entorno de desarrollo del cliente:
```bash
npm run dev
```

### 4. ¡A disfrutar! 🎉
- Abre tu navegador y accede a la URL que te indique Vite (normalmente `http://localhost:5173`).
- Puedes registrarte como un nuevo usuario y comenzar a probar la aplicación.

---

## 📱 Características Destacadas

- **Diseño Premium:** Interfaz oscura (Dark Mode) con toques de neón esmeralda, efecto cristal (glassmorphism) y micro-animaciones.
- **Compromiso ECO:** Sistema integrado que calcula el ahorro de papel, plástico, agua y emisiones de CO2 basado en la actividad del local. Genera un "Eco Score" certificado.
- **Optimización Optimista (Optimistic UI):** Las interacciones como dar propinas se reflejan instantáneamente en la interfaz antes de que el servidor responda, dando una sensación de latencia cero.
- **Debounce Integrado:** Las llamadas a la API se han optimizado para evitar la sobrecarga del servidor en inputs en tiempo real.
- **Responsive Design:** Perfectamente adaptable a dispositivos móviles, tablets y escritorio.
