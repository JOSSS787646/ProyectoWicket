document.addEventListener("DOMContentLoaded", function () {
    // 1. CONFIGURACIÓN INICIAL (CAMBIAR ESTO)
    const config = {
        modulo: "NombreDelModulo",  // Ej: "Clientes Morales"
        permisos: {
            consultar: true,
            agregar: true,
            editar: true,
            eliminar: false
        },
        datosEjemplo: [
            { id: 1, campo1: "Ejemplo 1", campo2: "Ejemplo A" },
            { id: 2, campo1: "Ejemplo 2", campo2: "Ejemplo B" }
        ]
    };

    // 2. ELEMENTOS DEL DOM
    const toolbar = document.getElementById('toolbar');
    const actionCells = document.querySelectorAll('.actions');
    const modal = document.getElementById('crudModal');
    const form = document.getElementById('dataForm');

    // 3. FUNCIONES COMUNES (NO CAMBIAR)
    function aplicarPermisos() {
        // Toolbar
        toolbar.innerHTML = '';
        if (config.permisos.agregar) {
            toolbar.innerHTML = `
                <button class="btn btn-primary" onclick="abrirModal('nuevo')">
                    <i class="fas fa-plus"></i> Agregar
                </button>
            `;
        }

        // Acciones por fila
        actionCells.forEach((cell, index) => {
            cell.innerHTML = '';
            if (config.permisos.editar) {
                cell.innerHTML += `
                    <button class="btn btn-sm btn-secondary" onclick="abrirModal('editar', ${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                `;
            }
            if (config.permisos.eliminar) {
                cell.innerHTML += `
                    <button class="btn btn-sm btn-danger" onclick="eliminarRegistro(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
            }
        });
    }

    function abrirModal(accion, index = null) {
        document.getElementById('modalTitle').textContent =
            accion === 'nuevo' ? `Nuevo ${config.modulo}` : `Editar ${config.modulo}`;

        if (accion === 'editar') {
            const dato = config.datosEjemplo[index];
            document.getElementById('id').value = dato.id;
            document.getElementById('campo1').value = dato.campo1;
            document.getElementById('campo2').value = dato.campo2;
        } else {
            form.reset();
        }

        modal.style.display = 'block';
    }

    function cerrarModal() {
        modal.style.display = 'none';
    }

    function eliminarRegistro(index) {
        if (confirm(`¿Eliminar ${config.modulo} seleccionado?`)) {
            alert(`${config.modulo} eliminado (simulación)`);
            // Aquí iría la llamada AJAX para eliminar
        }
    }

    // 4. EVENTOS (NO CAMBIAR)
    document.querySelector('.close').addEventListener('click', cerrarModal);
    window.addEventListener('click', (e) => e.target === modal && cerrarModal());

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const accion = document.getElementById('id').value ? 'actualizado' : 'creado';
        alert(`${config.modulo} ${accion} correctamente (simulación)`);
        cerrarModal();
    });

    // 5. INICIALIZACIÓN (NO CAMBIAR)
    aplicarPermisos();
    console.log(`CRUD de ${config.modulo} cargado`);
});