document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    // Mostrar estado de carga
    btn.classList.add('btn-loading');
    btn.querySelector('span').style.visibility = 'hidden';

    // Ocultar mensajes de error previos
    document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
    });

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMessage = document.getElementById("errorMessage");

    if (!username || !email || !password) {
        errorMessage.textContent = "Todos los campos son obligatorios.";
        return;
    }

    const response = await fetch(`${window.location.origin}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Username: username, Email: email, Password: password })
    });

    if (response.ok) {
        alert("Registro exitoso. Ahora puedes iniciar sesión.");
        window.location.href = "/login";
    } else {
        const errorText = await response.text();
        errorMessage.textContent = errorText;
    }
});
