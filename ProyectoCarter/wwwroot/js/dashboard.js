document.addEventListener("DOMContentLoaded", function () {
    console.log("Dashboard cargado");

    // 1. Verificar autenticación
    const userData = localStorage.getItem("loggedInUser");
    if (!userData) {
        window.location.href = "/login";
        return;
    }

    try {
        const usuario = JSON.parse(userData);
        console.log("Usuario logueado:", usuario);

        // 2. Configurar UI
        configurarUI(usuario);

        // 3. Iniciar reloj
        iniciarReloj();

        // 4. Cargar menú según rol
        if (usuario.rolId) {
            cargarMenu(usuario.rolId);
        }

    } catch (error) {
        console.error("Error:", error);
        window.location.href = "/login";
    }
});

// ========== FUNCIONES PRINCIPALES ========== //
function configurarUI(usuario) {
    // Mostrar nombre de usuario
    const usernameDisplay = document.getElementById("usernameDisplay");
    if (usernameDisplay) {
        usernameDisplay.textContent = usuario.nombre || "Usuario";
    }

    // Menú hamburguesa (mobile)
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", function () {
            navLinks.classList.toggle("active");
        });
    }
}
function iniciarReloj() {
    const clock = document.getElementById("clock");
    if (!clock) return;

    function actualizarReloj() {
        const ahora = new Date();
        const horas = ahora.getHours().toString().padStart(2, '0');
        const minutos = ahora.getMinutes().toString().padStart(2, '0');
        const segundos = ahora.getSeconds().toString().padStart(2, '0');
        const separador = ahora.getSeconds() % 2 === 0 ? ":" : " ";

        clock.innerHTML = `${horas}${separador}${minutos}${separador}${segundos}`;
    }

    actualizarReloj();
    setInterval(actualizarReloj, 1000);
}
function cargarMenu(rolId) {
    console.log(`Cargando menú para rol: ${rolId} `);

    fetch(`/auth/menu/${rolId}`)
        .then(response => {
            if (!response.ok) throw new Error("Error en la respuesta del servidor");
            return response.json();
        })
        .then(data => {
            console.group("ESTRUCTURA COMPLETA DEL MENÚ RECIBIDA:");
            console.log("Total módulos recibidos:", data.length);
            console.log("Detalle completo:", data);

            // Lista plana de todos los módulos con acceso
            const allModules = [];
            const flattenModules = (modules, level = 0) => {
                modules.forEach(mod => {
                    allModules.push({
                        level,
                        id: mod.id,
                        nombre: mod.nombreModulo,
                        ruta: mod.ruta,
                        padre: mod.moduloPadreId
                    });
                    if (mod.hijos && mod.hijos.length) flattenModules(mod.hijos, level + 1);
                });
            };

            flattenModules(data);
            console.groupCollapsed("LISTA PLANA DE MÓDULOS CON ACCESO");
            console.table(allModules);
            console.groupEnd();

            construirMenu(data);
            configurarDropdownsMobile();
        })
        .catch(error => {
            console.error("Error al cargar menú:", error);
            mostrarError("Error al cargar el menú. Intenta recargar la página.");
        });
}

// ========== FUNCIONES DE MENÚ ========== //

