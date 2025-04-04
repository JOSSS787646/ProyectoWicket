// wwwroot/js/crud/mantenimientoTaladros.js
class MantenimientoTaladrosCRUD extends CRUDDynamic {
    constructor() {
        super('MantenimientoTaladros', 'tblMantenimientoTaladros', 'formMantenimientoTaladros', {
            hasStatus: true
        });
        this.mockData = [
            { id: 1, modelo: 'T-500', numeroSerie: 'SN54321', ultimoMantenimiento: '2023-06-20', proximoMantenimiento: '2023-12-20', responsable: 'Carlos López', status: 'En reparación' }
        ];
    }

    loadData() {
        const tbody = document.querySelector(`#${this.tableId} tbody`);
        tbody.innerHTML = '';

        this.mockData.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.id}</td>
                <td>${item.modelo}</td>
                <td>${item.numeroSerie}</td>
                <td>${item.ultimoMantenimiento}</td>
                <td>${item.proximoMantenimiento}</td>
                <td>${item.responsable}</td>
                ${this.options.hasStatus ? `<td><span class="badge ${item.status === 'Operativo' ? 'bg-success' : 'bg-warning'}">${item.status}</span></td>` : ''}
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
    window.crud = new MantenimientoTaladrosCRUD();
});