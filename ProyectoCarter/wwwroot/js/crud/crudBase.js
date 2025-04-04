class CRUDDynamic {
    constructor(moduleName, tableId, formId, options = {}) {
        this.moduleName = moduleName;
        this.tableId = tableId;
        this.formId = formId;
        this.options = {
            hasStatus: false,
            ...options
        };
        this.currentPermissions = {
            canView: false,
            canAdd: false,
            canEdit: false,
            canDelete: false
        };
        this.initialize();
    }

    async initialize() {
        try {
            // 1. Cargar permisos
            const permissionsLoaded = await this.loadPermissions();

            if (!permissionsLoaded) {
                this.showError('No se pudieron cargar los permisos');
                return;
            }

            console.log('Permisos actuales:', this.currentPermissions); // Debug

            // 2. Configurar eventos básicos
            this.setupBaseEvents();

            // 3. Actualizar interfaz
            this.updateUI();

            // 4. Cargar datos si tiene permiso
            if (this.currentPermissions.canView) {
                await this.loadData();
            }
        } catch (error) {
            console.error('Error inicializando CRUD:', error);
            this.showError('Error al inicializar el módulo');
        }
    }

    async loadPermissions() {
        try {
            // Primero intentar cargar permisos reales
            const userData = this.getUserData();

            if (!userData || !userData.RolId) {
                console.error('Usuario no autenticado o sin RolId');
                return false;
            }

            const response = await fetch(`/auth/permisos-modulo/${userData.RolId}/${this.moduleName}`);

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();

            // Actualizar permisos con los del servidor
            this.currentPermissions = {
                canView: data.PuedeConsultar,
                canAdd: data.PuedeAgregar,
                canEdit: data.PuedeEditar,
                canDelete: data.PuedeEliminar
            };

            return true;
        } catch (error) {
            console.error('Error cargando permisos:', error);

            // En desarrollo, continuar con permisos completos
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.warn('Modo desarrollo: Usando permisos completos');
                this.currentPermissions = {
                    canView: true,
                    canAdd: true,
                    canEdit: true,
                    canDelete: true
                };
                return true;
            }

            return false;
        }
    }

    getUserData() {
        try {
            const userDataStr = sessionStorage.getItem('userData');

            if (!userDataStr) {
                console.error('No hay datos de usuario en sessionStorage');
                return null;
            }

            const userData = JSON.parse(userDataStr);

            if (!userData.RolId) {
                console.error('El usuario no tiene RolId asignado');
                return null;
            }

            return userData;
        } catch (error) {
            console.error('Error al obtener datos de usuario:', error);
            return null;
        }
    }

    updateUI() {
        try {
            // 1. Botón de agregar
            const btnAdd = document.getElementById('btnAdd');
            if (btnAdd) {
                btnAdd.style.display = this.currentPermissions.canAdd ? 'block' : 'none';
                console.log(`Botón Agregar - Visible: ${this.currentPermissions.canAdd}`);
            }

            // 2. Columnas de acción
            const actionColumns = document.querySelectorAll(`#${this.tableId} .action-column`);
            actionColumns.forEach(col => {
                const shouldShow = this.currentPermissions.canEdit || this.currentPermissions.canDelete;
                col.style.display = shouldShow ? 'table-cell' : 'none';
                console.log(`Columna Acciones - Visible: ${shouldShow}`);
            });

            // 3. Mensaje de no acceso
            const noAccessMsg = document.getElementById('noAccessMessage');
            if (noAccessMsg) {
                noAccessMsg.style.display = this.currentPermissions.canView ? 'none' : 'block';
            }

            // 4. Tabla completa
            const table = document.getElementById(this.tableId);
            if (table) {
                table.style.display = this.currentPermissions.canView ? 'table' : 'none';
            }

            // 5. Actualizar botones en filas existentes
            this.updateActionButtonsVisibility();
        } catch (error) {
            console.error('Error actualizando UI:', error);
        }
    }

    updateActionButtonsVisibility() {
        // Ocultar/mostrar botones de editar
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.style.display = this.currentPermissions.canEdit ? 'inline-block' : 'none';
        });

        // Ocultar/mostrar botones de eliminar
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.style.display = this.currentPermissions.canDelete ? 'inline-block' : 'none';
        });
    }

    setupBaseEvents() {
        // Botón de agregar
        const btnAdd = document.getElementById('btnAdd');
        if (btnAdd) {
            btnAdd.addEventListener('click', () => {
                if (!this.currentPermissions.canAdd) {
                    alert('No tienes permisos para agregar');
                    return;
                }
                this.showForm();
            });
        }
    }

    setupRowEvents() {
        // Botones de editar
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.currentPermissions.canEdit) {
                    alert('No tienes permisos para editar');
                    return;
                }
                const id = e.currentTarget.dataset.id;
                const item = this.mockData.find(item => item.id == id);
                if (item) this.showForm(item);
            });
        });

        // Botones de eliminar
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.currentPermissions.canDelete) {
                    alert('No tienes permisos para eliminar');
                    return;
                }
                const id = e.currentTarget.dataset.id;
                this.deleteItem(id);
            });
        });
    }

    showError(message) {
        const errorElement = document.getElementById('noAccessMessage') || document.createElement('div');
        errorElement.id = 'noAccessMessage';
        errorElement.className = 'alert alert-danger';
        errorElement.textContent = message;

        const cardBody = document.querySelector('.card-body');
        if (cardBody) {
            cardBody.prepend(errorElement);
        }
    }

    // Métodos que deben ser implementados por las clases hijas
    async loadData() {
        throw new Error('Método loadData debe ser implementado');
    }

    showForm(data = null) {
        throw new Error('Método showForm debe ser implementado');
    }

    saveItem() {
        throw new Error('Método saveItem debe ser implementado');
    }

    deleteItem(id) {
        throw new Error('Método deleteItem debe ser implementado');
    }
}