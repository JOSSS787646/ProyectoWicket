document.addEventListener("DOMContentLoaded", function () {
    console.log("Dashboard cargado");

    // Verificar usuario logueado
    const userData = localStorage.getItem("loggedInUser");

    if (!userData) {
        window.location.href = "/login";
        return;
    }

    try {
        const usuario = JSON.parse(userData);
        console.log("Usuario logueado:", usuario);

        // Elementos del DOM
        const menuToggle = document.querySelector(".menu-toggle");
        const navLinks = document.querySelector(".nav-links");
        const usernameDisplay = document.getElementById("usernameDisplay");
        const logoutBtn = document.getElementById("logout");
        const clock = document.getElementById("clock");
        const breadcrumb = document.getElementById("breadcrumb");

        // Mostrar nombre de usuario
        if (usernameDisplay) {
            usernameDisplay.textContent = usuario.nombre || "Usuario";
        }

        // Configurar menú hamburguesa (solo para móviles)
        if (menuToggle && navLinks) {
            menuToggle.addEventListener("click", function () {
                navLinks.classList.toggle("active");
            });
        }

        // Cargar menú según rol
        if (usuario.rolId) {
            console.log("Cargando menú para rolId:", usuario.rolId);
            cargarMenu(usuario.rolId);
        } else {
            console.error("El usuario no tiene rolId definido");
        }

        // Configurar logout
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function (e) {
                e.preventDefault();
                localStorage.removeItem("loggedInUser");
                window.location.href = "/login";
            });
        }

        // Reloj digital
        function updateClock() {
            if (clock) {
                const now = new Date();
                const hours = now.getHours().toString().padStart(2, '0');
                const minutes = now.getMinutes().toString().padStart(2, '0');
                const seconds = now.getSeconds().toString().padStart(2, '0');
                const separator = now.getSeconds() % 2 === 0 ? ":" : " ";
                clock.innerHTML = `${hours}${separator}${minutes}${separator}${seconds}`;
            }
        }

        // Iniciar reloj
        setInterval(updateClock, 1000);
        updateClock();

        // Breadcrumb
        function generateBreadcrumb() {
            if (breadcrumb) {
                const path = window.location.pathname.split("/").filter(Boolean);
                let breadcrumbHTML = `<a href="/">Inicio</a>`;
                let currentPath = "";

                path.forEach((segment, index) => {
                    currentPath += `/${segment}`;
                    breadcrumbHTML += ` > <a href="${currentPath}">${segment}</a>`;
                });

                breadcrumb.innerHTML = breadcrumbHTML;
            }
        }

        generateBreadcrumb();

        // Configurar dropdowns para móviles
        const dropdowns = document.querySelectorAll(".dropdown, .dropdown-submenu");
        dropdowns.forEach(dropdown => {
            dropdown.addEventListener("click", function (e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const submenu = this.querySelector(".dropdown-menu, .dropdown-submenu");
                    if (submenu) {
                        submenu.classList.toggle("active");
                    }
                }
            });
        });

    } catch (error) {
        console.error("Error al procesar datos de usuario:", error);
        window.location.href = "/login";
    }
});

// Función para cargar el menú dinámico
function cargarMenu(rolId) {
    console.log(`Solicitando menú para rolId: ${rolId}`);

    fetch(`/auth/menu/${rolId}`)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar el menú');
            return response.json();
        })
        .then(modulos => {
            console.log('Módulos recibidos:', modulos);
            const navLinks = document.querySelector('.nav-links');
            if (!navLinks) return;

            navLinks.innerHTML = '';

            // Construir menú principal
            modulos.forEach(modulo => {
                if (modulo.puedeConsultar) {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = modulo.ruta || '#';

                    // Agregar clase dropdown si tiene hijos
                    if (modulo.hijos && modulo.hijos.length > 0) {
                        li.classList.add('dropdown');
                        a.classList.add('dropbtn');
                    }

                    a.innerHTML = `<i class="${modulo.icono}"></i> ${modulo.nombreModulo}`;
                    li.appendChild(a);

                    // Construir submenú si tiene hijos
                    if (modulo.hijos && modulo.hijos.length > 0) {
                        const submenu = document.createElement('ul');
                        submenu.classList.add('dropdown-menu');

                        modulo.hijos.forEach(hijo => {
                            if (hijo.puedeConsultar) {
                                const subLi = document.createElement('li');
                                const subA = document.createElement('a');
                                subA.href = hijo.ruta || '#';
                                subA.innerHTML = `<i class="${hijo.icono}"></i> ${hijo.nombreModulo}`;
                                subLi.appendChild(subA);
                                submenu.appendChild(subLi);
                            }
                        });

                        li.appendChild(submenu);
                    }

                    navLinks.appendChild(li);
                }
            });

            // Agregar logout al final
            const logoutLi = document.createElement('li');
            logoutLi.innerHTML = `<a href="#" id="logout"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</a>`;
            navLinks.appendChild(logoutLi);

            // Configurar evento de logout
            document.getElementById("logout").addEventListener("click", function (e) {
                e.preventDefault();
                localStorage.removeItem("loggedInUser");
                window.location.href = "/login";
            });
        })
        .catch(error => {
            console.error('Error al cargar el menú:', error);
            // Mostrar mensaje de error al usuario
            const errorContainer = document.getElementById('error-container') || document.createElement('div');
            errorContainer.id = 'error-container';
            errorContainer.style.color = 'red';
            errorContainer.style.padding = '10px';
            errorContainer.textContent = 'Error al cargar el menú. Por favor recarga la página.';
            document.body.prepend(errorContainer);
        });
}