document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    let username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMessage = document.getElementById("errorMessage");

    // Convertir el nombre de usuario a minúsculas para comparación insensible a mayúsculas
    username = username.toLowerCase();

    try {
        const response = await fetch("/auth/login", {
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
            errorMessage.textContent = data.message || "Usuario o contraseña incorrectos";
        }
    } catch (error) {
        errorMessage.textContent = "Error de conexión con el servidor";
    }
});
