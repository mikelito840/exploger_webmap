// layer-manager.js - Gestor de capas simplificado
class LayerManager {
    constructor() {
        this.layers = {};
        this.activeLayers = new Set();
    }

    addLayer(name, layer, config = {}) {
        this.layers[name] = { layer, config };
        this.updateLayerControls();
    }

    toggleLayer(name, visible) {
        if (this.layers[name]) {
            this.layers[name].layer.setVisible(visible);
            if (visible) {
                this.activeLayers.add(name);
            } else {
                this.activeLayers.delete(name);
            }
        }
    }

    updateLayerControls() {
        const container = document.getElementById('layer-controls');
        if (!container) return;

        // Verificar si el usuario es admin
        const isAdmin = window.authSystem && window.authSystem.currentUser && 
                       window.authSystem.currentUser.role === 'admin';

        let html = '';
        Object.entries(this.layers).forEach(([name, { layer, config }]) => {
            const visible = layer.getVisible();
            const displayName = this.formatLayerName(name);
            const isImported = config && config.isImported;
            
            html += `
                <div class="form-check layer-item d-flex align-items-center justify-content-between" data-layer-name="${name}">
                    <div class="d-flex align-items-center flex-grow-1">
                        <input class="form-check-input layer-checkbox" type="checkbox" 
                               id="layer-${name}" ${visible ? 'checked' : ''}
                               data-layer="${name}">
                        <label class="form-check-label flex-grow-1" for="layer-${name}">
                            ${displayName}
                        </label>
                    </div>
                    ${isAdmin && isImported ? `
                        <button class="btn btn-sm btn-outline-danger delete-layer-btn" 
                                data-layer="${name}" 
                                title="Eliminar capa"
                                style="padding: 2px 6px; font-size: 12px;">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            `;
        });
        
        container.innerHTML = html;

        // Event listeners para los checkboxes
        document.querySelectorAll('.layer-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const layerName = e.target.dataset.layer;
                this.toggleLayer(layerName, e.target.checked);
            });
        });

        // Event listeners para botones de eliminar
        if (isAdmin) {
            document.querySelectorAll('.delete-layer-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const layerName = e.currentTarget.dataset.layer;
                    this.deleteLayer(layerName);
                });
            });
        }
    }

    formatLayerName(name) {
        // Si la capa tiene un displayName guardado, usarlo
        if (this.layers[name] && this.layers[name].config && this.layers[name].config.originalName) {
            return this.layers[name].config.originalName;
        }
        
        // Mapear nombres de capas de Mazocruz a nombres más legibles
        const names = {
            'ConcesionesSantaRosa_Mazocruz': 'Concesiones Santa Rosa Mazocruz',
            'ConcesionesSantaRosa_Mazocruz_1': 'Concesiones Santa Rosa Mazocruz',
            'Volcanes': 'Volcanes',
            'Volcanes_2': 'Volcanes',
            'Geoquimica_franja1': 'Geoquímica Franja 1',
            'Geoqumica_franja1_3': 'Geoquímica Franja 1',
            'Accesos_principales': 'Accesos Principales',
            'Accesos_principales_4': 'Accesos Principales',
            'formaciones': 'Formaciones Geológicas',
            'fallas': 'Fallas',
            'mineralizaciones': 'Mineralizaciones', 
            'sondeos': 'Sondeos'
        };
        
        // Si no está en el mapa, intentar formatear el nombre
        if (names[name]) {
            return names[name];
        }
        
        // Formatear nombre genérico (remover números al final, convertir guiones bajos a espacios)
        return name.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    }

    // Eliminar una capa
    deleteLayer(name) {
        if (!this.layers[name]) {
            console.warn(`⚠️ Capa ${name} no encontrada`);
            return false;
        }

        const layerInfo = this.layers[name];
        const isImported = layerInfo.config && layerInfo.config.isImported;

        if (!isImported) {
            alert('Solo se pueden eliminar capas importadas. Las capas del sistema no se pueden eliminar.');
            return false;
        }

        // Confirmar eliminación
        if (!confirm(`¿Está seguro de que desea eliminar la capa "${this.formatLayerName(name)}"?\n\nEsta acción no se puede deshacer.`)) {
            return false;
        }

        // Eliminar del mapa
        if (window.mapManager && window.mapManager.map) {
            window.mapManager.map.removeLayer(layerInfo.layer);
        }

        // Eliminar de la persistencia si tiene ID
        if (layerInfo.config && layerInfo.config.layerId && window.dataPersistence) {
            window.dataPersistence.deleteImportedLayer(layerInfo.config.layerId);
        }

        // Eliminar del registro
        delete this.layers[name];
        this.activeLayers.delete(name);

        // Actualizar controles
        this.updateLayerControls();

        console.log(`✅ Capa eliminada: ${name}`);
        return true;
    }

    // Obtener capa por nombre
    getLayer(name) {
        return this.layers[name];
    }
}

// Hacer disponible globalmente
window.layerManager = new LayerManager();

