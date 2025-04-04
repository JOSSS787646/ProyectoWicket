// wwwroot/js/crud/proveedorFisica.js
class ProveedorFisicaCRUD extends CRUDDynamic {
    constructor() {
        super('ProveedorFisica', 'tblProveedoresFisica', 'formProveedorFisica', {
            hasStatus: true
        });
        this.mockData = [
            { id: 1, nombre: 'Luis Martínez', rfc: 'MALX800101', especialidad: 'Electricista', telefono: '5551112233', email: 'luis@electricista.com', status: 'Activo' }
        ];
    }

    loadData() {
        const tbody = document.querySelector(`#${this.tableId} tbody`);
        tbody.innerHTML = '';

        this.mockData.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.id}</td>
                <td>${item.nombre}</td>
                <td>${item.rfc}</td>
                <td>${item.especialidad}</td>
                <td>${item.telefono}</td>
                <td>${item.email}</td>
                ${this.options.hasStatus ? `<td><span class="badge ${item.status === 'Activo' ? 'bg-success' : 'bg-secondary'}">${item.status}</span></td>` : ''}
                <td class="action-column">
                    ${this.currentPermissions.canEdit ?
                    `<button class="btn btn-sm btn-warning btn-edit" data-id="${item.id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>` : ''
                }
                    ${this.currentPermissions.canDelete ?
                    `<button class="btn btn-sm btn-danger btn-delete ms-2" data-id="${item.id}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>` : ''
                }
                </td>
            `;
            tbody.appendChild(tr);
        });

        this.setupRowEvents();
    }

    // ... (otros métodos similares)
}

document.addEventListener("DOMContentLoaded", function () {
    window.crud = new ProveedorFisicaCRUD();
});