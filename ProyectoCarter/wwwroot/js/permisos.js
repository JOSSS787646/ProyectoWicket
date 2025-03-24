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
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar módulos');
                return response.json();
            })
            .then(data => {
                console.log("Respuesta cruda:", data);
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
                        <td>${modulo.nombre}</td>
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
            const moduloId = fila.dataset.moduloId;

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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(permisosAGuardar)
        })
            .then(response => {
                if (!response.ok) throw new Error('Error al guardar permisos');
                return response.json();
            })
            .then(() => {
                mostrarAlerta('Permisos guardados correctamente', 'success');
                cargarPermisosRol(rolSeleccionado); // Recargar para actualizar
            })
            .catch(error => {
                console.error('Error:', error);
                mostrarAlerta('Error al guardar los permisos', 'danger');
            });
    }

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