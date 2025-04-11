const crud = {
    taladros: [],
    permisos: {
        puedeConsultar: false,
        puedeAgregar: false,
        puedeEditar: false,
        puedeEliminar: false,
        puedeExportar: false,
        puedeVerBitacora: false
    },
    moduleName: "Maquinaria pesada", // Nombre del módulo que debe coincidir con el del backend

    async init() {
        try {
            await this.waitForDOMReady();
            await this.cargarPermisos();

            if (!this.permisos.puedeConsultar) {
                document.getElementById("noAccessMessage").style.display = "block";
                document.getElementById("tblMantenimientoTaladros").style.display = "none";
                document.getElementById("btnAdd").style.display = "none";
                return;
            }

            if (!localStorage.getItem("taladros")) {
                localStorage.setItem("taladros", JSON.stringify([
                    { id: 1, numeroSerie: "TAL001", marca: "Bosch", modelo: "GBH 2-26", ultimoMantenimiento: "2023-01-15", proximoMantenimiento: "2023-07-15" },
                    { id: 2, numeroSerie: "TAL002", marca: "DeWalt", modelo: "DWD024", ultimoMantenimiento: "2023-02-20", proximoMantenimiento: "2023-08-20" }
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
            const response = await fetch(`/auth/permisos-modulo/${this.moduleName}`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log(`[${this.moduleName}] Permisos recibidos:`, data);

            if (data && typeof data === 'object') {
                this.permisos = {
                    puedeConsultar: data.PuedeConsultar || false,
                    puedeAgregar: data.PuedeAgregar || false,
                    puedeEditar: data.PuedeEditar || false,
                    puedeEliminar: data.PuedeEliminar || false,
                    puedeExportar: data.PuedeExportar || false,
                    puedeVerBitacora: data.PuedeVerBitacora || false
                };
            } else {
                console.warn("Los permisos recibidos no tienen el formato esperado:", data);
            }
        } catch (error) {
            console.error("Error cargando permisos:", error);
            // Mostrar un mensaje al usuario pero permitir que la aplicación continúe
            this.showError("No se pudieron cargar los permisos. Usando permisos por defecto.");
        }
    },

    loadItems() {
        try {
            const taladrosStr = localStorage.getItem("taladros");
            this.taladros = taladrosStr ? JSON.parse(taladrosStr) : [];

            const tbody = document.getElementById("taladrosBody");
            if (!tbody) throw new Error("Elemento 'taladrosBody' no encontrado");

            tbody.innerHTML = "";

            if (this.taladros.length === 0) {
                const tr = document.createElement("tr");
                tr.innerHTML = `<td colspan="7" class="text-center">No hay taladros registrados</td>`;
                tbody.appendChild(tr);
                return;
            }

            this.taladros.forEach(taladro => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${taladro.id}</td>
                    <td>${taladro.numeroSerie}</td>
                    <td>${taladro.marca}</td>
                    <td>${taladro.modelo}</td>
                    <td>${taladro.ultimoMantenimiento}</td>
                    <td>${taladro.proximoMantenimiento}</td>
                    <td class="action-column">
                        ${this.permisos.puedeEditar ?
                        `<button class="btn btn-warning btn-sm" onclick="crud.editItem(${taladro.id})">
                            <i class="fas fa-edit"></i>
                        </button>` : ''}
                        ${this.permisos.puedeEliminar ?
                        `<button class="btn btn-danger btn-sm" onclick="crud.deleteItem(${taladro.id})">
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
        document.getElementById("formMantenimientoTaladros").reset();
        document.getElementById("taladroId").value = id ?? "";
        document.getElementById("modalTitle").textContent = id ? "Editar Taladro" : "Nuevo Taladro";
        new bootstrap.Modal(document.getElementById("mantenimientoTaladrosModal")).show();
    },

    saveItem() {
        const id = document.getElementById("taladroId").value;
        const nuevoTaladro = {
            id: id ? parseInt(id) : this.taladros.length + 1,
            numeroSerie: document.getElementById("numeroSerie").value,
            marca: document.getElementById("marca").value,
            modelo: document.getElementById("modelo").value,
            ultimoMantenimiento: document.getElementById("ultimoMantenimiento").value,
            proximoMantenimiento: document.getElementById("proximoMantenimiento").value
        };

        if (id) {
            this.taladros = this.taladros.map(taladro => taladro.id == id ? nuevoTaladro : taladro);
        } else {
            this.taladros.push(nuevoTaladro);
        }

        localStorage.setItem("taladros", JSON.stringify(this.taladros));
        this.loadItems();
        bootstrap.Modal.getInstance(document.getElementById("mantenimientoTaladrosModal")).hide();
    },

    editItem(id) {
        const taladro = this.taladros.find(t => t.id == id);
        if (taladro) {
            this.openModal(id);
            document.getElementById("numeroSerie").value = taladro.numeroSerie;
            document.getElementById("marca").value = taladro.marca;
            document.getElementById("modelo").value = taladro.modelo;
            document.getElementById("ultimoMantenimiento").value = taladro.ultimoMantenimiento;
            document.getElementById("proximoMantenimiento").value = taladro.proximoMantenimiento;
        }
    },

    deleteItem(id) {
        if (confirm("¿Estás seguro de que deseas eliminar este taladro?")) {
            this.taladros = this.taladros.filter(taladro => taladro.id !== id);
            localStorage.setItem("taladros", JSON.stringify(this.taladros));
            this.loadItems();
        }
    }
};

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await crud.init();
    } catch (error) {
        console.error("Error inicializando aplicación:", error);
        crud.showError("Error crítico al cargar la aplicación: " + error.message);
    }
});