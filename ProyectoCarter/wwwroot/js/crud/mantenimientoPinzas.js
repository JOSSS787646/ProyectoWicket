const crud = {
    pinzas: [],
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
                document.getElementById("tblMantenimientoPinzas").style.display = "none";
                document.getElementById("btnAdd").style.display = "none";
                return;
            }

            if (!localStorage.getItem("pinzas")) {
                localStorage.setItem("pinzas", JSON.stringify([
                    { id: 1, codigo: "PZ001", tipo: "Corte", ultimaCalibracion: "2023-01-10", estado: "Bueno" },
                    { id: 2, codigo: "PZ002", tipo: "Presión", ultimaCalibracion: "2023-03-15", estado: "Regular" }
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
            const response = await fetch('/auth/permisos-modulo/Pinzas', {
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
            const pinzasStr = localStorage.getItem("pinzas");
            this.pinzas = pinzasStr ? JSON.parse(pinzasStr) : [];

            const tbody = document.getElementById("pinzasBody");
            if (!tbody) throw new Error("Elemento 'pinzasBody' no encontrado");

            tbody.innerHTML = "";

            if (this.pinzas.length === 0) {
                const tr = document.createElement("tr");
                tr.innerHTML = `<td colspan="7" class="text-center">No hay pinzas registradas</td>`;
                tbody.appendChild(tr);
                return;
            }

            this.pinzas.forEach(pinza => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${pinza.id}</td>
                    <td>${pinza.codigo}</td>
                    <td>${pinza.tipo}</td>
                    <td>${pinza.ultimaCalibracion}</td>
                    <td>${pinza.estado}</td>
                    <td class="action-column">
                        ${this.permisos.puedeEditar ?
                        `<button class="btn btn-warning btn-sm" onclick="crud.editItem(${pinza.id})">
                            <i class="fas fa-edit"></i>
                        </button>` : ''}
                        ${this.permisos.puedeEliminar ?
                        `<button class="btn btn-danger btn-sm" onclick="crud.deleteItem(${pinza.id})">
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
        document.getElementById("formMantenimientoPinzas").reset();
        document.getElementById("pinzaId").value = id ?? "";
        document.getElementById("modalTitle").textContent = id ? "Editar Pinza" : "Nueva Pinza";
        new bootstrap.Modal(document.getElementById("mantenimientoPinzasModal")).show();
    },

    saveItem() {
        const id = document.getElementById("pinzaId").value;
        const nuevaPinza = {
            id: id ? parseInt(id) : this.pinzas.length + 1,
            codigo: document.getElementById("codigo").value,
            tipo: document.getElementById("tipo").value,
            ultimaCalibracion: document.getElementById("ultimaCalibracion").value,
            estado: document.getElementById("estado").value
        };

        if (id) {
            this.pinzas = this.pinzas.map(pinza => pinza.id == id ? nuevaPinza : pinza);
        } else {
            this.pinzas.push(nuevaPinza);
        }

        localStorage.setItem("pinzas", JSON.stringify(this.pinzas));
        this.loadItems();
        bootstrap.Modal.getInstance(document.getElementById("mantenimientoPinzasModal")).hide();
    },

    editItem(id) {
        const pinza = this.pinzas.find(p => p.id == id);
        if (pinza) {
            this.openModal(id);
            document.getElementById("codigo").value = pinza.codigo;
            document.getElementById("tipo").value = pinza.tipo;
            document.getElementById("ultimaCalibracion").value = pinza.ultimaCalibracion;
            document.getElementById("estado").value = pinza.estado;
        }
    },

    deleteItem(id) {
        this.pinzas = this.pinzas.filter(pinza => pinza.id !== id);
        localStorage.setItem("pinzas", JSON.stringify(this.pinzas));
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