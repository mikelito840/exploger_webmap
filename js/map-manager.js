// map-manager.js - Gestor de mapa adaptado para Mazocruz
class MapManager {
    constructor() {
        this.map = null;
        this.layers = {};
        this.interactions = {};
        this.currentTool = null;
        this.init();
    }

    init() {
        console.log('🗺️ Inicializando MapManager...');
        // Esperar a que el mapa de qgis2web esté creado
        this.waitForMap();
    }

    waitForMap() {
        const checkMap = () => {
            // El mapa de qgis2web se crea como variable global 'map'
            if (typeof map !== 'undefined' && map instanceof ol.Map) {
                this.map = map;
                console.log('✅ Mapa de qgis2web encontrado y conectado');
                this.setupEventListeners();
                this.setupControls();
                
                // Registrar capas existentes en el layerManager
                this.registerExistingLayers();
                
                // Forzar actualización del tamaño después de un breve delay
                setTimeout(() => {
                    this.map.updateSize();
                    console.log('📏 Tamaño del mapa actualizado');
                }, 500);
            } else {
                console.log('⏳ Esperando que el mapa de qgis2web esté listo...');
                setTimeout(checkMap, 100);
            }
        };
        checkMap();
    }

    registerExistingLayers() {
        if (!this.map) return;
        
        console.log('🔄 Registrando capas existentes...');
        const mapLayers = this.map.getLayers();
        
        mapLayers.forEach((layer, index) => {
            // Omitir capas base (tile layers como GoogleSatellite)
            if (layer instanceof ol.layer.Tile && layer.get('title') && layer.get('title').includes('Google')) {
                return;
            }
            
            // Intentar obtener nombre de popuplayertitle primero (más limpio)
            let layerName = layer.get('popuplayertitle');
            
            // Si no hay popuplayertitle, intentar obtener del título
            if (!layerName) {
                const title = layer.get('title');
                if (title) {
                    // Extraer texto del título (puede contener HTML)
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = title;
                    const text = tempDiv.textContent || tempDiv.innerText || '';
                    // Limpiar y crear nombre
                    layerName = text.trim();
                }
            }
            
            // Si todavía no hay nombre, usar el name property o crear uno
            if (!layerName) {
                layerName = layer.get('name') || `layer_${index}`;
            }
            
            // Normalizar nombre (remover espacios, caracteres especiales, pero mantener guiones bajos)
            const normalizedName = layerName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
            
            // Registrar en layerManager
            if (normalizedName && window.layerManager) {
                window.layerManager.addLayer(normalizedName, layer, { originalName: layerName });
                this.layers[normalizedName] = layer;
                // Establecer nombre en la capa para futuras referencias
                layer.set('name', normalizedName);
                layer.set('displayName', layerName); // Guardar nombre original para display
                console.log(`✅ Capa registrada: ${normalizedName} (${layerName})`);
            }
        });
        
        // Restaurar capas importadas
        this.restoreImportedLayers();
        
        // Actualizar controles de capas
        if (window.layerManager) {
            window.layerManager.updateLayerControls();
        }
    }

    restoreImportedLayers() {
        if (!this.map || !window.dataPersistence) {
            return;
        }

        console.log('🔄 Restaurando capas importadas...');
        const importedLayers = window.dataPersistence.getImportedLayers();

        if (importedLayers.length === 0) {
            console.log('ℹ️ No hay capas importadas para restaurar');
            return;
        }

        importedLayers.forEach(layerInfo => {
            try {
                this.restoreImportedLayer(layerInfo);
            } catch (error) {
                console.error(`❌ Error restaurando capa ${layerInfo.name}:`, error);
            }
        });

        console.log(`✅ ${importedLayers.length} capa(s) importada(s) restaurada(s)`);
    }

