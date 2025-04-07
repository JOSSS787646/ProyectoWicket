const crud = {
    equipos: [],
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
                document.getElementById("tblOficinaPc").style.display = "none";
                document.getElementById("btnAdd").style.display = "none";
                return;
            }

            if (!localStorage.getItem("equipos")) {
                localStorage.setItem("equipos", JSON.stringify([
                    { id: 1, nombre: "PC Oficina 1", modelo: "Dell Optiplex", serial: "DEL123", ubicacion: "Oficina 101", responsable: "Juan Pérez" },
                    { id: 2, nombre: "PC Recepción", modelo: "HP EliteDesk", serial: "HP456", ubicacion: "Recepción", responsable: "María López" }
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
            const response = await fetch('/auth/permisos-modulo/PC', {
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
            const equiposStr = localStorage.getItem("equipos");
            this.equipos = equiposStr ? JSON.parse(equiposStr) : [];

            const tbody = document.getElementById("equiposBody");
            if (!tbody) throw new Error("Elemento 'equiposBody' no encontrado");

            tbody.innerHTML = "";

            if (this.equipos.length === 0) {
                const tr = document.createElement("tr");
                tr.innerHTML = `<td colspan="7" class="text-center">No hay equipos registrados</td>`;
                tbody.appendChild(tr);
                return;
            }

            this.equipos.forEach(equipo => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${equipo.id}</td>
                    <td>${equipo.nombre}</td>
                    <td>${equipo.modelo}</td>
                    <td>${equipo.serial}</td>
                    <td>${equipo.ubicacion}</td>
                    <td>${equipo.responsable}</td>
                    <td class="action-column">
                        ${this.permisos.puedeEditar ?
                        `<button class="btn btn-warning btn-sm" onclick="crud.editItem(${equipo.id})">
                            <i class="fas fa-edit"></i>
                        </button>` : ''}
                        ${this.permisos.puedeEliminar ?
                        `<button class="btn btn-danger btn-sm" onclick="crud.deleteItem(${equipo.id})">
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
        document.getElementById("formOficinaPc").reset();
        document.getElementById("equipoId").value = id ?? "";
        document.getElementById("modalTitle").textContent = id ? "Editar Equipo" : "Nuevo Equipo";
        new bootstrap.Modal(document.getElementById("oficinaPcModal")).show();
    },

    saveItem() {
        const id = document.getElementById("equipoId").value;
        const nuevoEquipo = {
            id: id ? parseInt(id) : this.equipos.length + 1,
            nombre: document.getElementById("nombre").value,
            modelo: document.getElementById("modelo").value,
            serial: document.getElementById("serial").value,
            ubicacion: document.getElementById("ubicacion").value,
            responsable: document.getElementById("responsable").value
        };

        if (id) {
            this.equipos = this.equipos.map(equipo => equipo.id == id ? nuevoEquipo : equipo);
        } else {
            this.equipos.push(nuevoEquipo);
        }

        localStorage.setItem("equipos", JSON.stringify(this.equipos));
        this.loadItems();
        bootstrap.Modal.getInstance(document.getElementById("oficinaPcModal")).hide();
    },

    editItem(id) {
        const equipo = this.equipos.find(e => e.id == id);
        if (equipo) {
            this.openModal(id);
            document.getElementById("nombre").value = equipo.nombre;
            document.getElementById("modelo").value = equipo.modelo;
            document.getElementById("serial").value = equipo.serial;
            document.getElementById("ubicacion").value = equipo.ubicacion;
            document.getElementById("responsable").value = equipo.responsable;
        }
    },

    deleteItem(id) {
        this.equipos = this.equipos.filter(equipo => equipo.id !== id);
        localStorage.setItem("equipos", JSON.stringify(this.equipos));
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