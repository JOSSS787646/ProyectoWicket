document.addEventListener("DOMContentLoaded", function () {
    // Cargar lo que corresponda según la página
    if (document.getElementById('usuariosTabla')) {
        cargarUsuarios();
    }
    if (document.getElementById('rolesBody') || document.getElementById('rolSelect')) {
        cargarRoles();
    }

    // Configurar eventos según los elementos presentes
    const btnAgregarUsuario = document.getElementById("btnAgregarUsuario");
    if (btnAgregarUsuario) {
        btnAgregarUsuario.addEventListener("click", async () => {
            try {
                await cargarRoles();
                document.getElementById("modalAgregarUsuario").style.display = "block";
            } catch (error) {
                console.error("Error al cargar roles:", error);
            }
        });
    }

    const btnAgregarRol = document.getElementById("btnAgregarRol");
    if (btnAgregarRol) {
        btnAgregarRol.addEventListener("click", () => {
            document.getElementById("addRolModal").style.display = "block";
        });
    }

    const formAgregarUsuario = document.getElementById("formAgregarUsuario");
    if (formAgregarUsuario) {
        formAgregarUsuario.addEventListener("submit", async function (event) {
            event.preventDefault();
            const nombre = document.getElementById("nombre").value.trim();
            const correo = document.getElementById("correo").value.trim();
            const password = document.getElementById("password").value;
            const rolId = document.getElementById("rolSelect").value;

            if (!nombre || !correo || !password || !rolId) {
                alert("Todos los campos son obligatorios.");
                return;
            }

            if (password.length < 6) {
                alert("La contraseña debe tener al menos 6 caracteres.");
                return;
            }

            try {
                const response = await fetch("/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        Username: nombre,
                        Email: correo,
                        Password: password,
                        RolId: parseInt(rolId)
                    })
                });

                if (response.ok) {
                    alert("Usuario agregado correctamente");
                    cerrarModal();
                    cargarUsuarios();
                } else {
                    alert("Error al agregar usuario");
                }
            } catch (error) {
                console.error("Error al agregar usuario:", error);
            }
        });
    }

    const btnRegresar = document.getElementById("btnRegresar");
    if (btnRegresar) {
        btnRegresar.addEventListener("click", function () {
            window.location.href = "/dashboard";
        });
    }

    // Cerrar modal al hacer clic fuera
    window.addEventListener("click", function (event) {
        if (event.target.classList.contains("modal")) {
            cerrarModal();
        }
    });
});

function cargarUsuarios() {
    if (!document.getElementById('usuariosTabla')) return;

    cargarDatos("/auth/usuarios", (usuarios) => {
        const tbody = document.getElementById("usuariosTabla");
        tbody.innerHTML = "";

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
        .catch(error => {
            console.error("Error al cargar datos:", error);
            if (document.getElementById('usuariosTabla')) {
                alert("Error al cargar datos");
            }
        });
}

function editarUsuario(id, nombre, correo, rol) {
    if (!document.getElementById('editModal')) return;

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
                    cargarUsuarios();
                } else {
                    alert("Error al eliminar usuario");
                }
            })
            .catch(error => console.error("Error al eliminar usuario:", error));
    }
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
                cargarUsuarios();
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
            // Cargar en select de agregar usuario (si existe)
            const rolSelect = document.getElementById("rolSelect");
            if (rolSelect) {
                rolSelect.innerHTML = roles.map(rol =>
                    `<option value="${rol.id}">${rol.nombre}</option>`
                ).join("");
            }

            // Cargar en select de editar usuario (si existe)
            const editRol = document.getElementById("editRol");
            if (editRol) {
                editRol.innerHTML = roles.map(rol =>
                    `<option value="${rol.id}">${rol.nombre}</option>`
                ).join("");
            }

            // Cargar en tabla de roles (si existe)
            const rolesBody = document.getElementById("rolesBody");
            if (rolesBody) {
                rolesBody.innerHTML = "";
                roles.forEach(rol => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${rol.id}</td>
                        <td>${rol.nombre}</td>
                    `;
                    rolesBody.appendChild(tr);
                });
            }
        })
        .catch(error => {
            console.error("Error al cargar roles:", error);
            if (document.getElementById('rolesBody')) {
                alert("Error al cargar los roles");
            }
        });
}

function editarRol(id, nombre) {
    const nuevoNombre = prompt("Editar nombre del rol:", nombre);
    if (nuevoNombre !== null && nuevoNombre !== nombre) {
        fetch(`/auth/roles/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: nuevoNombre })
        })
            .then(response => {
                if (response.ok) {
                    alert("Rol actualizado correctamente");
                    cargarRoles();
                } else {
                    alert("Error al actualizar rol");
                }
            })
            .catch(error => console.error("Error al editar rol:", error));
    }
}

function eliminarRol(id) {
    if (confirm("¿Estás seguro de eliminar este rol?")) {
        fetch(`/auth/roles/${id}`, { method: "DELETE" })
            .then(response => {
                if (response.ok) {
                    alert("Rol eliminado correctamente");
                    cargarRoles();
                } else {
                    alert("Error al eliminar rol");
                }
            })
            .catch(error => console.error("Error al eliminar rol:", error));
    }
}

function guardarNuevoRol() {
    const rolId = document.getElementById("rolId").value;
    const rolNombre = document.getElementById("rolNombre").value;

    if (!rolId || !rolNombre) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    const rolIdParsed = parseInt(rolId);
    if (isNaN(rolIdParsed)) {
        alert("El ID del rol debe ser un número válido.");
        return;
    }

    fetch("/auth/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rolIdParsed, nombre: rolNombre })
    })
        .then(response => {
            if (response.ok) {
                alert("Rol agregado correctamente");
                cerrarModal();
                cargarRoles();
            } else {
                return response.text().then(text => {
                    alert("Error al agregar el rol: " + text);
                });
            }
        })
        .catch(error => {
            console.error("Error al agregar el rol:", error);
            alert("Ocurrió un error al intentar agregar el rol.");
        });
}