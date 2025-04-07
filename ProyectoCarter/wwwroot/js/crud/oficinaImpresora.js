const crud = {
    impresoras: [],
    permisos: {
        puedeConsultar: false,
        puedeAgregar: false,
        puedeEditar: false,
        puedeEliminar: false,
        puedeExportar: false,
        puedeVerBitacora: false
    },

    async init() {
        try {
            await this.waitForDOMReady();
            await this.cargarPermisos();

            if (!this.permisos.puedeConsultar) {
                document.getElementById("noAccessMessage").style.display = "block";
                document.getElementById("tblOficinaImpresora").style.display = "none";
                document.getElementById("btnAdd").style.display = "none";
                return;
            }

            if (!localStorage.getItem("impresoras")) {
                localStorage.setItem("impresoras", JSON.stringify([
                    { id: 1, marca: "HP", modelo: "LaserJet Pro", serial: "HP123", ubicacion: "Oficina 101", tipo: "Láser" },
                    { id: 2, marca: "Epson", modelo: "WorkForce", serial: "EPS456", ubicacion: "Recepción", tipo: "Inyección" }
                ]));
            }

            this.loadItems();
            document.getElementById("btnAdd").style.display = this.permisos.puedeAgregar ? "block" : "none";
        } catch (error) {
            console.error("Error inicializando CRUD:", error);
            this.showError("Error al inicializar la página: " + error.message);
        }
    },

    waitForDOMReady() {
        return new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('DOMContentLoaded', resolve);
            }
        });
    },

    showError(message) {
        const errorDiv = document.createElement("div");
        errorDiv.className = "alert alert-danger m-3";
        errorDiv.textContent = message;
        document.body.prepend(errorDiv);
    },

    async cargarPermisos() {
        try {
            const response = await fetch('/auth/permisos-modulo/Impresora', {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

            const data = await response.json();
            console.log(`[${this.moduleName}] Permisos recibidos:`, JSON.stringify(data, null, 2));

            this.permisos = {
                puedeConsultar: data.PuedeConsultar || false,
                puedeAgregar: data.PuedeAgregar || false,
                puedeEditar: data.PuedeEditar || false,
                puedeEliminar: data.PuedeEliminar || false,
                puedeExportar: data.PuedeExportar || false,
                puedeVerBitacora: data.PuedeVerBitacora || false
            };
        } catch (error) {
            console.error("Error cargando permisos:", error);
            throw error;
        }
    },

    loadItems() {
        try {
            const impresorasStr = localStorage.getItem("impresoras");
            this.impresoras = impresorasStr ? JSON.parse(impresorasStr) : [];

            const tbody = document.getElementById("impresorasBody");
            if (!tbody) throw new Error("Elemento 'impresorasBody' no encontrado");

            tbody.innerHTML = "";

            if (this.impresoras.length === 0) {
                const tr = document.createElement("tr");
                tr.innerHTML = `<td colspan="7" class="text-center">No hay impresoras registradas</td>`;
                tbody.appendChild(tr);
                return;
            }

            this.impresoras.forEach(impresora => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${impresora.id}</td>
                    <td>${impresora.marca}</td>
                    <td>${impresora.modelo}</td>
                    <td>${impresora.serial}</td>
                    <td>${impresora.ubicacion}</td>
                    <td>${impresora.tipo}</td>
                    <td class="action-column">
                        ${this.permisos.puedeEditar ?
                        `<button class="btn btn-warning btn-sm" onclick="crud.editItem(${impresora.id})">
                            <i class="fas fa-edit"></i>
                        </button>` : ''}
                        ${this.permisos.puedeEliminar ?
                        `<button class="btn btn-danger btn-sm" onclick="crud.deleteItem(${impresora.id})">
                            <i class="fas fa-trash"></i>
                        </button>` : ''}
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error("Error en loadItems:", error);
            throw error;
        }
    },

    openModal(id = null) {
        document.getElementById("formOficinaImpresora").reset();
        document.getElementById("impresoraId").value = id ?? "";
        document.getElementById("modalTitle").textContent = id ? "Editar Impresora" : "Nueva Impresora";
        new bootstrap.Modal(document.getElementById("oficinaImpresoraModal")).show();
    },

    saveItem() {
        const id = document.getElementById("impresoraId").value;
        const nuevaImpresora = {
            id: id ? parseInt(id) : this.impresoras.length + 1,
            marca: document.getElementById("marca").value,
            modelo: document.getElementById("modelo").value,
            serial: document.getElementById("serial").value,
            ubicacion: document.getElementById("ubicacion").value,
            tipo: document.getElementById("tipo").value
        };

        if (id) {
            this.impresoras = this.impresoras.map(impresora => impresora.id == id ? nuevaImpresora : impresora);
        } else {
            this.impresoras.push(nuevaImpresora);
        }

        localStorage.setItem("impresoras", JSON.stringify(this.impresoras));
        this.loadItems();
        bootstrap.Modal.getInstance(document.getElementById("oficinaImpresoraModal")).hide();
    },

    editItem(id) {
        const impresora = this.impresoras.find(i => i.id == id);
        if (impresora) {
            this.openModal(id);
            document.getElementById("marca").value = impresora.marca;
            document.getElementById("modelo").value = impresora.modelo;
            document.getElementById("serial").value = impresora.serial;
            document.getElementById("ubicacion").value = impresora.ubicacion;
            document.getElementById("tipo").value = impresora.tipo;
        }
    },

    deleteItem(id) {
        this.impresoras = this.impresoras.filter(impresora => impresora.id !== id);
        localStorage.setItem("impresoras", JSON.stringify(this.impresoras));
        this.loadItems();
    }
};

(async function () {
    try {
        await crud.init();
    } catch (error) {
        console.error("Error inicializando aplicación:", error);
        crud.showError("Error crítico al cargar la aplicación: " + error.message);
    }
})();