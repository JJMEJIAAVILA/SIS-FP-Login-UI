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

    form.appendChild(alertDiv); // Adjuntar la alerta al formulario

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


// --- CÓDIGO QUE SE EJECUTA CUANDO EL DOCUMENTO ESTÁ LISTO (DOMContentLoad) ---
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('contrasena');

    // Función para mostrar/ocultar contraseña (esto está bien aquí dentro)
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
    }

    // Manejar el envío del formulario de login (esto está bien aquí dentro)
    if (loginForm) { // Asegúrate de que el formulario de login existe
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const usuario = document.getElementById('usuario').value.trim();
            const contrasena = passwordInput.value.trim();

            if (!usuario || !contrasena) {
                showAlert('Por favor, complete todos los campos', 'error');
                return;
            }

            let recaptchaResponse = '';
            try {
                recaptchaResponse = grecaptcha.getResponse();
                if (!recaptchaResponse) {
                    showAlert('Por favor, complete la verificación reCAPTCHA.', 'error');
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

    // Función para autenticar usuario REAL (esto está bien aquí dentro)
    async function authenticateUser(username, password, recaptchaResponse) {
        showAlert('Verificando credenciales...', 'loading'); // Esta llamada a showAlert funciona porque está dentro del mismo ámbito.

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
                    window.location.href = 'inicio_sesion_exitoso.html';
                }, 1000);

            } else {
                showAlert(data.message || 'Credenciales incorrectas. Intente nuevamente.', 'error');
                if (grecaptcha && typeof grecaptcha.reset === 'function') {
                    grecaptcha.reset();
                }
            }
        } catch (error) {
            console.error('Error durante la petición de autenticación:', error);
            showAlert('Error de conexión con el servidor. Intente más tarde.', 'error');
            if (grecaptcha && typeof grecaptcha.reset === 'function') {
                grecaptcha.reset();
            }
        }
    }
});