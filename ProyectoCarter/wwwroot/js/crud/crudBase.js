// js/crud/crudCommon.js
class CRUDCommon {
    constructor(moduleName) {
        this.moduleName = moduleName;
        this.permisos = {
            puedeConsultar: false,
            puedeAgregar: false,
            puedeEditar: false,
            puedeEliminar: false,
            puedeExportar: false,
            puedeVerBitacora: false
        };
    }

    async waitForDOMReady() {
        return new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('DOMContentLoaded', resolve);
            }
        });
    }

    showError(message) {
        const errorDiv = document.createElement("div");
        errorDiv.className = "alert alert-danger m-3";
        errorDiv.textContent = message;
        document.body.prepend(errorDiv);
    }

    async cargarPermisos() {
        try {
            const response = await fetch(`/auth/permisos-modulo/${this.moduleName}`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

            const data = await response.json();
            console.log(`Permisos recibidos para ${this.moduleName}:`, data);

            this.permisos = {
                puedeConsultar: data.PuedeConsultar || false,
                puedeAgregar: data.PuedeAgregar || false,
                puedeEditar: data.PuedeEditar || false,
                puedeEliminar: data.PuedeEliminar || false,
                puedeExportar: data.PuedeExportar || false,
                puedeVerBitacora: data.PuedeVerBitacora || false
            };
        } catch (error) {
            console.error(`Error cargando permisos para ${this.moduleName}:`, error);
            throw error;
        }
    }

    verificarElementos(ids) {
        const missing = ids.filter(id => !document.getElementById(id));
        if (missing.length > 0) {
            throw new Error(`Elementos no encontrados: ${missing.join(', ')}`);
        }
    }
}