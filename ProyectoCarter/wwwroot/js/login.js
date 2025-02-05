document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("errorMessage");

    const validUsers = {
        "Mario": "12345",
        "Admin": "admin123"
    };

    if (validUsers[username] && validUsers[username] === password) {
        localStorage.setItem("loggedInUser", username);
        window.location.href = "/dashboard";
    } else {
        errorMessage.textContent = "Usuario o contraseña incorrectos";
    }
});
