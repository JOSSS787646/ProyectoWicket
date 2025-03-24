    document.addEventListener("DOMContentLoaded", function () {
        cargarUsuarios();
    });

    function cargarUsuarios() {
        cargarDatos("/auth/usuarios", (usuarios) => {
            const tbody = document.getElementById("usuariosTabla");
            tbody.innerHTML = ""; // Limpiar tabla antes de cargar

            usuarios.forEach(usuario => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${usuario.id}</td> 
                    <td>${usuario.nombre}</td> 
                    <td>${usuario.correo}</td> 
                    <td>${usuario.rol || 'Sin Rol'}</td>
                    <td>
                        <button class="btn-edit" onclick="editarUsuario(${usuario.id}, '${usuario.nombre}', '${usuario.correo}', '${usuario.rol || ''}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="eliminarUsuario(${usuario.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        });
    }
    function cargarDatos(url, callback) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error en la solicitud: ${response.statusText}`);
                }
                return response.json();
            })
            .then(callback)
            .catch(error => console.error("Error al cargar datos:", error));
    }
    function editarUsuario(id, nombre, correo, rol) {
        document.getElementById("editId").value = id;
        document.getElementById("editNombre").value = nombre;
        document.getElementById("editCorreo").value = correo;

        const selectRol = document.getElementById("editRol");
        selectRol.innerHTML = `<option value="">Cargando...</option>`;

        cargarDatos("/auth/roles", (roles) => {
            selectRol.innerHTML = roles.map(r =>
                `<option value="${r.id}" ${r.nombre === rol ? "selected" : ""}>${r.nombre}</option>`
            ).join("");
        });

        document.getElementById("editModal").style.display = "block";
    }
    function cerrarModal() {
        document.querySelectorAll(".modal").forEach(modal => {
            modal.style.display = "none";
        });
    }
    function eliminarUsuario(id) {
        if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
            fetch(`/auth/usuarios/${id}`, { method: "DELETE" })
                .then(response => {
                    if (response.ok) {
                        alert("Usuario eliminado correctamente");
                        cargarUsuarios(); // Recargar la tabla después de eliminar
                    } else {
                        alert("Error al eliminar usuario");
                    }
                })
                .catch(error => console.error("Error al eliminar usuario:", error));
        }
    }    
    function guardarNuevoRol() {
        const rolId = document.getElementById("rolId").value;
        const rolNombre = document.getElementById("rolNombre").value;

        // Validaciones de los campos
        if (!rolId || !rolNombre) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        // Convertir rolId a entero
        const rolIdParsed = parseInt(rolId);
        if (isNaN(rolIdParsed)) {
            alert("El ID del rol debe ser un número válido.");
            return;
        }

        // Hacer la solicitud POST para agregar el nuevo rol
        fetch("/auth/roles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: rolIdParsed, nombre: rolNombre })
        })
            .then(response => {
                if (response.ok) {
                    alert("Rol agregado correctamente");
                    cerrarModal(); // Cerrar el modal de agregar rol
                    cargarRoles(); // Actualizar la lista de roles
                } else {
                    // Si la respuesta no es OK, manejar el error
                    return response.text().then(text => {
                        alert("Error al agregar el rol: " + text);
                    });
                }
            })
            .catch(error => {
                // Si ocurre un error al hacer la solicitud
                console.error("Error al agregar el rol:", error);
                alert("Ocurrió un error al intentar agregar el rol.");
            });
    }
    function guardarEdicion() {
        const id = document.getElementById("editId").value;
        const nombre = document.getElementById("editNombre").value.trim();
        const correo = document.getElementById("editCorreo").value.trim();
        const rolId = document.getElementById("editRol").value;

        if (!id || !nombre || !correo || !rolId) {
            alert("Todos los campos son obligatorios.");
            return;
        }

        fetch(`/auth/usuarios/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre: nombre,
                correo: correo,
                rolId: parseInt(rolId)
            })
        })
            .then(response => {
                if (response.ok) {
                    alert("Usuario actualizado correctamente");
                    cerrarModal();
                    cargarUsuarios(); // Recargar la tabla automáticamente
                } else {
                    alert("Error al actualizar usuario");
                }
            })
            .catch(error => {
                console.error("Error al actualizar usuario:", error);
            });
}
    function cargarRoles() {
    fetch("/auth/roles")
        .then(response => response.json())
        .then(roles => {
            const tbody = document.getElementById("rolesTabla").querySelector("tbody");
            tbody.innerHTML = ""; // Limpiar tabla antes de cargar

            roles.forEach(rol => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${rol.id}</td>
                    <td>${rol.nombre}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(error => console.error("Error al cargar roles:", error));
}


    document.addEventListener("DOMContentLoaded", function () {
        cargarRoles();
    });

    // Mostrar modal para agregar usuario
    document.getElementById("btnAgregarUsuario").addEventListener("click", () => {
        cargarRoles();
        document.getElementById("modalAgregarUsuario").style.display = "block";
    });

    // Mostrar modal para agregar nuevo rol
    document.getElementById("btnAgregarRol").addEventListener("click", () => {
        document.getElementById("addRolModal").style.display = "block";
    });

    // Cerrar modal si se hace clic fuera de él
    window.onclick = function (event) {
        document.querySelectorAll(".modal").forEach(modal => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    };

    // Agregar usuario con validación
    document.getElementById("formAgregarUsuario").addEventListener("submit", async function (event) {
        event.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const rolId = document.getElementById("rolSelect").value;

        if (!nombre || !correo || !rolId) {
            alert("Todos los campos son obligatorios.");
            return;
        }

        try {
            const response = await fetch("/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Username: nombre, Email: correo, Password: "12345", RolId: parseInt(rolId) })
            });

            if (response.ok) {
                alert("Usuario agregado correctamente");
                cerrarModal();
                cargarUsuarios(); // Recargar la tabla automáticamente
            } else {
                alert("Error al agregar usuario");
            }
        } catch (error) {
            console.error("Error al agregar usuario:", error);
        }
    });

    document.getElementById("btnRegresar").addEventListener("click", function () {
        window.location.href = "/dashboard"; // Asegúrate de que la ruta sea correcta
    });

