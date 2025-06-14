// --- FUNCIONES GLOBALES ---
// Mover showAlert fuera del DOMContentLoaded para que sea global
function showAlert(message, type) {
    // Intentar encontrar el formulario de login o de registro para adjuntar la alerta
    const form = document.getElementById('registerForm') || document.getElementById('loginForm');
    if (!form) {
        console.error('No se pudo encontrar un formulario (registerForm o loginForm) para mostrar la alerta. Mensaje:', message);
        return;
    }

    const existingAlert = form.querySelector('.alert-message');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert-message alert-${type}`;
    alertDiv.textContent = message;

    // Adjuntar la alerta al inicio del formulario
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

    // --- INICIO: Lógica para mostrar/ocultar contraseña en el registro ---
    const togglePasswordReg = document.getElementById('togglePasswordReg');
    const passwordInputReg = document.getElementById('regContrasena'); // Asegúrate que el ID coincida

    if (togglePasswordReg && passwordInputReg) { // Verifica si los elementos fueron encontrados
        togglePasswordReg.addEventListener('click', function() {
            console.log("¡Clic en el ojo de registro!"); // Mensaje de depuración
            // Alternar el tipo del input entre 'password' y 'text'
            const type = passwordInputReg.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInputReg.setAttribute('type', type);

            // Alternar el icono del ojo: de abierto a cerrado y viceversa
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    } else {
        console.log("No se encontraron los elementos 'togglePasswordReg' o 'passwordInputReg'."); // Mensaje de depuración
    }
    // --- FIN: Lógica para mostrar/ocultar contraseña en el registro ---

    // Asegúrate de que el formulario de registro exista antes de añadir el listener
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const username = document.getElementById('regUsuario').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = passwordInputReg.value.trim(); // Usar la referencia al input de contraseña

            // Validación básica
            if (!username || !email || !password) {
                showAlert('Por favor, complete todos los campos.', 'error');
                return;
            }

            // Obtener la respuesta de reCAPTCHA
            let recaptchaResponse = '';
            try {
                // Verificar si grecaptcha está definido antes de usarlo
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
                    if (data.token) {
                        localStorage.setItem('authToken', data.token);
                        localStorage.setItem('currentUser', username);
                    }

                    showAlert('¡Registro exitoso! Redirigiendo...', 'success');
                    setTimeout(() => {
                        window.location.href = 'inicio_sesion_exitoso.html'; // Redirige a la página de éxito
                    }, 1000);

                } else {
                    showAlert(data.message || 'Error en el registro. Intente de nuevo.', 'error');
                    if (typeof grecaptcha !== 'undefined' && typeof grecaptcha.reset === 'function') {
                        grecaptcha.reset();
                    }
                }
            } catch (error) {
                console.error('Error durante la petición de registro:', error);
                showAlert('Error de conexión con el servidor. Intente más tarde.', 'error');
                if (typeof grecaptcha !== 'undefined' && typeof grecaptcha.reset === 'function') {
                    grecaptcha.reset();
                }
            }
        });
    }
});