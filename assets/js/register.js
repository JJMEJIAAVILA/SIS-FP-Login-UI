// --- FUNCIONES GLOBALES (o asegúrate de que showAlert sea accesible) ---
function showAlert(message, type) {
    const form = document.getElementById('registerForm');
    if (!form) {
        console.error('No se pudo encontrar el formulario de registro para mostrar la alerta. Mensaje:', message);
        return;
    }

    const existingAlert = form.querySelector('.alert-message');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert-message alert-${type}`;
    alertDiv.textContent = message;

    form.prepend(alertDiv);

    if (type !== 'loading') {
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }
}

// --- CÓDIGO QUE SE EJECUTA CUANDO EL DOCUMENTO ESTÁ LISTO (DOMContentLoaded) ---
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');

    // Elementos para mostrar/ocultar contraseña (Contraseña Original)
    const togglePasswordReg = document.getElementById('togglePasswordReg');
    const passwordInputReg = document.getElementById('regContrasena');

    // NUEVOS ELEMENTOS: Para mostrar/ocultar contraseña (Confirmar Contraseña)
    const toggleConfirmPasswordReg = document.getElementById('toggleConfirmPasswordReg');
    const confirmPasswordInputReg = document.getElementById('regConfirmContrasena'); // NUEVO ID

    // Lógica para mostrar/ocultar contraseña en el campo de contraseña original
    if (togglePasswordReg && passwordInputReg) {
        togglePasswordReg.addEventListener('click', function() {
            const type = passwordInputReg.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInputReg.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // NUEVA LÓGICA: Mostrar/ocultar contraseña en el campo de confirmar contraseña
    if (toggleConfirmPasswordReg && confirmPasswordInputReg) {
        toggleConfirmPasswordReg.addEventListener('click', function() {
            const type = confirmPasswordInputReg.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPasswordInputReg.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // Manejar el envío del formulario de registro
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const username = document.getElementById('regUsuario').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = passwordInputReg.value.trim();
            const confirmPassword = confirmPasswordInputReg.value.trim(); // OBTENER EL VALOR DEL NUEVO CAMPO

            if (!username || !email || !password || !confirmPassword) { // Añadir confirmPassword a la validación de campos vacíos
                showAlert('Por favor, complete todos los campos.', 'error');
                return;
            }

            // *** NUEVA VALIDACIÓN: COMPARAR CONTRASEÑAS ***
            if (password !== confirmPassword) {
                showAlert('Las contraseñas no coinciden. Por favor, verifique.', 'error');
                // Opcional: limpiar los campos de contraseña
                passwordInputReg.value = '';
                confirmPasswordInputReg.value = '';
                // Importante: resetear reCAPTCHA para un nuevo intento
                if (typeof grecaptcha !== 'undefined' && typeof grecaptcha.reset === 'function') {
                    grecaptcha.reset();
                }
                return; // Detener el envío del formulario
            }

            let recaptchaResponse = '';
            try {
                if (typeof grecaptcha !== 'undefined' && typeof grecaptcha.getResponse === 'function') {
                    recaptchaResponse = grecaptcha.getResponse();
                    console.log('Frontend: Token reCAPTCHA obtenido:', recaptchaResponse);
                    if (!recaptchaResponse) {
                        showAlert('Por favor, complete la verificación reCAPTCHA.', 'error');
                        return;
                    }
                } else {
                    console.error('Frontend: grecaptcha o grecaptcha.getResponse no están definidos.');
                    showAlert('Error al cargar reCAPTCHA. Intente recargar la página.', 'error');
                    return;
                }
            } catch (error) {
                console.error('Frontend: Error al obtener la respuesta de reCAPTCHA:', error);
                showAlert('Error al cargar reCAPTCHA. Intente recargar la página.', 'error');
                return;
            }

            await registerUser(username, email, password, recaptchaResponse);
        });
    }

    // Función para registrar usuario (esta función no necesita cambios, ya que solo recibe 'password')
    async function registerUser(username, email, password, recaptchaResponse) {
        showAlert('Registrando usuario...', 'loading');

        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password, // Solo se envía una contraseña al backend
                    recaptchaResponse: recaptchaResponse
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('¡Registro exitoso! Ahora puedes iniciar sesión.', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            } else {
                showAlert(data.message || 'Error al registrar usuario. Intente nuevamente.', 'error');
                if (typeof grecaptcha !== 'undefined' && typeof grecaptcha.reset === 'function') {
                    grecaptcha.reset();
                    console.log('Frontend: reCAPTCHA reseteado.');
                }
            }
        } catch (error) {
            console.error('Frontend: Error durante la petición de registro:', error);
            showAlert('Error de conexión con el servidor. Intente más tarde.', 'error');
            if (typeof grecaptcha !== 'undefined' && typeof grecaptcha.reset === 'function') {
                grecaptcha.reset();
                console.log('Frontend: reCAPTCHA reseteado por error de conexión.');
            }
        }
    }
});