function fetchMenuFromBackend(rolId) {
    fetch(`/auth/menu/${rolId}`)
        .then(response => {
            if (!response.ok) throw new Error("Error en la respuesta del servidor");
            return response.json();
        })
        .then(data => {
            construirMenu(data);
            configurarDropdownsMobile(); // Configurar eventos después de crear el menú
        })
        .catch(error => {
            console.error("Error al cargar menú:", error);
            mostrarError("Error al cargar el menú. Intenta recargar la página.");
        });
}
function fetchMenuMockData() {
    // Datos de ejemplo con estructura completa
    const mockData = [
        {
            id: 1,
            nombreModulo: "Dashboard",
            ruta: "/dashboard",
            icono: "fas fa-home",
            moduloPadreId: null,
            puedeConsultar: true
        },
        {
            id: 2,
            nombreModulo: "Administrar",
            ruta: "#",
            icono: "fas fa-user-shield",
            moduloPadreId: null,
            puedeConsultar: true,
            hijos: [
                {
                    id: 21,
                    nombreModulo: "Usuarios",
                    ruta: "/Views/usuarios.html",
                    icono: "fas fa-users",
                    moduloPadreId: 2,
                    puedeConsultar: true
                },
                {
                    id: 22,
                    nombreModulo: "Perfiles",
                    ruta: "/Views/perfiles.html",
                    icono: "fas fa-id-badge",
                    moduloPadreId: 2,
                    puedeConsultar: true
                }
            ]
        },
        {
            id: 3,
            nombreModulo: "Personas",
            ruta: "#",
            icono: "fas fa-users",
            moduloPadreId: null,
            puedeConsultar: true,
            hijos: [
                {
                    id: 31,
                    nombreModulo: "Cliente",
                    ruta: "#",
                    icono: "fas fa-user-tie",
                    moduloPadreId: 3,
                    puedeConsultar: true,
                    hijos: [
                        {
                            id: 311,
                            nombreModulo: "Física",
                            ruta: "/Views/clienteFisica.html",
                            icono: "fas fa-circle",
                            moduloPadreId: 31,
                            puedeConsultar: true
                        },
                        {
                            id: 312,
                            nombreModulo: "Moral",
                            ruta: "/Views/clienteMoral.html",
                            icono: "fas fa-circle",
                            moduloPadreId: 31,
                            puedeConsultar: true
                        }
                    ]
                }
            ]
        }
    ];

    construirMenu(mockData);
    configurarDropdownsMobile(); // Configurar eventos después de crear el menú
}
function construirMenu(modulos) {
    const navLinks = document.querySelector(".nav-links");
    if (!navLinks) return;

    navLinks.innerHTML = '';

    // Construir estructura del menú considerando permisos directos o hijos con permisos
    modulos.forEach(modulo => {
        if (tienePermiso(modulo)) {  // Usamos la nueva función de verificación
            const itemMenu = crearItemMenu(modulo);
            if (itemMenu) navLinks.appendChild(itemMenu);
        }
    });

    // Agregar elementos adicionales
    agregarBotonLogout(navLinks);
    agregarUsuario(navLinks);
}
function crearItemMenu(modulo) {
    const li = document.createElement("li");
    const a = document.createElement("a");

    // Configurar enlace principal
    a.href = modulo.ruta || "#";
    a.innerHTML = `<i class="${modulo.icono || 'fas fa-circle'}"></i> <span class="menu-text">${modulo.nombreModulo}</span>`;

    // Verificar si tiene hijos con permisos (usando la nueva función)
    const tieneHijosConPermiso = modulo.hijos && modulo.hijos.some(hijo => tienePermiso(hijo));

    if (tieneHijosConPermiso) {
        li.classList.add("dropdown");
        a.classList.add("dropbtn");
        a.innerHTML += ' <i class="fas fa-chevron-down dropdown-arrow"></i>';

        const submenu = document.createElement("ul");
        submenu.classList.add("dropdown-menu");

        modulo.hijos.forEach(hijo => {
            if (tienePermiso(hijo)) {  // Solo agregar hijos con permisos
                const itemHijo = crearItemMenu(hijo);
                if (itemHijo) submenu.appendChild(itemHijo);
            }
        });

        // Solo añadir submenu si tiene hijos válidos
        if (submenu.children.length > 0) {
            li.appendChild(a);
            li.appendChild(submenu);
        } else {
            li.appendChild(a);
        }
    } else {
        li.appendChild(a);
    }

    return li;
}
function agregarBotonLogout(container) {
    const logoutLi = document.createElement("li");
    logoutLi.innerHTML = `
        <a href="#" id="logout-btn">
            <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
        </a>
    `;

    container.appendChild(logoutLi);

    // Configurar evento de logout
    document.getElementById("logout-btn").addEventListener("click", function (e) {
        e.preventDefault();
        localStorage.removeItem("loggedInUser");
        window.location.href = "/login";
    });
}
function agregarUsuario(container) {
    const userData = localStorage.getItem("loggedInUser");
    if (!userData) return;

    try {
        const usuario = JSON.parse(userData);
        const userLi = document.createElement("li");
        userLi.id = "userDisplay";
        userLi.innerHTML = `
            <i class="fas fa-user"></i> <span id="usernameDisplay">${usuario.nombre || "Usuario"}</span>
        `;
        container.appendChild(userLi);
    } catch (error) {
        console.error("Error al mostrar usuario:", error);
    }
}
function mostrarError(mensaje) {
    const errorContainer = document.createElement("div");
    errorContainer.className = "error-message";
    errorContainer.style.color = "red";
    errorContainer.style.padding = "10px";
    errorContainer.style.margin = "10px";
    errorContainer.style.border = "1px solid red";
    errorContainer.textContent = mensaje;

    document.body.prepend(errorContainer);
}
function configurarDropdownsMobile() {
    const dropdowns = document.querySelectorAll(".dropdown");
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener("click", function (e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const submenu = this.querySelector(".dropdown-menu");
                if (submenu) {
                    submenu.classList.toggle("active");
                }
            }
        });
    });
}
function tienePermiso(modulo) {
    // Verifica permisos directos del módulo
    const permisosDirectos = modulo.puedeConsultar || modulo.puedeAgregar ||
        modulo.puedeEditar || modulo.puedeEliminar;

    // Verifica permisos en hijos recursivamente
    const hijosConPermiso = modulo.hijos && modulo.hijos.some(hijo => tienePermiso(hijo));

    return permisosDirectos || hijosConPermiso;
}