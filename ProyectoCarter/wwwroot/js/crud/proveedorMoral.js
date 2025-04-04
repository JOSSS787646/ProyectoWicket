// wwwroot/js/crud/proveedorMoral.js
class ProveedorMoralCRUD extends CRUDDynamic {
    constructor() {
        super('ProveedorMoral', 'tblProveedoresMoral', 'formProveedorMoral');
        this.mockData = [
            { id: 1, razonSocial: 'Suministros Industriales SA', rfc: 'SIS850101', giro: 'Materiales de construcción', telefono: '5554445566', email: 'ventas@suministros.com' }
        ];
    }

    loadData() {
        const tbody = document.querySelector(`#${this.tableId} tbody`);
        tbody.innerHTML = '';

        this.mockData.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.id}</td>
                <td>${item.razonSocial}</td>
                <td>${item.rfc}</td>
                <td>${item.giro}</td>
                <td>${item.telefono}</td>
                <td>${item.email}</td>
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
    window.crud = new ProveedorMoralCRUD();
});