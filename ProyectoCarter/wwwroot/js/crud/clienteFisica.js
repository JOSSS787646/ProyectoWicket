const crud = {
    clientes: [],
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
            // Esperar explícitamente a que el DOM esté listo
            await this.waitForDOMReady();

            console.log("DOM completamente cargado. Elementos encontrados:", {
                clientesBody: !!document.getElementById("clientesBody"),
                tblClientesMoral: !!document.getElementById("tblClientesMoral"),
                btnAdd: !!document.getElementById("btnAdd")
            });

            await this.cargarPermisos();

            if (!this.permisos.puedeConsultar) {
                document.getElementById("noAccessMessage").style.display = "block";
                document.getElementById("tblClientesMoral").style.display = "none";
                document.getElementById("btnAdd").style.display = "none";
                return;
            }

            if (!localStorage.getItem("clientes")) {
                localStorage.setItem("clientes", JSON.stringify([
                    { id: 1, razonSocial: "Empresa ABC", rfc: "ABC123456789", representante: "Juan Pérez", telefono: "555-1234", email: "abc@empresa.com" },
                    { id: 2, razonSocial: "Comercial XYZ", rfc: "XYZ987654321", representante: "María López", telefono: "555-5678", email: "xyz@comercial.com" }
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
            const response = await fetch('/auth/permisos-modulo/Cliente Fisica', {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

            const data = await response.json();
            console.log("Permisos recibidos:", data);

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
            this.permisos = {
                puedeConsultar: false,
                puedeAgregar: false,
                puedeEditar: false,
                puedeEliminar: false,
                puedeExportar: false,
                puedeVerBitacora: false
            };
            throw error; // Relanzamos el error para que init() lo capture
        }
    },

    loadItems() {
        try {
            const clientesStr = localStorage.getItem("clientes");
            this.clientes = clientesStr ? JSON.parse(clientesStr) : [];

            const tbody = document.getElementById("clientesBody");
            if (!tbody) throw new Error("Elemento 'clientesBody' no encontrado en el DOM");

            tbody.innerHTML = "";

            if (this.clientes.length === 0) {
                const tr = document.createElement("tr");
                tr.innerHTML = `<td colspan="7" class="text-center">No hay clientes registrados</td>`;
                tbody.appendChild(tr);
                return;
            }

            this.clientes.forEach(cliente => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${cliente.id}</td>
                    <td>${cliente.razonSocial}</td>
                    <td>${cliente.rfc}</td>
                    <td>${cliente.representante}</td>
                    <td>${cliente.telefono}</td>
                    <td>${cliente.email}</td>
                    <td class="action-column">
                        ${this.permisos.puedeEditar ?
                        `<button class="btn btn-warning btn-sm" onclick="crud.editItem(${cliente.id})">
                                <i class="fas fa-edit"></i>
                            </button>` : ''}
                        ${this.permisos.puedeEliminar ?
                        `<button class="btn btn-danger btn-sm" onclick="crud.deleteItem(${cliente.id})">
                                <i class="fas fa-trash"></i>
                            </button>` : ''}
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error("Error en loadItems:", error);
            this.showError("Error al cargar los clientes: " + error.message);
            throw error;
        }
    },
    openModal(id = null) {
        document.getElementById("formClienteMoral").reset();
        document.getElementById("clienteId").value = id ?? "";
        document.getElementById("modalTitle").textContent = id ? "Editar Cliente" : "Nuevo Cliente";
        new bootstrap.Modal(document.getElementById("clienteMoralModal")).show();
    },

    saveItem() {
        const id = document.getElementById("clienteId").value;
        const nuevoCliente = {
            id: id ? parseInt(id) : this.clientes.length + 1,
            razonSocial: document.getElementById("razonSocial").value,
            rfc: document.getElementById("rfc").value,
            representante: document.getElementById("representante").value,
            telefono: document.getElementById("telefono").value,
            email: document.getElementById("email").value
        };

        if (id) {
            this.clientes = this.clientes.map(cliente => cliente.id == id ? nuevoCliente : cliente);
        } else {
            this.clientes.push(nuevoCliente);
        }

        localStorage.setItem("clientes", JSON.stringify(this.clientes));
        this.loadItems();
        bootstrap.Modal.getInstance(document.getElementById("clienteMoralModal")).hide();
    },

    editItem(id) {
        const cliente = this.clientes.find(c => c.id == id);
        if (cliente) {
            this.openModal(id);
            document.getElementById("razonSocial").value = cliente.razonSocial;
            document.getElementById("rfc").value = cliente.rfc;
            document.getElementById("representante").value = cliente.representante;
            document.getElementById("telefono").value = cliente.telefono;
            document.getElementById("email").value = cliente.email;
        }
    },

    deleteItem(id) {
        this.clientes = this.clientes.filter(cliente => cliente.id !== id);
        localStorage.setItem("clientes", JSON.stringify(this.clientes));
        this.loadItems();
    }
};

document.addEventListener("DOMContentLoaded", () => crud.init());

// Por esto para mayor seguridad:
(async function () {
    try {
        await crud.waitForDOMReady();
        await crud.init();
    } catch (error) {
        console.error("Error inicializando aplicación:", error);
        crud.showError("Error crítico al cargar la aplicación: " + error.message);
    }
})();