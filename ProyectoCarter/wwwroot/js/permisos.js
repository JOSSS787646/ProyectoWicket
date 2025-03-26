document.addEventListener("DOMContentLoaded", function () {
    // Variables globales
    let roles = [];
    let modulos = [];
    let permisosActuales = {};
    let rolSeleccionado = null;

    // Inicializar la pantalla
    cargarRoles();
    cargarModulos();

    // Evento para selección de rol
    document.getElementById('selectRol').addEventListener('change', function () {
        rolSeleccionado = this.value;
        if (rolSeleccionado) {
            cargarPermisosRol(rolSeleccionado);
            document.getElementById('btnGuardar').disabled = false;
        } else {
            document.getElementById('btnGuardar').disabled = true;
            limpiarTabla();
        }
    });

    // Evento para guardar permisos
    document.getElementById('btnGuardar').addEventListener('click', function () {
        if (validarCambios()) {
            if (confirm("¿Está seguro que desea guardar los cambios de permisos para este rol?")) {
                guardarPermisos();
            }
        } else {
            mostrarAlerta('No hay cambios para guardar', 'info');
        }
    });

    // Evento para regresar
    document.getElementById('btnRegresar').addEventListener('click', function () {
        window.location.href = "/admin";
    });

    // Cargar roles desde la API
    function cargarRoles() {
        fetch('/auth/roles')
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar roles');
                return response.json();
            })
            .then(data => {
                roles = data;
                const select = document.getElementById('selectRol');
                select.innerHTML = '<option value="">-- Seleccione un rol --</option>';
                roles.forEach(rol => {
                    const option = document.createElement('option');
                    option.value = rol.id;
                    option.textContent = rol.nombre;
                    select.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error:', error);
                mostrarAlerta('Error al cargar los roles', 'danger');
            });
    }

    // Cargar módulos desde la API
    function cargarModulos() {
        fetch('/auth/modulos')
            .then(response => response.json())
            .then(data => {
                console.log("Módulos con CRUD recibidos:", data);
                modulos = data;
            })
            .catch(error => {
                console.error('Error:', error);
                mostrarAlerta('Error al cargar los módulos', 'danger');
            });
    }

    // Cargar permisos del rol seleccionado
    function cargarPermisosRol(rolId) {
        fetch(`/auth/permisos/${rolId}`)
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar permisos');
                return response.json();
            })
            .then(data => {
                permisosActuales = {};
                const tbody = document.getElementById('tblPermisos');
                tbody.innerHTML = '';

                modulos.forEach(modulo => {
                    const permiso = data.find(p => p.moduloId === modulo.id) || {
                        puedeConsultar: false,
                        puedeAgregar: false,
                        puedeEditar: false,
                        puedeEliminar: false,
                        puedeExportar: false,
                        puedeVerBitacora: false
                    };

                    permisosActuales[modulo.id] = permiso;

                    const tr = document.createElement('tr');
                    tr.className = 'module-row';
                    tr.dataset.moduloId = modulo.id;

                    tr.innerHTML = `
                        <td>${modulo.nombreModulo}</td>
                        <td class="checkbox-cell">
                            <input type="checkbox" class="form-check-input permiso-checkbox" data-permiso="consultar" ${permiso.puedeConsultar ? 'checked' : ''}>
                        </td>
                        <td class="checkbox-cell">
                            <input type="checkbox" class="form-check-input permiso-checkbox" data-permiso="agregar" ${permiso.puedeAgregar ? 'checked' : ''}>
                        </td>
                        <td class="checkbox-cell">
                            <input type="checkbox" class="form-check-input permiso-checkbox" data-permiso="editar" ${permiso.puedeEditar ? 'checked' : ''}>
                        </td>
                        <td class="checkbox-cell">
                            <input type="checkbox" class="form-check-input permiso-checkbox" data-permiso="eliminar" ${permiso.puedeEliminar ? 'checked' : ''}>
                        </td>
                        <td class="checkbox-cell">
                            <input type="checkbox" class="form-check-input permiso-checkbox" data-permiso="exportar" ${permiso.puedeExportar ? 'checked' : ''}>
                        </td>
                        <td class="checkbox-cell">
                            <input type="checkbox" class="form-check-input permiso-checkbox" data-permiso="bitacora" ${permiso.puedeVerBitacora ? 'checked' : ''}>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            })
            .catch(error => {
                console.error('Error:', error);
                mostrarAlerta('Error al cargar los permisos', 'danger');
            });
    }

    // Limpiar la tabla
    function limpiarTabla() {
        document.getElementById('tblPermisos').innerHTML = '';
    }

    // Validar si hay cambios
    function validarCambios() {
        const filas = document.querySelectorAll('.module-row');
        for (const fila of filas) {
            const moduloId = fila.dataset.moduloId;
            const permisoOriginal = permisosActuales[moduloId];

            const permisoActual = {
                puedeConsultar: fila.querySelector('[data-permiso="consultar"]').checked,
                puedeAgregar: fila.querySelector('[data-permiso="agregar"]').checked,
                puedeEditar: fila.querySelector('[data-permiso="editar"]').checked,
                puedeEliminar: fila.querySelector('[data-permiso="eliminar"]').checked,
                puedeExportar: fila.querySelector('[data-permiso="exportar"]').checked,
                puedeVerBitacora: fila.querySelector('[data-permiso="bitacora"]').checked
            };

            if (JSON.stringify(permisoOriginal) !== JSON.stringify(permisoActual)) {
                return true;
            }
        }
        return false;
    }

    // Guardar permisos en la API
    function guardarPermisos() {
        const permisosAGuardar = [];
        const filas = document.querySelectorAll('.module-row');

        filas.forEach(fila => {
            const moduloId = parseInt(fila.dataset.moduloId); // Asegurar que es número

            permisosAGuardar.push({
                moduloId: moduloId,
                puedeConsultar: fila.querySelector('[data-permiso="consultar"]').checked,
                puedeAgregar: fila.querySelector('[data-permiso="agregar"]').checked,
                puedeEditar: fila.querySelector('[data-permiso="editar"]').checked,
                puedeEliminar: fila.querySelector('[data-permiso="eliminar"]').checked,
                puedeExportar: fila.querySelector('[data-permiso="exportar"]').checked,
                puedeVerBitacora: fila.querySelector('[data-permiso="bitacora"]').checked
            });
        });

        fetch(`/auth/permisos/${rolSeleccionado}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(permisosAGuardar)
        })
            .then(async response => {
                const contentType = response.headers.get('content-type');

                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('La respuesta no es JSON');
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error HTTP: ${response.status}`);
                }

                return response.json();
            })
            .then(data => {
                if (data.success) {
                    mostrarAlerta(data.message, 'success');
                    cargarPermisosRol(rolSeleccionado);
                } else {
                    throw new Error(data.message || 'Error al guardar permisos');
                }
            })
            .catch(error => {
                console.error('Error al guardar permisos:', error);
                mostrarAlerta(error.message || 'Error al guardar los permisos', 'danger');
            });
    }

    function cargarMenu() {
        fetch('/auth/modulos/jerarquia')
            .then(response => response.json())
            .then(modulos => {
                const navLinks = document.querySelector('.nav-links');
                navLinks.innerHTML = ''; // Limpiar menú existente

                // Agregar Dashboard
                const dashboard = modulos.find(m => m.NombreModulo === 'Dashboard');
                if (dashboard) {
                    navLinks.appendChild(crearItemMenu(dashboard));
                }

                // Procesar módulos con hijos (dropdowns)
                modulos.filter(m => m.Hijos && m.Hijos.length > 0).forEach(modulo => {
                    const li = document.createElement('li');
                    li.className = 'dropdown';

                    const dropbtn = document.createElement('a');
                    dropbtn.href = modulo.Ruta || '#';
                    dropbtn.className = 'dropbtn';
                    dropbtn.innerHTML = `<i class="${modulo.Icono}"></i> ${modulo.NombreModulo} <i class="fas fa-caret-down"></i>`;

                    const dropdownMenu = document.createElement('ul');
                    dropdownMenu.className = 'dropdown-menu';

                    modulo.Hijos.forEach(hijo => {
                        if (hijo.Hijos && hijo.Hijos.length > 0) {
                            // Submenú anidado
                            const submenuItem = document.createElement('li');
                            submenuItem.className = 'dropdown-submenu';

                            const submenuLink = document.createElement('a');
                            submenuLink.href = hijo.Ruta || '#';
                            submenuLink.innerHTML = `<i class="${hijo.Icono}"></i> ${hijo.NombreModulo} <i class="fas fa-caret-right"></i>`;

                            const submenu = document.createElement('ul');
                            submenu.className = 'dropdown-menu';

                            hijo.Hijos.forEach(subhijo => {
                                submenu.appendChild(crearItemMenu(subhijo, true));
                            });

                            submenuItem.appendChild(submenuLink);
                            submenuItem.appendChild(submenu);
                            dropdownMenu.appendChild(submenuItem);
                        } else {
                            // Item simple
                            dropdownMenu.appendChild(crearItemMenu(hijo));
                        }
                    });

                    li.appendChild(dropbtn);
                    li.appendChild(dropdownMenu);
                    navLinks.appendChild(li);
                });

                // Agregar logout y usuario
                const logoutLi = document.createElement('li');
                logoutLi.innerHTML = `<a href="#" id="logout"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</a>`;
                navLinks.appendChild(logoutLi);

                const userLi = document.createElement('li');
                userLi.id = 'userDisplay';
                userLi.innerHTML = `<i class="fas fa-user"></i> <span id="usernameDisplay"></span>`;
                navLinks.appendChild(userLi);
            });
    }

    function crearItemMenu(modulo, isSubitem = false) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = modulo.Ruta;
        a.innerHTML = isSubitem
            ? `<i class="${modulo.Icono}"></i> ${modulo.NombreModulo}`
            : `<i class="${modulo.Icono}"></i> ${modulo.NombreModulo}`;
        li.appendChild(a);
        return li;
    }

    // Llamar al cargar la página
    document.addEventListener('DOMContentLoaded', cargarMenu);
    // Mostrar alerta
    function mostrarAlerta(mensaje, tipo) {
        const alerta = document.createElement('div');
        alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
        alerta.role = 'alert';
        alerta.innerHTML = `
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        const cardBody = document.querySelector('.card-body');
        cardBody.insertBefore(alerta, cardBody.firstChild);

        setTimeout(() => {
            alerta.classList.remove('show');
            setTimeout(() => alerta.remove(), 150);
        }, 5000);
    }
});