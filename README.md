# 🔐 Generador de Contraseñas Pro

Un generador de contraseñas de alta seguridad con estética **Cyberpunk / MacOS Glassmorphism**. Permite generar, gestionar y almacenar contraseñas de forma segura en una bóveda personal.

## 🌟 Características Principales

- **Generación Avanzada**: Control total sobre longitud y tipos de caracteres (Mayúsculas, Minúsculas, Números, Símbolos).
- **Medidor de Fortaleza**: Algoritmo en tiempo real para evaluar la seguridad de la contraseña.
- **Bóveda Personal (Vault)**: Guarda tus contraseñas con etiquetas personalizadas.
- **Gestión de Perfil**: Personaliza tu cuenta con tu nombre y foto de perfil.
- **Interfaz Premium**: Diseño moderno con efectos de cristal (Glassmorphism) y animaciones fluidas.
- **Seguridad**: Autenticación mediante JWT (JSON Web Tokens) y encriptación de contraseñas con bcrypt.

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica.
- **CSS3**: Diseño responsivo y efectos Glassmorphism.
- **Vanilla JavaScript**: Lógica de aplicación y consumo de API.

### Backend
- **Node.js & Express**: Servidor y API REST.
- **MongoDB & Mongoose**: Base de datos NoSQL y modelado de datos.
- **Multer**: Gestión de subida de imágenes de perfil.
- **JWT & bcryptjs**: Autenticación y seguridad.

## 🚀 Instalación y Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd generador-pro
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:
   ```env
   PORT=5001
   MONGODB_URI=tu_uri_de_mongodb
   JWT_SECRET=tu_secreto_para_jwt
   ```

4. **Iniciar el servidor**:
   ```bash
   node server/index.js
   ```

5. **Abrir la aplicación**:
   Abre el archivo `index.html` en tu navegador o utiliza una extensión como *Live Server*.

## 📂 Estructura del Proyecto

- `server/`: Código del servidor Express, modelos y rutas.
- `js/`: Lógica frontend (`app.js`).
- `css/`: Estilos CSS (`styles.css`).
- `uploads/`: Carpeta para las imágenes de perfil de los usuarios (ignorado por git).
- `index.html`: Punto de entrada de la aplicación.

## ⚖️ Licencia

Este proyecto está bajo la licencia MIT.
