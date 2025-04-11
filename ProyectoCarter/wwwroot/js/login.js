document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Corregí 'e' por 'event'
    const btn = this.querySelector('button[type="submit"]');

    // Mostrar estado de carga
    btn.classList.add('btn-loading');
    btn.querySelector('span').style.visibility = 'hidden';

    // Obtener valores de los campos
    let username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMessage = document.getElementById("errorMessage");

    username = username.toLowerCase();

    try {
        const response = await fetch(`${window.location.origin}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("loggedInUser", JSON.stringify(data));
            window.location.href = "/dashboard";
        } else {
            errorMessage.textContent = "Usuario o contraseña incorrectos";
            errorMessage.style.display = "block";

            // Restaurar botón
            btn.classList.remove('btn-loading');
            btn.querySelector('span').style.visibility = 'visible';
        }
    } catch (error) {
        errorMessage.textContent = "Error de conexión con el servidor";
        errorMessage.style.display = "block";

        // Restaurar botón
        btn.classList.remove('btn-loading');
        btn.querySelector('span').style.visibility = 'visible';
    }
});
