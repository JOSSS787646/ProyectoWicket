document.addEventListener("DOMContentLoaded", function () {
    // Simulamos permisos (en un caso real vendrían del backend)
    const permisos = {
        puedeConsultar: true,
        puedeAgregar: false,    // Cambiar a true para probar
        puedeEditar: true,      // Este es el permiso que mencionaste
        puedeEliminar: false
    };

    // Obtener elementos del DOM
    const toolbar = document.getElementById('toolbar');
    const actionCells = document.querySelectorAll('.actions');
    const modal = document.getElementById('crudModal');
    const closeBtn = document.querySelector('.close');
    const form = document.getElementById('clienteForm');

    // Mostrar/ocultar elementos según permisos
    function aplicarPermisos() {
        // Barra de herramientas
        toolbar.innerHTML = '';

        if (permisos.puedeAgregar) {
            const addBtn = document.createElement('button');
            addBtn.className = 'btn btn-primary';
            addBtn.innerHTML = '<i class="fas fa-plus"></i> Agregar';
            addBtn.onclick = () => abrirModal('add');
            toolbar.appendChild(addBtn);
        }

        // Botones en cada fila de la tabla
        actionCells.forEach(cell => {
            cell.innerHTML = '';

            if (permisos.puedeEditar) {
                const editBtn = document.createElement('button');
                editBtn.className = 'btn btn-secondary btn-sm';
                editBtn.innerHTML = '<i class="fas fa-edit"></i>';
                editBtn.onclick = () => abrirModal('edit');
                cell.appendChild(editBtn);
            }

            if (permisos.puedeEliminar) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn btn-danger btn-sm';
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.onclick = eliminarCliente;
                cell.appendChild(deleteBtn);
            }

            if (permisos.puedeConsultar && !permisos.puedeEditar && !permisos.puedeEliminar) {
                const viewBtn = document.createElement('button');
                viewBtn.className = 'btn btn-info btn-sm';
                viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
                cell.appendChild(viewBtn);
            }
        });
    }

    // Funciones para el modal
    function abrirModal(action, data = null) {
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('clienteForm');

        if (action === 'add') {
            title.textContent = 'Nuevo Cliente Moral';
            form.reset();
        } else if (action === 'edit') {
            title.textContent = 'Editar Cliente Moral';
            // Aquí llenarías el formulario con los datos existentes
            document.getElementById('razonSocial').value = "Empresa Ejemplo S.A. de C.V.";
            document.getElementById('rfc').value = "EJE010101XXX";
            document.getElementById('contacto').value = "contacto@empresa.com";
        }

        modal.style.display = 'block';
    }

    function cerrarModal() {
        modal.style.display = 'none';
    }

    function eliminarCliente() {
        if (confirm('¿Estás seguro de eliminar este cliente?')) {
            alert('Cliente eliminado (esto es una simulación)');
        }
    }

    // Event listeners
    closeBtn.addEventListener('click', cerrarModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModal();
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        alert('Datos guardados (esto es una simulación)');
        cerrarModal();
    });

    // Aplicar los permisos al cargar la página
    aplicarPermisos();

    // Mostrar en consola los permisos actuales (para debug)
    console.log("Permisos actuales:", permisos);
    console.log("Solo debería verse el botón de Editar según los permisos configurados");
});