// data-persistence.js - Gestor de persistencia de datos para capas importadas
class DataPersistence {
    constructor() {
        this.storageKey = 'mazocruz_imported_layers';
        this.init();
    }

    init() {
        console.log('💾 Inicializando sistema de persistencia de datos...');
    }

    // Guardar información de capa importada
    saveImportedLayer(layerInfo) {
        const layers = this.getImportedLayers();
        
        // Verificar si la capa ya existe
        const existingIndex = layers.findIndex(l => l.id === layerInfo.id);
        
        if (existingIndex >= 0) {
            layers[existingIndex] = layerInfo;
        } else {
            layers.push(layerInfo);
        }
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(layers));
            console.log(`✅ Capa guardada: ${layerInfo.name}`);
            return true;
        } catch (error) {
            console.error('❌ Error guardando capa:', error);
            return false;
        }
    }

    // Obtener todas las capas importadas
    getImportedLayers() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('❌ Error leyendo capas importadas:', error);
            return [];
        }
    }

    // Eliminar una capa importada
    deleteImportedLayer(layerId) {
        const layers = this.getImportedLayers();
        const filtered = layers.filter(l => l.id !== layerId);
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(filtered));
            console.log(`✅ Capa eliminada: ${layerId}`);
            return true;
        } catch (error) {
            console.error('❌ Error eliminando capa:', error);
            return false;
        }
    }

    // Obtener una capa específica por ID
    getImportedLayer(layerId) {
        const layers = this.getImportedLayers();
        return layers.find(l => l.id === layerId);
    }

    // Limpiar todas las capas importadas
    clearAllImportedLayers() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('✅ Todas las capas importadas eliminadas');
            return true;
        } catch (error) {
            console.error('❌ Error limpiando capas:', error);
            return false;
        }
    }

    // Generar ID único para capa
    generateLayerId() {
        return 'imported_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
    }
}

// Hacer disponible globalmente
window.dataPersistence = new DataPersistence();

