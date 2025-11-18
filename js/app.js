// app.js - Aplicación principal de Mazocruz
class MazocruzApp {
    constructor() {
        this.auth = window.authSystem;
        this.mapManager = window.mapManager;
        this.layerManager = window.layerManager;
        this.userManager = window.userManager;
        
        this.init();
    }

    async init() {
        try {
            console.log('🔧 Inicializando aplicación Mazocruz...');
            
            // Esperar a que el sistema de autenticación esté listo
            await this.waitForAuth();
            
            // Actualizar UI según rol
            this.updateUIForRole();
            
            // Configurar manejadores de herramientas
            this.setupToolHandlers();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Esperar a que el mapa esté listo
            await this.waitForMap();
            
            // Ocultar loading si existe
            const loading = document.getElementById('loading');
            if (loading) {
                loading.style.display = 'none';
            }
            
            console.log('✅ Sistema Mazocruz inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando la aplicación:', error);
            const loading = document.getElementById('loading');
            if (loading) {
                loading.style.display = 'none';
            }
        }
    }

    waitForAuth() {
        return new Promise((resolve) => {
            if (this.auth && this.auth.currentUser) {
                resolve();
            } else {
                // Esperar un poco más si es necesario
                setTimeout(() => {
                    if (this.auth && this.auth.currentUser) {
                        resolve();
                    } else {
                        console.warn('⚠️ Autenticación no disponible, continuando...');
                        resolve();
                    }
                }, 1000);
            }
        });
    }

    waitForMap() {
        return new Promise((resolve) => {
            const checkMap = () => {
                if (this.mapManager && this.mapManager.map) {
                    resolve();
                } else {
                    console.log('⏳ Esperando que el mapa esté listo...');
                    setTimeout(checkMap, 100);
                }
            };
            checkMap();
        });
    }

