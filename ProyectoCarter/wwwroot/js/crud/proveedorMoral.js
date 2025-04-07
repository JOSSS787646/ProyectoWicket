const crud = {
    proveedores: [],
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
                document.getElementById("tblProveedoresMoral").style.display = "none";
                document.getElementById("btnAdd").style.display = "none";
                return;
            }

            if (!localStorage.getItem("proveedores")) {
                localStorage.setItem("proveedores", JSON.stringify([
                    { id: 1, razonSocial: "Proveedores SA", rfc: "PRV123456", representante: "Juan Pérez", telefono: "555-1234", email: "contacto@proveedores.com" },
                    { id: 2, razonSocial: "Suministros XYZ", rfc: "SUM654321", representante: "María López", telefono: "555-5678", email: "info@suministros.com" }
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
            const response = await fetch('/auth/permisos-modulo/Proveedor Moral', {
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
            const proveedoresStr = localStorage.getItem("proveedores");
            this.proveedores = proveedoresStr ? JSON.parse(proveedoresStr) : [];

            const tbody = document.getElementById("proveedoresBody");
            if (!tbody) throw new Error("Elemento 'proveedoresBody' no encontrado");

            tbody.innerHTML = "";

            if (this.proveedores.length === 0) {
                const tr = document.createElement("tr");
                tr.innerHTML = `<td colspan="7" class="text-center">No hay proveedores registrados</td>`;
                tbody.appendChild(tr);
                return;
            }

            this.proveedores.forEach(proveedor => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${proveedor.id}</td>
                    <td>${proveedor.razonSocial}</td>
                    <td>${proveedor.rfc}</td>
                    <td>${proveedor.representante}</td>
                    <td>${proveedor.telefono}</td>
                    <td>${proveedor.email}</td>
                    <td class="action-column">
                        ${this.permisos.puedeEditar ?
                        `<button class="btn btn-warning btn-sm" onclick="crud.editItem(${proveedor.id})">
                            <i class="fas fa-edit"></i>
                        </button>` : ''}
                        ${this.permisos.puedeEliminar ?
                        `<button class="btn btn-danger btn-sm" onclick="crud.deleteItem(${proveedor.id})">
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
        document.getElementById("formProveedorMoral").reset();
        document.getElementById("proveedorId").value = id ?? "";
        document.getElementById("modalTitle").textContent = id ? "Editar Proveedor" : "Nuevo Proveedor";
        new bootstrap.Modal(document.getElementById("proveedorMoralModal")).show();
    },

    saveItem() {
        const id = document.getElementById("proveedorId").value;
        const nuevoProveedor = {
            id: id ? parseInt(id) : this.proveedores.length + 1,
            razonSocial: document.getElementById("razonSocial").value,
            rfc: document.getElementById("rfc").value,
            representante: document.getElementById("representante").value,
            telefono: document.getElementById("telefono").value,
            email: document.getElementById("email").value
        };

        if (id) {
            this.proveedores = this.proveedores.map(proveedor => proveedor.id == id ? nuevoProveedor : proveedor);
        } else {
            this.proveedores.push(nuevoProveedor);
        }

        localStorage.setItem("proveedores", JSON.stringify(this.proveedores));
        this.loadItems();
        bootstrap.Modal.getInstance(document.getElementById("proveedorMoralModal")).hide();
    },

    editItem(id) {
        const proveedor = this.proveedores.find(p => p.id == id);
        if (proveedor) {
            this.openModal(id);
            document.getElementById("razonSocial").value = proveedor.razonSocial;
            document.getElementById("rfc").value = proveedor.rfc;
            document.getElementById("representante").value = proveedor.representante;
            document.getElementById("telefono").value = proveedor.telefono;
            document.getElementById("email").value = proveedor.email;
        }
    },

    deleteItem(id) {
        this.proveedores = this.proveedores.filter(proveedor => proveedor.id !== id);
        localStorage.setItem("proveedores", JSON.stringify(this.proveedores));
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