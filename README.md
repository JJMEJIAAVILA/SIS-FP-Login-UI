# SIS-FP Frontend - Interfaz de Autenticación

Este repositorio contiene la interfaz de usuario (UI) para la autenticación y registro de la aplicación "Solución Integral de Seguridad Física Portuaria (SIS-FP)". Sirve como la puerta de entrada para los usuarios al sistema, permitiendo el registro de nuevas cuentas, el inicio de sesión con credenciales locales y la autenticación a través de Google.

## Características

* **Inicio de Sesión Local:** Autenticación de usuarios con nombre de usuario/correo electrónico y contraseña.
* **Registro de Usuarios:** Creación de nuevas cuentas de usuario.
* **Autenticación con Google:** Integración de Google Sign-In para un inicio de sesión rápido y seguro.
* **Validación de reCAPTCHA:** Protección contra bots en los formularios de registro y login.
* **Feedback de Usuario:** Mensajes de alerta para indicar el estado de las operaciones (éxito, error, cargando).
* **Redirección Post-Autenticación:** Redirección a una página de "Inicio de Sesión Exitoso" tras un login o registro válido.

## Tecnologías Utilizadas

* **HTML5:** Estructura de la interfaz.
* **CSS3:** Estilos y diseño responsivo.
* **JavaScript (Vainilla):** Lógica del frontend y comunicación con el backend.
* **Google Identity Services (GSI):** Para la autenticación de Google.
* **Google reCAPTCHA v2:** Para la validación anti-bot.
* **Font Awesome:** Iconos para mejorar la UI.

## Cómo Iniciar el Frontend

Dado que este es un proyecto de frontend con archivos HTML, CSS y JavaScript puros, no requiere un servidor web complejo para ejecutarse en desarrollo.

1.  **Clona este repositorio:**
    ```bash
    git clone [https://github.com/TuUsuario/sis-fp-frontend.git](https://github.com/TuUsuario/sis-fp-frontend.git)
    cd sis-fp-frontend
    ```
    (Reemplaza `TuUsuario` y `sis-fp-frontend` con los datos de tu repositorio).

2.  **Abre `index.html`:** Simplemente abre el archivo `index.html` directamente en tu navegador web.

    * **Nota:** Si estás utilizando un servidor de desarrollo como el de WebStorm/IntelliJ (ej. `http://localhost:63342`), asegúrate de que esa URL esté configurada en los "Orígenes de JavaScript autorizados" de tu proyecto de Google Cloud Console para que la autenticación de Google funcione correctamente.

## Configuración (Claves de API)

Este frontend interactúa con las API de Google. Las claves de API necesarias están expuestas directamente en el código JavaScript (como `data-sitekey` para reCAPTCHA y `data-client_id` para Google Sign-In), ya que son públicas por diseño para el uso en el lado del cliente.

* **Google Client ID:** `[Tu Google Client ID que está en index.html y .env del backend]`
* **reCAPTCHA Site Key:** `[Tu Site Key de reCAPTCHA que está en index.html]`

## Estructura del Proyecto

sis-fp-frontend/
├── index.html                  # Página principal de inicio de sesión
├── register.html               # Página para el registro de nuevos usuarios
├── inicio_sesion_exitoso.html  # Página mostrada después de un inicio de sesión/registro exitoso
└── assets/
├── css/
│   ├── global.css          # Estilos globales y de diseño
│   └── login.css           # Estilos específicos para las páginas de autenticación
└── js/
├── login.js            # Lógica JavaScript para el inicio de sesión y Google Auth
└── register.js         # Lógica JavaScript para el registro de usuarios