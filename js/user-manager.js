// user-manager.js - Gestor de usuarios simplificado
class UserManager {
    constructor() {
        this.init();
    }

    init() {
        console.log('UserManager inicializado');
    }

    showUserManagement() {
        if (!window.authSystem.hasPermission('manage_users')) {
            alert('No tiene permisos para gestionar usuarios');
            return;
        }

        const modalContent = document.getElementById('user-management-content');
        if (!modalContent) {
            console.error('Modal content not found');
            return;
        }

        modalContent.innerHTML = this.generateUserManagementHTML();
        
        // Mostrar modal de Bootstrap
        const modal = new bootstrap.Modal(document.getElementById('userManagementModal'));
        modal.show();
        
        this.setupUserManagementEvents();
    }

    generateUserManagementHTML() {
        const users = window.authSystem.users;
        let html = `
            <div class="mb-3">
                <button class="btn btn-primary btn-sm" id="btn-add-user">
                    <i class="fas fa-plus"></i> Agregar Usuario
                </button>
            </div>
            <div class="table-responsive">
                <table class="table table-sm table-striped">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Nombre</th>
                            <th>Rol</th>
                            <th>Email</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        Object.entries(users).forEach(([username, user]) => {
            html += `
                <tr>
                    <td>${username}</td>
                    <td>${user.name}</td>
                    <td>${window.authSystem.getRoleDisplayName(user.role)}</td>
                    <td>${user.email}</td>
                    <td>
                        ${!['admin', 'editor', 'viewer'].includes(username) ? `
                        <button class="btn btn-warning btn-sm me-1 edit-user" data-user="${username}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-user" data-user="${username}">
                            <i class="fas fa-trash"></i>
                        </button>
                        ` : '<span class="text-muted">Sistema</span>'}
                    </td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        return html;
    }

    setupUserManagementEvents() {
        document.getElementById('btn-add-user')?.addEventListener('click', () => {
            this.showAddUserForm();
        });
        
        document.querySelectorAll('.edit-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const username = e.target.closest('button').dataset.user;
                this.showEditUserForm(username);
            });
        });
        
        document.querySelectorAll('.delete-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const username = e.target.closest('button').dataset.user;
                this.deleteUser(username);
            });
        });
    }

    showAddUserForm() {
        const formHTML = `
            <div class="add-user-form card p-3 mb-3">
                <h6>Agregar Nuevo Usuario</h6>
                <form id="new-user-form">
                    <div class="row g-2 mb-2">
                        <div class="col-md-6">
                            <label class="form-label small">Usuario:</label>
                            <input type="text" class="form-control form-control-sm" name="username" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small">Contraseña:</label>
                            <input type="password" class="form-control form-control-sm" name="password" required>
                        </div>
                    </div>
                    <div class="mb-2">
                        <label class="form-label small">Nombre completo:</label>
                        <input type="text" class="form-control form-control-sm" name="name" required>
                    </div>
                    <div class="mb-2">
                        <label class="form-label small">Email:</label>
                        <input type="email" class="form-control form-control-sm" name="email" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small">Rol:</label>
                        <select class="form-select form-select-sm" name="role" required>
                            <option value="viewer">Visualizador</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-success btn-sm">Guardar</button>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="this.closest('.add-user-form').remove()">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('user-management-content').insertAdjacentHTML('afterbegin', formHTML);
        
        document.getElementById('new-user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNewUser(new FormData(e.target));
        });
    }

    saveNewUser(formData) {
        try {
            const userData = Object.fromEntries(formData);
            
            window.authSystem.addUser(userData.username, {
                password: userData.password,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                permissions: this.getPermissionsForRole(userData.role)
            });
            
            alert('Usuario agregado exitosamente');
            this.showUserManagement(); // Recargar
            
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }

    showEditUserForm(username) {
        const user = window.authSystem.users[username];
        if (!user) return;

        const formHTML = `
            <div class="edit-user-form card p-3 mb-3">
                <h6>Editar Usuario: ${username}</h6>
                <form id="edit-user-form">
                    <div class="mb-2">
                        <label class="form-label small">Nombre completo:</label>
                        <input type="text" class="form-control form-control-sm" name="name" value="${user.name}" required>
                    </div>
                    <div class="mb-2">
                        <label class="form-label small">Email:</label>
                        <input type="email" class="form-control form-control-sm" name="email" value="${user.email}" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small">Rol:</label>
                        <select class="form-select form-select-sm" name="role" required>
                            <option value="viewer" ${user.role === 'viewer' ? 'selected' : ''}>Visualizador</option>
                            <option value="editor" ${user.role === 'editor' ? 'selected' : ''}>Editor</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrador</option>
                        </select>
                    </div>
                    <div class="mb-2">
                        <label class="form-label small">Nueva contraseña (dejar vacío para mantener actual):</label>
                        <input type="password" class="form-control form-control-sm" name="password">
                    </div>
                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-success btn-sm">Actualizar</button>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="this.closest('.edit-user-form').remove()">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('user-management-content').insertAdjacentHTML('afterbegin', formHTML);
        
        document.getElementById('edit-user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateUser(username, new FormData(e.target));
        });
    }

    updateUser(username, formData) {
        try {
            const userData = Object.fromEntries(formData);
            const updateData = {
                name: userData.name,
                email: userData.email,
                role: userData.role
            };

            if (userData.password) {
                updateData.password = userData.password;
            }

            window.authSystem.updateUser(username, updateData);
            alert('Usuario actualizado exitosamente');
            this.showUserManagement();
            
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }

    deleteUser(username) {
        if (confirm(`¿Estás seguro de que quieres eliminar al usuario "${username}"?`)) {
            try {
                window.authSystem.deleteUser(username);
                alert('Usuario eliminado exitosamente');
                this.showUserManagement();
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
    }

    getPermissionsForRole(role) {
        const permissions = {
            'viewer': ['read'],
            'editor': ['read', 'write'],
            'admin': ['read', 'write', 'delete', 'manage_users', 'import_data']
        };
        return permissions[role] || ['read'];
    }
}

// Hacer disponible globalmente
window.userManager = new UserManager();


