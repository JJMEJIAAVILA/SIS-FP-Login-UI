document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('regUsuario').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regContrasena').value.trim();

        // Validación básica
        if (!username || !email || !password) {
            showAlert('Por favor, complete todos los campos.', 'error');
            return;
        }

        // Obtener la respuesta de reCAPTCHA
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

        showAlert('Registrando usuario...', 'loading');

        try {
            const response = await fetch('http://localhost:3000/api/register', { // Tu endpoint de registro
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password,
                    recaptchaResponse: recaptchaResponse
                }),
            });

            const data = await response.json();

            if (response.ok) { // Si el registro fue exitoso (código 2xx)
                // Opcional: Si el backend envía un token de sesión al registrar, guárdalo
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                    // También podrías guardar el nombre de usuario o email si lo recibes
                    localStorage.setItem('currentUser', username);
                }

                showAlert('¡Registro exitoso! Redirigiendo...', 'success');
                // PASO CLAVE: Redirigir al inicio de sesión exitoso
                setTimeout(() => {
                    window.location.href = 'inicio_sesion_exitoso.html';
                }, 1000); // Dar un segundo para que el usuario vea el mensaje de éxito

            } else {
                // Registro fallido, muestra el mensaje de error del backend
                showAlert(data.message || 'Error en el registro. Intente de nuevo.', 'error');
                // Resetea el reCAPTCHA si hubo un fallo
                if (grecaptcha && typeof grecaptcha.reset === 'function') {
                    grecaptcha.reset();
                }
            }
        } catch (error) {
            console.error('Error durante la petición de registro:', error);
            showAlert('Error de conexión con el servidor. Intente más tarde.', 'error');
            if (grecaptcha && typeof grecaptcha.reset === 'function') {
                grecaptcha.reset();
            }
        }
    });

    // Función para mostrar alertas/feedback (reutilizada de login.js)
    function showAlert(message, type) {
        const existingAlert = document.querySelector('.alert-message');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert-message alert-${type}`;
        alertDiv.textContent = message;

        registerForm.appendChild(alertDiv);

        if (type !== 'loading') {
            setTimeout(() => {
                alertDiv.remove();
            }, 3000);
        }
    }
});