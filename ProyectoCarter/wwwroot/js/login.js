document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMessage = document.getElementById("errorMessage");

    const validUsers = {
        "Mario": "12345",
        "Admin": "admin123"
    };

    // Convertir usuario a minúsculas para comparación insensible a mayúsculas
    const lowercaseUsername = username.toLowerCase();

    // Buscar el usuario ignorando mayúsculas/minúsculas
    const validUserKey = Object.keys(validUsers).find(
        key => key.toLowerCase() === lowercaseUsername
    );

    // Verificar si el usuario existe y la contraseña es correcta
    if (validUserKey && validUsers[validUserKey] === password) {
        // Guardar el usuario logueado en localStorage en lugar de la sesión
        localStorage.setItem("loggedInUser", validUserKey);

        window.location.href = "/dashboard";
    } else {
        errorMessage.textContent = "Usuario o contraseña incorrectos";
    }
});
