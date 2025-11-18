class AuthenticationSystem {
    constructor() {
        this.currentUser = null;
        this.users = {};
        this.roles = {};
        this.systemConfig = {};
        this.initialized = false;
        this.events = {};
    }

    async init() {
        if (this.initialized) return;
        
        await this.loadUsersData();
        this.checkExistingSession();
        this.setupEventListeners();
        this.initialized = true;
    }

    async loadUsersData() {
        try {
            // Para login.html, cargar usuarios básicos
            if (window.location.pathname.endsWith('login.html')) {
                this.loadDefaultUsers();
                return;
            }

            // Para index.html, intentar cargar desde el JSON
            const response = await fetch('config/users.json');
            if (!response.ok) {
                throw new Error('No se pudo cargar config/users.json');
            }
            
            const config = await response.json();
            
            // Cargar datos desde el JSON
            this.users = config.users;
            this.roles = config.roles;
            this.systemConfig = config.system_config;
            
            console.log('✅ Configuración de usuarios cargada:', config.metadata);
            
        } catch (error) {
            console.error('❌ Error cargando users.json, usando usuarios por defecto:', error);
            this.loadDefaultUsers();
        }
    }

    loadDefaultUsers() {
        // Usuarios por defecto como fallback
        this.users = {
            'admin': {
                password: 'admin123',
                role: 'admin',
                name: 'Administrador del Sistema',
                email: 'admin@geologia.com',
                permissions: ['read', 'write', 'delete', 'manage_users', 'import_data', 'export_data'],
                created_at: '2024-01-01',
                last_login: new Date().toISOString().split('T')[0],
                active: true
            },
            'editor': {
                password: 'editor123',
                role: 'editor',
                name: 'Editor Geológico Principal',
                email: 'editor@geologia.com',
                permissions: ['read', 'write', 'export_data'],
                created_at: '2024-01-01',
                last_login: new Date().toISOString().split('T')[0],
                active: true
            },
            'viewer': {
                password: 'viewer123',
                role: 'viewer',
                name: 'Usuario de Consulta',
                email: 'viewer@geologia.com',
                permissions: ['read'],
                created_at: '2024-01-01',
                last_login: new Date().toISOString().split('T')[0],
                active: true
            },
            'geologo1': {
                password: 'geo123',
                role: 'editor',
                name: 'Dr. María González',
                email: 'm.gonzalez@geologia.com',
                permissions: ['read', 'write'],
                created_at: '2024-03-15',
                last_login: new Date().toISOString().split('T')[0],
                active: true,
                especialidad: 'Geología Estructural'
            },
            'geologo2': {
                password: 'geo456',
                role: 'editor',
                name: 'Lic. Carlos Rodríguez',
                email: 'c.rodriguez@geologia.com',
                permissions: ['read', 'write'],
                created_at: '2024-04-20',
                last_login: new Date().toISOString().split('T')[0],
                active: true,
                especialidad: 'Mineralogía'
            },
            'consultor1': {
                password: 'cons123',
                role: 'viewer',
                name: 'Ing. Ana Martínez',
                email: 'a.martinez@consultoria.com',
                permissions: ['read'],
                created_at: '2024-05-10',
                last_login: new Date().toISOString().split('T')[0],
                active: true,
                empresa: 'Geoconsult S.A.'
            }
        };
        
        this.roles = {
            'admin': {
                name: 'Administrador',
                description: 'Acceso completo al sistema',
                permissions: ['read', 'write', 'delete', 'manage_users', 'import_data', 'export_data', 'system_config']
            },
            'editor': {
                name: 'Editor Geológico',
                description: 'Puede visualizar y editar datos geológicos',
                permissions: ['read', 'write', 'export_data']
            },
            'viewer': {
                name: 'Visualizador',
                description: 'Solo puede visualizar datos',
                permissions: ['read']
            }
        };

        this.systemConfig = {
            max_users: 50,
            session_timeout: 3600,
            allow_registration: false,
            default_role: 'viewer'
        };
    }

    saveUsers() {
        try {
            // Guardar solo usuarios personalizados (no los del sistema)
            const customUsers = Object.fromEntries(
                Object.entries(this.users).filter(([username, user]) => 
                    !['admin', 'editor', 'viewer', 'geologo1', 'geologo2', 'consultor1'].includes(username)
                )
            );
            
            localStorage.setItem('geo_users', JSON.stringify(customUsers));
            console.log('✅ Usuarios personalizados guardados en localStorage');
        } catch (error) {
            console.error('❌ Error guardando usuarios:', error);
        }
    }

    login(username, password) {
        const user = this.users[username];
        
        if (user && user.password === password && user.active !== false) {
            this.currentUser = {
                username: username,
                role: user.role,
                name: user.name,
                email: user.email,
                permissions: user.permissions
            };

            // Actualizar último login
            if (this.users[username]) {
                this.users[username].last_login = new Date().toISOString().split('T')[0];
            }

            // Guardar sesión
            localStorage.setItem('geo_current_user', JSON.stringify(this.currentUser));
            localStorage.setItem('geo_last_login', new Date().toISOString());

            this.updateUI();
            this.dispatchEvent('login', this.currentUser);
            
            console.log(`✅ Usuario ${username} autenticado correctamente`);
            return true;
        }
        
        console.log(`❌ Fallo en autenticación para usuario: ${username}`);
        return false;
    }

    logout() {
        const username = this.currentUser?.username;
        this.currentUser = null;
        localStorage.removeItem('geo_current_user');
        this.updateUI();
        this.dispatchEvent('logout');
        console.log(`✅ Usuario ${username} cerró sesión`);
        window.location.href = 'login.html';
    }

    checkExistingSession() {
        try {
            const storedUser = localStorage.getItem('geo_current_user');
            if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
                
                // Verificar que el usuario todavía existe en el sistema
                if (this.users[this.currentUser.username]) {
                    this.updateUI();
                    this.dispatchEvent('login', this.currentUser);
                    console.log(`✅ Sesión recuperada para: ${this.currentUser.username}`);
                } else {
                    console.log('❌ Usuario de sesión no encontrado en el sistema');
                    this.logout();
                }
            } else {
                console.log('ℹ️ No hay sesión activa, redirigiendo a login');
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error('❌ Error recuperando sesión:', error);
            this.logout();
        }
    }

    updateUI() {
        const userInfo = document.getElementById('user-info');
        const usernameDisplay = document.getElementById('username-display');
        const userRole = document.getElementById('user-role');

        if (userInfo && usernameDisplay && userRole) {
            if (this.currentUser) {
                usernameDisplay.textContent = this.currentUser.name;
                userRole.textContent = this.getRoleDisplayName(this.currentUser.role);
                
                // Mostrar/ocultar elementos según rol
                this.updateRoleBasedUI();
            } else {
                usernameDisplay.textContent = 'Invitado';
                userRole.textContent = 'No autenticado';
            }
        }
    }

    updateRoleBasedUI() {
        const role = this.currentUser?.role;
        
        // Mostrar/ocultar herramientas de editor
        document.querySelectorAll('.editor-only').forEach(el => {
            el.style.display = (role === 'editor' || role === 'admin') ? 'block' : 'none';
        });
        
        // Mostrar/ocultar herramientas de admin
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = (role === 'admin') ? 'block' : 'none';
        });

        // Actualizar clases del body para estilos CSS
        document.body.classList.remove('admin-mode', 'editor-mode', 'viewer-mode');
        if (role) {
            document.body.classList.add(`${role}-mode`);
        }
    }

    getRoleDisplayName(role) {
        const roleConfig = this.roles[role];
        return roleConfig ? roleConfig.name : role;
    }

    getRoleDescription(role) {
        const roleConfig = this.roles[role];
        return roleConfig ? roleConfig.description : '';
    }

    hasPermission(permission) {
        return this.currentUser?.permissions?.includes(permission) || false;
    }

    canManageUsers() {
        return this.hasPermission('manage_users');
    }

    canEditData() {
        return this.hasPermission('write');
    }

    canDeleteData() {
        return this.hasPermission('delete');
    }

    addUser(username, userData) {
        if (!this.canManageUsers()) {
            throw new Error('No tiene permisos para gestionar usuarios');
        }

        if (this.users[username]) {
            throw new Error('El usuario ya existe');
        }

        // Validar datos del usuario
        if (!userData.password || !userData.name || !userData.email || !userData.role) {
            throw new Error('Datos de usuario incompletos');
        }

        // Asignar permisos basados en el rol
        const rolePermissions = this.roles[userData.role]?.permissions || ['read'];
        userData.permissions = rolePermissions;
        userData.created_at = new Date().toISOString().split('T')[0];
        userData.active = true;

        this.users[username] = userData;
        this.saveUsers();
        this.dispatchEvent('userAdded', { username, userData });
        
        console.log(`✅ Usuario ${username} agregado correctamente`);
    }

    updateUser(username, userData) {
        if (!this.canManageUsers()) {
            throw new Error('No tiene permisos para gestionar usuarios');
        }

        if (!this.users[username]) {
            throw new Error('Usuario no encontrado');
        }

        // No permitir modificar usuarios del sistema base
        if (['admin', 'editor', 'viewer'].includes(username)) {
            throw new Error('No se pueden modificar usuarios del sistema');
        }

        // Actualizar datos
        this.users[username] = { ...this.users[username], ...userData };
        
        // Si se cambió el rol, actualizar permisos
        if (userData.role && this.roles[userData.role]) {
            this.users[username].permissions = this.roles[userData.role].permissions;
        }

        this.saveUsers();
        this.dispatchEvent('userUpdated', { username, userData });
        
        console.log(`✅ Usuario ${username} actualizado correctamente`);
    }

    deleteUser(username) {
        if (!this.canManageUsers()) {
            throw new Error('No tiene permisos para gestionar usuarios');
        }

        if (['admin', 'editor', 'viewer', 'geologo1', 'geologo2', 'consultor1'].includes(username)) {
            throw new Error('No se pueden eliminar usuarios del sistema');
        }

        if (!this.users[username]) {
            throw new Error('Usuario no encontrado');
        }

        delete this.users[username];
        this.saveUsers();
        this.dispatchEvent('userDeleted', { username });
        
        console.log(`✅ Usuario ${username} eliminado correctamente`);
    }

    deactivateUser(username) {
        if (!this.canManageUsers()) {
            throw new Error('No tiene permisos para gestionar usuarios');
        }

        if (!this.users[username]) {
            throw new Error('Usuario no encontrado');
        }

        this.users[username].active = false;
        this.saveUsers();
        this.dispatchEvent('userDeactivated', { username });
        
        console.log(`✅ Usuario ${username} desactivado`);
    }

    activateUser(username) {
        if (!this.canManageUsers()) {
            throw new Error('No tiene permisos para gestionar usuarios');
        }

        if (!this.users[username]) {
            throw new Error('Usuario no encontrado');
        }

        this.users[username].active = true;
        this.saveUsers();
        this.dispatchEvent('userActivated', { username });
        
        console.log(`✅ Usuario ${username} activado`);
    }

    getAllUsers() {
        return Object.keys(this.users).map(username => ({
            username,
            ...this.users[username]
        }));
    }

    getActiveUsers() {
        return this.getAllUsers().filter(user => user.active !== false);
    }

    getUserCount() {
        return Object.keys(this.users).length;
    }

    setupEventListeners() {
        const logoutBtn = document.getElementById('btn-logout');
        const profileBtn = document.getElementById('btn-profile');

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                this.showProfileModal();
            });
        }
    }

    showProfileModal() {
        if (!this.currentUser) return;

        const user = this.users[this.currentUser.username];
        const modalContent = `
            <div class="profile-modal">
                <h5>Perfil de Usuario</h5>
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Nombre:</strong> ${user.name}</p>
                        <p><strong>Usuario:</strong> ${this.currentUser.username}</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Rol:</strong> ${this.getRoleDisplayName(user.role)}</p>
                        <p><strong>Último acceso:</strong> ${user.last_login || 'Nunca'}</p>
                        <p><strong>Fecha creación:</strong> ${user.created_at || 'Desconocida'}</p>
                    </div>
                </div>
                ${user.especialidad ? `<p><strong>Especialidad:</strong> ${user.especialidad}</p>` : ''}
                ${user.empresa ? `<p><strong>Empresa:</strong> ${user.empresa}</p>` : ''}
                <div class="mt-3">
                    <h6>Permisos:</h6>
                    <ul>
                        ${user.permissions.map(perm => `<li>${this.getPermissionDisplayName(perm)}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;

        // Usar alert simple por ahora, puedes implementar un modal de Bootstrap después
        alert(`Perfil de ${user.name}\nRol: ${this.getRoleDisplayName(user.role)}\nEmail: ${user.email}`);
    }

    getPermissionDisplayName(permission) {
        const permissions = {
            'read': 'Lectura de datos',
            'write': 'Escritura de datos',
            'delete': 'Eliminación de datos',
            'manage_users': 'Gestión de usuarios',
            'import_data': 'Importación de datos',
            'export_data': 'Exportación de datos',
            'system_config': 'Configuración del sistema'
        };
        return permissions[permission] || permission;
    }

    // Sistema de eventos
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }

    dispatchEvent(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error en evento ${event}:`, error);
                }
            });
        }
    }

    // Utilidades
    validatePassword(password) {
        const policy = this.systemConfig.password_policy;
        if (!policy) return true;

        if (password.length < policy.min_length) return false;
        if (policy.require_uppercase && !/[A-Z]/.test(password)) return false;
        if (policy.require_numbers && !/\d/.test(password)) return false;
        if (policy.require_special_chars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;

        return true;
    }

    getSystemInfo() {
        return {
            total_users: this.getUserCount(),
            active_users: this.getActiveUsers().length,
            system_config: this.systemConfig,
            roles: this.roles
        };
    }
}

// Sistema de autenticación para login.html (versión simplificada)
function createAuthSystemForLogin() {
    return {
        login: function(username, password) {
            const users = {
                'admin': { 
                    password: 'admin123', 
                    role: 'admin', 
                    name: 'Administrador del Sistema',
                    permissions: ['read', 'write', 'delete', 'manage_users', 'import_data', 'export_data'] 
                },
                'editor': { 
                    password: 'editor123', 
                    role: 'editor', 
                    name: 'Editor Geológico Principal',
                    permissions: ['read', 'write', 'export_data'] 
                },
                'viewer': { 
                    password: 'viewer123', 
                    role: 'viewer', 
                    name: 'Usuario de Consulta',
                    permissions: ['read'] 
                },
                'geologo1': { 
                    password: 'geo123', 
                    role: 'editor', 
                    name: 'Dr. María González',
                    permissions: ['read', 'write'] 
                },
                'geologo2': { 
                    password: 'geo456', 
                    role: 'editor', 
                    name: 'Lic. Carlos Rodríguez',
                    permissions: ['read', 'write'] 
                },
                'consultor1': { 
                    password: 'cons123', 
                    role: 'viewer', 
                    name: 'Ing. Ana Martínez',
                    permissions: ['read'] 
                }
            };
            
            const user = users[username];
            if (user && user.password === password) {
                // Guardar sesión básica para redirección
                localStorage.setItem('geo_current_user', JSON.stringify({
                    username: username,
                    role: user.role,
                    name: user.name,
                    permissions: user.permissions
                }));
                return true;
            }
            return false;
        }
    };
}

// Inicialización automática según la página
if (typeof window !== 'undefined') {
    if (window.location.pathname.endsWith('login.html')) {
        // Para login.html, usar versión simplificada
        window.authSystem = createAuthSystemForLogin();
    } else {
        // Para otras páginas, usar el sistema completo
        window.authSystem = new AuthenticationSystem();
        window.authSystem.init().catch(error => {
            console.error('Error inicializando sistema de autenticación:', error);
        });
    }
}


