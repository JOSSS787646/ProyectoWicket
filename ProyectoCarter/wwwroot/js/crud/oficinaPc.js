// wwwroot/js/crud/oficinaPc.js
class OficinaPcCRUD extends CRUDDynamic {
    constructor() {
        super('OficinaPc', 'tblOficinaPc', 'formOficinaPc', {
            hasStatus: true
        });
        this.mockData = [
            { id: 1, marca: 'Dell', modelo: 'OptiPlex 7080', numeroSerie: 'SNPC123', asignadoA: 'Ana Martínez', departamento: 'Contabilidad', status: 'En uso' }
        ];
    }

    loadData() {
        const tbody = document.querySelector(`#${this.tableId} tbody`);
        tbody.innerHTML = '';

        this.mockData.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.id}</td>
                <td>${item.marca}</td>
                <td>${item.modelo}</td>
                <td>${item.numeroSerie}</td>
                <td>${item.asignadoA}</td>
                <td>${item.departamento}</td>
                ${this.options.hasStatus ? `<td><span class="badge ${item.status === 'En uso' ? 'bg-success' : item.status === 'En mantenimiento' ? 'bg-warning' : 'bg-secondary'}">${item.status}</span></td>` : ''}
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
    window.crud = new OficinaPcCRUD();
});