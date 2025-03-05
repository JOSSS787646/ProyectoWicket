document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    let username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMessage = document.getElementById("errorMessage");

    username = username.toLowerCase(); // Normalizar el nombre de usuario

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
            window.location.href = "/dashboard"; // Redirigir al dashboard
        } else {
            errorMessage.textContent = "Usuario o contraseña incorrectos";
        }
    } catch (error) {
        errorMessage.textContent = "Error de conexión con el servidor";
    }
});