    restoreImportedLayer(layerInfo) {
        if (!layerInfo.geojson) {
            console.warn(`⚠️ Capa ${layerInfo.name} no tiene datos GeoJSON`);
            return;
        }

        // Crear formato GeoJSON
        const format = new ol.format.GeoJSON();
        
        // Leer features
        let features;
        if (layerInfo.geojson.type === 'FeatureCollection') {
            features = format.readFeatures(layerInfo.geojson, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            });
        } else if (layerInfo.geojson.type === 'Feature') {
            features = format.readFeatures({
                type: 'FeatureCollection',
                features: [layerInfo.geojson]
            }, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            });
        } else {
            return; // No soportado
        }

        if (!features || features.length === 0) {
            console.warn(`⚠️ Capa ${layerInfo.name} no tiene features`);
            return;
        }

        // Crear estilo
        const color = layerInfo.color || '#3388ff';
        const style = this.createStyleFromColor(color);

        // Crear source y layer
        const source = new ol.source.Vector({
            features: features
        });

        const layer = new ol.layer.Vector({
            source: source,
            style: style,
            popuplayertitle: layerInfo.displayName || layerInfo.name,
            interactive: true,
            title: layerInfo.displayName || layerInfo.name
        });

        // Agregar al mapa
        this.map.addLayer(layer);

        // Registrar en layerManager
        if (window.layerManager) {
            window.layerManager.addLayer(layerInfo.name, layer, {
                originalName: layerInfo.displayName || layerInfo.name,
                isImported: true,
                layerId: layerInfo.id,
                color: color
            });
        }

        // Registrar en this.layers
        this.layers[layerInfo.name] = layer;
        layer.set('name', layerInfo.name);
        layer.set('displayName', layerInfo.displayName || layerInfo.name);

        console.log(`✅ Capa restaurada: ${layerInfo.name} (${features.length} features)`);
    }

    createStyleFromColor(color) {
        // Convertir color hex a rgba
        const hex = color.replace('#', '');
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        
        return function(feature) {
            const geometry = feature.getGeometry();
            const geometryType = geometry.getType();
            
            let style;
            
            if (geometryType === 'Point' || geometryType === 'MultiPoint') {
                style = new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 6,
                        fill: new ol.style.Fill({ color: color }),
                        stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
                    })
                });
            } else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
                style = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: color,
                        width: 2
                    })
                });
            } else {
                // Polygon o MultiPolygon
                style = new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: `rgba(${r}, ${g}, ${b}, 0.3)`
                    }),
                    stroke: new ol.style.Stroke({
                        color: color,
                        width: 2
                    })
                });
            }
            
            return style;
        };
    }

    setupControls() {
        console.log('🔄 Configurando controles...');

        // Controles de zoom (si no existen ya)
        const zoomIn = document.getElementById('zoom-in');
        const zoomOut = document.getElementById('zoom-out');
        const resetView = document.getElementById('reset-view');

        if (zoomIn && this.map) {
            zoomIn.addEventListener('click', () => {
                const view = this.map.getView();
                view.animate({ zoom: view.getZoom() + 1, duration: 250 });
            });
        }

        if (zoomOut && this.map) {
            zoomOut.addEventListener('click', () => {
                const view = this.map.getView();
                view.animate({ zoom: view.getZoom() - 1, duration: 250 });
            });
        }

        if (resetView && this.map) {
            resetView.addEventListener('click', () => {
                // Restablecer a la vista inicial de Mazocruz
                this.map.getView().fit([-7893376.269607, -1997065.017214, -7691292.977852, -1840761.536293], this.map.getSize());
            });
        }

        // Toggle sidebar - manejar redimensionamiento
        const toggleSidebar = document.getElementById('toggle-sidebar');
        if (toggleSidebar) {
            toggleSidebar.addEventListener('click', () => {
                setTimeout(() => {
                    if (this.map) {
                        this.map.updateSize();
                        console.log('📏 Mapa redimensionado después de toggle sidebar');
                    }
                }, 350);
            });
        }

        console.log('✅ Controles configurados');
    }

    setupEventListeners() {
        if (!this.map) return;

        console.log('🔄 Configurando event listeners...');

        // Evento de clic en el mapa para información (si no está ya manejado por qgis2web)
        // El popup de qgis2web ya maneja los clics, así que solo agregamos funcionalidad adicional si es necesario

        // Evento cuando el mapa termina de renderizar
        this.map.on('rendercomplete', () => {
            console.log('🎨 Mapa renderizado completamente');
        });

        console.log('✅ Event listeners configurados');
    }

    // Método para forzar actualización del tamaño
    updateMapSize() {
        if (this.map) {
            setTimeout(() => {
                this.map.updateSize();
                console.log('📏 Tamaño del mapa actualizado forzadamente');
            }, 100);
        }
    }

    setTool(tool) {
        console.log(`🛠️ Configurando herramienta: ${tool}`);
        this.clearInteractions();
        this.currentTool = tool;

        switch(tool) {
            case 'measure':
                this.setupMeasureTool();
                break;
            case 'draw-point':
                this.setupDrawTool('Point');
                break;
            case 'draw-line':
                this.setupDrawTool('LineString');
                break;
            case 'draw-polygon':
                this.setupDrawTool('Polygon');
                break;
            default:
                console.log(`ℹ️ Herramienta ${tool} no requiere interacciones especiales`);
        }
    }

    setupMeasureTool() {
        console.log('📏 Configurando herramienta de medición...');
        // Implementación básica - puede expandirse
        alert('Herramienta de medición - En desarrollo');
    }

    setupDrawTool(geometryType) {
        if (!window.authSystem || !window.authSystem.hasPermission('write')) {
            alert('No tiene permisos para editar datos');
            return;
        }

        console.log(`✏️ Configurando herramienta de dibujo: ${geometryType}`);
        // Implementación básica - puede expandirse
        alert(`Herramienta de dibujo (${geometryType}) - En desarrollo`);
    }

    clearInteractions() {
        Object.values(this.interactions).forEach(interaction => {
            if (this.map) {
                this.map.removeInteraction(interaction);
            }
        });
        this.interactions = {};
    }

    // Método para agregar capas adicionales
    addLayer(layer, name) {
        if (!this.map) return;
        
        this.map.addLayer(layer);
        if (name) {
            this.layers[name] = layer;
            if (window.layerManager) {
                window.layerManager.addLayer(name, layer);
            }
        }
    }

    // Método para obtener una capa por nombre
    getLayer(name) {
        return this.layers[name];
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM listo, creando MapManager...');
    window.mapManager = new MapManager();
});

