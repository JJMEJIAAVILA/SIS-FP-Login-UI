// --- FUNCIONES GLOBALES ---
// Mover showAlert fuera del DOMContentLoaded para que sea global y accesible por handleGoogleSignIn
function showAlert(message, type) {
    // Intentar encontrar el formulario de login o de registro para adjuntar la alerta
    const form = document.getElementById('loginForm') || document.getElementById('registerForm');
    if (!form) {
        // Fallback si no se encuentra un formulario (para casos donde la alerta no se adjunta a uno)
        console.error('No se pudo encontrar un formulario para mostrar la alerta. Mensaje:', message);
        return; // No se puede mostrar la alerta si no hay donde adjuntarla
    }

    const existingAlert = form.querySelector('.alert-message');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert-message alert-${type}`;
    alertDiv.textContent = message;

    // Insertar la alerta antes del primer input-group o al inicio del formulario
    form.prepend(alertDiv); // Mejor prepend para que aparezca arriba del formulario

    if (type !== 'loading') {
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }
}

// Función para manejar la respuesta del inicio de sesión de Google
// Esta función debe ser global para que el SDK de Google la pueda llamar.
window.handleGoogleSignIn = async function(response) {
    const idToken = response.credential; // El ID Token de Google se encuentra aquí

    if (!idToken) {
        showAlert('No se pudo obtener el token de Google.', 'error');
        return;
    }

    showAlert('Verificando credenciales con Google...', 'loading');

    try {
        const backendResponse = await fetch('http://localhost:3000/api/auth/google', { // Tu endpoint de Google Auth en tu backend
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken: idToken }),
        });

        const data = await backendResponse.json();

        if (backendResponse.ok) {
            // Autenticación con Google exitosa
            localStorage.setItem('currentUser', data.user.name || data.user.email);
            localStorage.setItem('authToken', data.appToken); // GUARDAR EL TOKEN JWT DE TU BACKEND

            showAlert('¡Inicio de sesión con Google exitoso!', 'success');
            setTimeout(() => {
                // Redirige a una página existente (ej. dashboard.html o index.html)
                // Asegúrate de que esta ruta sea correcta para tu proyecto
                window.location.href = 'inicio_sesion_exitoso.html';
            }, 1000);
        } else {
            showAlert(data.message || 'Error al iniciar sesión con Google. Intente nuevamente.', 'error');
        }
    } catch (error) {
        console.error('Error durante la petición de autenticación con Google al backend:', error);
        showAlert('Error de conexión con el servidor al autenticar con Google.', 'error');
    }
};


// --- CÓDIGO QUE SE EJECUTA CUANDO EL DOCUMENTO ESTÁ LISTO (DOMContentLoaded) ---
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('contrasena');

    // Lógica para mostrar/ocultar contraseña (Corrección de clases aquí)
    if (togglePassword && passwordInput) { // Verifica si ambos elementos fueron encontrados
        togglePassword.addEventListener('click', function() {
            console.log("¡Clic en el ojo!"); // Mensaje de depuración
            // Alternar el tipo del input entre 'password' y 'text'
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            // Alternar el icono del ojo: de abierto a cerrado y viceversa
            // fa-eye es el ojo abierto, fa-eye-slash es el ojo tachado (cerrado)
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    } else {
        console.log("No se encontraron los elementos 'togglePassword' o 'passwordInput'."); // Mensaje de depuración
    }

    // Manejar el envío del formulario de login
    if (loginForm) { // Asegúrate de que el formulario de login existe
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const usuario = document.getElementById('usuario').value.trim();
            const contrasena = passwordInput.value.trim(); // Usar passwordInput directamente

            if (!usuario || !contrasena) {
                showAlert('Por favor, complete todos los campos', 'error');
                return;
            }

            let recaptchaResponse = '';
            try {
                // grecaptcha solo está disponible si el script de reCAPTCHA se cargó correctamente
                if (typeof grecaptcha !== 'undefined') {
                    recaptchaResponse = grecaptcha.getResponse();
                    if (!recaptchaResponse) {
                        showAlert('Por favor, complete la verificación reCAPTCHA.', 'error');
                        return;
                    }
                } else {
                    console.error('grecaptcha no está definido. Asegúrese de que el script de reCAPTCHA se cargue correctamente.');
                    showAlert('Error al cargar reCAPTCHA. Intente recargar la página.', 'error');
                    return;
                }
            } catch (error) {
                console.error('Error al obtener la respuesta de reCAPTCHA:', error);
                showAlert('Error al cargar reCAPTCHA. Intente recargar la página.', 'error');
                return;
            }

            await authenticateUser(usuario, contrasena, recaptchaResponse);
        });
    }

    // Función para autenticar usuario
    async function authenticateUser(username, password, recaptchaResponse) {
        showAlert('Verificando credenciales...', 'loading');

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    recaptchaResponse: recaptchaResponse
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('currentUser', username);
                localStorage.setItem('authToken', data.token);

                showAlert('¡Inicio de sesión exitoso!', 'success');
                setTimeout(() => {
                    // Redirige a una página existente (ej. dashboard.html o index.html)
                    // Asegúrate de que esta ruta sea correcta para tu proyecto
                    window.location.href = 'inicio_sesion_exitoso.html';
                }, 1000);

            } else {
                showAlert(data.message || 'Credenciales incorrectas. Intente nuevamente.', 'error');
                // Siempre reiniciar reCAPTCHA en caso de error de credenciales
                if (typeof grecaptcha !== 'undefined' && typeof grecaptcha.reset === 'function') {
                    grecaptcha.reset();
                }
            }
        } catch (error) {
            console.error('Error durante la petición de autenticación:', error);
            showAlert('Error de conexión con el servidor. Intente más tarde.', 'error');
            // Siempre reiniciar reCAPTCHA en caso de error de conexión
            if (typeof grecaptcha !== 'undefined' && typeof grecaptcha.reset === 'function') {
                grecaptcha.reset();
            }
        }
    }
});