    updateUIForRole() {
        if (!this.auth || !this.auth.currentUser) {
            console.warn('⚠️ No hay usuario autenticado');
            return;
        }

        const role = this.auth.currentUser.role;
        console.log(`👤 Usuario autenticado: ${this.auth.currentUser.name}, Rol: ${role}`);
        
        // Mostrar/ocultar herramientas según rol
        document.querySelectorAll('.editor-only').forEach(el => {
            el.style.display = (role === 'editor' || role === 'admin') ? 'block' : 'none';
        });
        
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = (role === 'admin') ? 'block' : 'none';
        });

        // Actualizar controles de capas para mostrar/ocultar botones de eliminar
        if (this.layerManager) {
            this.layerManager.updateLayerControls();
        }
    }

    setupToolHandlers() {
        console.log('🔧 Configurando herramientas...');
        
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.currentTarget.dataset.tool;
                console.log(`🛠️ Herramienta seleccionada: ${tool}`);
                this.handleToolSelection(tool);
            });
        });
    }

    handleToolSelection(tool) {
        switch(tool) {
            case 'manage-users':
                if (this.userManager) {
                    this.userManager.showUserManagement();
                } else {
                    alert('Gestor de usuarios no disponible');
                }
                break;
            case 'import-data':
                this.importData();
                break;
            default:
                if (this.mapManager) {
                    this.mapManager.setTool(tool);
                } else {
                    alert('Mapa no disponible');
                }
        }
    }

    setupEventListeners() {
        // Toggle sidebar
        const toggleBtn = document.getElementById('toggle-sidebar');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
                const icon = toggleBtn.querySelector('i');
                
                // Cambiar ícono según el estado
                if (icon) {
                    if (isCollapsed) {
                        icon.classList.remove('fa-chevron-left');
                        icon.classList.add('fa-chevron-right');
                    } else {
                        icon.classList.remove('fa-chevron-right');
                        icon.classList.add('fa-chevron-left');
                    }
                }
                
                // Redimensionar mapa después de toggle
                setTimeout(() => {
                    if (this.mapManager && this.mapManager.map) {
                        this.mapManager.map.updateSize();
                    }
                }, 300);
            });
        }

        // Logout
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (this.auth) {
                    this.auth.logout();
                }
            });
        }
    }

    importData() {
        if (!this.auth || !this.auth.hasPermission('import_data')) {
            alert('No tiene permisos para importar datos');
            return;
        }
        
        this.showImportModal();
    }

    showImportModal() {
        // Crear modal si no existe
        let modal = document.getElementById('importDataModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'importDataModal';
            modal.className = 'modal fade';
            modal.setAttribute('tabindex', '-1');
            modal.innerHTML = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-file-import"></i> Importar Datos GeoJSON
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="import-layer-name" class="form-label">Nombre de la Capa</label>
                                <input type="text" class="form-control" id="import-layer-name" 
                                       placeholder="Ej: Puntos de Interés" required>
                                <small class="form-text text-muted">Ingrese un nombre descriptivo para la capa</small>
                            </div>
                            <div class="mb-3">
                                <label for="import-geojson-file" class="form-label">Archivo GeoJSON</label>
                                <input type="file" class="form-control" id="import-geojson-file" 
                                       accept=".geojson,.json" required>
                                <small class="form-text text-muted">Seleccione un archivo GeoJSON válido</small>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Color de la Capa</label>
                                <div class="d-flex align-items-center gap-2">
                                    <input type="color" class="form-control form-control-color" 
                                           id="import-layer-color" value="#3388ff" title="Seleccionar color">
                                    <input type="text" class="form-control" id="import-layer-color-hex" 
                                           value="#3388ff" placeholder="#3388ff" maxlength="7">
                                </div>
                                <small class="form-text text-muted">Color para visualizar las geometrías</small>
                            </div>
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle"></i>
                                <strong>Nota:</strong> Los datos importados se guardarán permanentemente y estarán disponibles en futuras sesiones.
                            </div>
                            <div id="import-error" class="alert alert-danger" style="display: none;"></div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="btn-import-confirm">
                                <i class="fas fa-upload"></i> Importar
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Sincronizar color picker y input de texto
            const colorPicker = modal.querySelector('#import-layer-color');
            const colorHex = modal.querySelector('#import-layer-color-hex');
            
            colorPicker.addEventListener('input', (e) => {
                colorHex.value = e.target.value;
            });
            
            colorHex.addEventListener('input', (e) => {
                const value = e.target.value;
                if (/^#[0-9A-F]{6}$/i.test(value)) {
                    colorPicker.value = value;
                }
            });
        }
        
        // Resetear formulario
        document.getElementById('import-layer-name').value = '';
        document.getElementById('import-geojson-file').value = '';
        document.getElementById('import-layer-color').value = '#3388ff';
        document.getElementById('import-layer-color-hex').value = '#3388ff';
        document.getElementById('import-error').style.display = 'none';
        
        // Mostrar modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        // Configurar evento de importación
        const confirmBtn = document.getElementById('btn-import-confirm');
        confirmBtn.onclick = () => this.processImport();
    }

    async processImport() {
        const nameInput = document.getElementById('import-layer-name');
        const fileInput = document.getElementById('import-geojson-file');
        const colorInput = document.getElementById('import-layer-color');
        const errorDiv = document.getElementById('import-error');
        
        // Validar campos
        const layerName = nameInput.value.trim();
        if (!layerName) {
            errorDiv.textContent = 'Por favor, ingrese un nombre para la capa';
            errorDiv.style.display = 'block';
            return;
        }
        
        if (!fileInput.files || fileInput.files.length === 0) {
            errorDiv.textContent = 'Por favor, seleccione un archivo GeoJSON';
            errorDiv.style.display = 'block';
            return;
        }
        
        const file = fileInput.files[0];
        const color = colorInput.value;
        
        try {
            // Leer archivo
            const text = await file.text();
            const geojsonData = JSON.parse(text);
            
            // Validar que sea GeoJSON válido
            if (!geojsonData.type || (geojsonData.type !== 'FeatureCollection' && geojsonData.type !== 'Feature' && geojsonData.type !== 'Geometry')) {
                throw new Error('El archivo no es un GeoJSON válido');
            }
            
            // Crear capa
            this.createLayerFromGeoJSON(geojsonData, layerName, color);
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('importDataModal'));
            if (modal) {
                modal.hide();
            }
            
        } catch (error) {
            console.error('❌ Error importando GeoJSON:', error);
            errorDiv.textContent = `Error al importar: ${error.message}`;
            errorDiv.style.display = 'block';
        }
    }

    createLayerFromGeoJSON(geojsonData, layerName, color) {
        if (!this.mapManager || !this.mapManager.map) {
            alert('El mapa no está disponible');
            return;
        }
        
        try {
            // Normalizar nombre para ID
            const normalizedName = layerName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
            const layerId = window.dataPersistence.generateLayerId();
            
            // Crear formato GeoJSON
            const format = new ol.format.GeoJSON();
            
            // Leer features
            let features;
            if (geojsonData.type === 'FeatureCollection') {
                features = format.readFeatures(geojsonData, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:3857'
                });
            } else if (geojsonData.type === 'Feature') {
                features = format.readFeatures({
                    type: 'FeatureCollection',
                    features: [geojsonData]
                }, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:3857'
                });
            } else {
                // Geometry
                features = format.readFeatures({
                    type: 'FeatureCollection',
                    features: [{
                        type: 'Feature',
                        geometry: geojsonData
                    }]
                }, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:3857'
                });
            }
            
            if (!features || features.length === 0) {
                throw new Error('No se encontraron features en el GeoJSON');
            }
            
            // Crear estilo basado en el color
            const style = this.createStyleFromColor(color);
            
            // Crear source y layer
            const source = new ol.source.Vector({
                features: features
            });
            
            const layer = new ol.layer.Vector({
                source: source,
                style: style,
                popuplayertitle: layerName,
                interactive: true,
                title: layerName
            });
            
            // Agregar al mapa
            this.mapManager.map.addLayer(layer);
            
            // Registrar en layerManager
            if (window.layerManager) {
                window.layerManager.addLayer(normalizedName, layer, {
                    originalName: layerName,
                    isImported: true,
                    layerId: layerId,
                    color: color
                });
            }
            
            // Guardar en persistencia
            const layerInfo = {
                id: layerId,
                name: normalizedName,
                displayName: layerName,
                geojson: geojsonData,
                color: color,
                importedAt: new Date().toISOString()
            };
            
            window.dataPersistence.saveImportedLayer(layerInfo);
            
            // Ajustar vista si es necesario
            const extent = source.getExtent();
            if (extent && extent.length === 4 && !isNaN(extent[0])) {
                this.mapManager.map.getView().fit(extent, {
                    padding: [50, 50, 50, 50],
                    maxZoom: 15
                });
            }
            
            console.log(`✅ Capa importada: ${layerName} (${features.length} features)`);
            alert(`Capa "${layerName}" importada exitosamente con ${features.length} elemento(s)`);
            
        } catch (error) {
            console.error('❌ Error creando capa:', error);
            alert(`Error al crear la capa: ${error.message}`);
        }
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
}

// Inicializar la aplicación cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 DOM cargado, iniciando aplicación Mazocruz...');
    
    // Esperar a que los componentes estén listos
    await new Promise(resolve => setTimeout(resolve, 500));
    
    window.mazocruzApp = new MazocruzApp();
});


