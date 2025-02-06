document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("errorMessage");

    const validUsers = {
        "Mario": "12345",
        "Admin": "admin123"
    };

    console.log("Usuario ingresado:", username); // Depuración
    console.log("Contraseña ingresada:", password); // Depuración

    // Convertir el nombre de usuario a minúsculas para hacer la comparación insensible a mayúsculas
    const lowercaseUsername = username.toLowerCase();

    // Buscar el nombre de usuario en el objeto validUsers (insensible a mayúsculas)
    const validUserKey = Object.keys(validUsers).find(
        key => key.toLowerCase() === lowercaseUsername
    );

    console.log("Usuario válido encontrado:", validUserKey); // Depuración

    // Verificar si el usuario existe y si la contraseña coincide
    if (validUserKey && validUsers[validUserKey] === password) {
        console.log("Acceso concedido"); // Depuración
        localStorage.setItem("loggedInUser", validUserKey); // Guardar el nombre de usuario correcto
        window.location.href = "/dashboard";
    } else {
        console.log("Acceso denegado"); // Depuración
        errorMessage.textContent = "Usuario o contraseña incorrectos";
    }
});