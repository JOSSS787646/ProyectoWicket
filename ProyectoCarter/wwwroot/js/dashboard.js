document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    // Agregar el evento para el botón de menú hamburguesa
    menuToggle.addEventListener("click", function () {
        navLinks.classList.toggle("active");
    });

    // Verificar si el usuario está en localStorage en lugar de la sesión
    const user = localStorage.getItem("loggedInUser");

    if (!user) {
        window.location.href = "/login";
    }

    document.getElementById("logout").addEventListener("click", function () {
        localStorage.removeItem("loggedInUser");
        window.location.href = "/login";
    });

    // Resto del código...

    //Funcion para el reloj digital
    function updateClock() {
        const clock = document.getElementById("clock");
        const now = new Date();

        let hours = now.getHours().toString().padStart(2, '0');
        let minutes = now.getMinutes().toString().padStart(2, '0');
        let seconds = now.getSeconds().toString().padStart(2, '0');

        // Alternar visibilidad de los dos puntos para efecto de parpadeo
        let separator = now.getSeconds() % 2 === 0 ? ":" : " ";

        clock.innerHTML = `${hours}${separator}${minutes}${separator}${seconds}`;
    }

    // Actualiza el reloj cada segundo
    setInterval(updateClock, 1000);

    // Llama a la función para mostrar la hora inmediatamente
    updateClock();


    // Generar el breadcrumb
    function generateBreadcrumb() {
        const path = window.location.pathname.split("/").filter(Boolean);
        let breadcrumbHTML = `<a href="/">Inicio</a>`;
        let currentPath = "";

        path.forEach((segment, index) => {
            currentPath += `/${segment}`;
            breadcrumbHTML += ` > <a href="${currentPath}">${segment}</a>`;
        });

        document.getElementById("breadcrumb").innerHTML = breadcrumbHTML;
    }

    generateBreadcrumb();

    // Ejemplo de JS: Mostrar mensaje al hacer clic
    document.getElementById("showMessage").addEventListener("click", function () {
        document.getElementById("message").textContent = "¡Hola! Este es un mensaje generado con JavaScript.";
    });

    // Botón para mostrar la página de error
    document.getElementById("showError").addEventListener("click", function () {
        window.location.href = "/error";
    });

    // Botón para mostrar la página de construcción
    document.getElementById("showConstructionServicios").addEventListener("click", function () {
        window.location.href = "/construccion";
    });

    document.getElementById("showConstructionContacto").addEventListener("click", function () {
        window.location.href = "/construccion";
    });
});
