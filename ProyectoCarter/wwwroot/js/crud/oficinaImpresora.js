// wwwroot/js/crud/oficinaImpresora.js
class OficinaImpresoraCRUD extends CRUDDynamic {
    constructor() {
        super('OficinaImpresora', 'tblOficinaImpresora', 'formOficinaImpresora', {
            hasStatus: true
        });
        this.mockData = [
            { id: 1, marca: 'HP', modelo: 'LaserJet Pro M404dn', numeroSerie: 'SNIMP456', ubicacion: 'Oficina Principal', tipo: 'Láser', status: 'Operativa' }
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
                <td>${item.ubicacion}</td>
                <td>${item.tipo}</td>
                ${this.options.hasStatus ? `<td><span class="badge ${item.status === 'Operativa' ? 'bg-success' : 'bg-warning'}">${item.status}</span></td>` : ''}
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
    window.crud = new OficinaImpresoraCRUD();
});