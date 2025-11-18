var wms_layers = [];


        var lyr_GoogleSatellite_0 = new ol.layer.Tile({
            'title': 'Google Satellite',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
            attributions: '&nbsp;&middot; <a href="https://www.google.at/permissions/geoguidelines/attr-guide.html">Map data ©2015 Google</a>',
                url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
            })
        });
var format_ConcesionesSantaRosa_Mazocruz_1 = new ol.format.GeoJSON();
var features_ConcesionesSantaRosa_Mazocruz_1 = format_ConcesionesSantaRosa_Mazocruz_1.readFeatures(json_ConcesionesSantaRosa_Mazocruz_1, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_ConcesionesSantaRosa_Mazocruz_1 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_ConcesionesSantaRosa_Mazocruz_1.addFeatures(features_ConcesionesSantaRosa_Mazocruz_1);
var lyr_ConcesionesSantaRosa_Mazocruz_1 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_ConcesionesSantaRosa_Mazocruz_1, 
                style: style_ConcesionesSantaRosa_Mazocruz_1,
                popuplayertitle: 'Concesiones SantaRosa_Mazocruz',
                interactive: true,
                title: '<img src="styles/legend/ConcesionesSantaRosa_Mazocruz_1.png" /> Concesiones SantaRosa_Mazocruz'
            });
var format_Volcanes_2 = new ol.format.GeoJSON();
var features_Volcanes_2 = format_Volcanes_2.readFeatures(json_Volcanes_2, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Volcanes_2 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Volcanes_2.addFeatures(features_Volcanes_2);
var lyr_Volcanes_2 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_Volcanes_2, 
                style: style_Volcanes_2,
                popuplayertitle: 'Volcanes',
                interactive: true,
                title: '<img src="styles/legend/Volcanes_2.png" /> Volcanes'
            });
var format_Geoqumica_franja1_3 = new ol.format.GeoJSON();
var features_Geoqumica_franja1_3 = format_Geoqumica_franja1_3.readFeatures(json_Geoqumica_franja1_3, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Geoqumica_franja1_3 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Geoqumica_franja1_3.addFeatures(features_Geoqumica_franja1_3);
var lyr_Geoqumica_franja1_3 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_Geoqumica_franja1_3, 
                style: style_Geoqumica_franja1_3,
                popuplayertitle: 'Geoquímica_franja1',
                interactive: true,
                title: '<img src="styles/legend/Geoqumica_franja1_3.png" /> Geoquímica_franja1'
            });
var format_Accesos_principales_4 = new ol.format.GeoJSON();
var features_Accesos_principales_4 = format_Accesos_principales_4.readFeatures(json_Accesos_principales_4, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Accesos_principales_4 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Accesos_principales_4.addFeatures(features_Accesos_principales_4);
var lyr_Accesos_principales_4 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_Accesos_principales_4, 
                style: style_Accesos_principales_4,
                popuplayertitle: 'Accesos_principales',
                interactive: true,
                title: '<img src="styles/legend/Accesos_principales_4.png" /> Accesos_principales'
            });

lyr_GoogleSatellite_0.setVisible(true);lyr_ConcesionesSantaRosa_Mazocruz_1.setVisible(true);lyr_Volcanes_2.setVisible(true);lyr_Geoqumica_franja1_3.setVisible(true);lyr_Accesos_principales_4.setVisible(true);
var layersList = [lyr_GoogleSatellite_0,lyr_ConcesionesSantaRosa_Mazocruz_1,lyr_Volcanes_2,lyr_Geoqumica_franja1_3,lyr_Accesos_principales_4];
lyr_ConcesionesSantaRosa_Mazocruz_1.set('fieldAliases', {'CODIGOU': 'CODIGOU', 'FEC_DENU': 'FEC_DENU', 'CONCESION': 'CONCESION', 'TIT_CONCES': 'TIT_CONCES', 'D_ESTADO': 'D_ESTADO', 'CARTA': 'CARTA', 'ZONA': 'ZONA', 'LEYENDA': 'LEYENDA', 'SUSTANCIA': 'SUSTANCIA', 'DEPA': 'DEPA', 'PROVI': 'PROVI', 'DISTRI': 'DISTRI', 'HASDATUM': 'HASDATUM', });
lyr_Volcanes_2.set('fieldAliases', {'Id': 'Id', 'Nombre': 'Nombre', });
lyr_Geoqumica_franja1_3.set('fieldAliases', {'Numeraci��': 'Numeraci��', 'C�digo': 'C�digo', 'Norte': 'Norte', 'Este': 'Este', 'Au_ppb': 'Au_ppb', 'Hg_ppm': 'Hg_ppm', 'Al_%': 'Al_%', 'Sb_ppm': 'Sb_ppm', 'As_ppm': 'As_ppm', 'Be_ppm': 'Be_ppm', 'Bi_ppm': 'Bi_ppm', 'Cd_ppm': 'Cd_ppm', 'Ca_%': 'Ca_%', 'Cr_ppm': 'Cr_ppm', 'Co_ppm': 'Co_ppm', 'Cu_ppm': 'Cu_ppm', 'Fe_%': 'Fe_%', 'La_ppm': 'La_ppm', 'Pb_ppm': 'Pb_ppm', 'Mg_%': 'Mg_%', 'Mn_ppm': 'Mn_ppm', 'Mo_ppm': 'Mo_ppm', 'Ni_ppm': 'Ni_ppm', 'P_%': 'P_%', 'K_%': 'K_%', 'Sc_ppm': 'Sc_ppm', 'Ag_ppm': 'Ag_ppm', 'Na_%': 'Na_%', 'Sr_ppm': 'Sr_ppm', 'Sn_ppm': 'Sn_ppm', 'Ti_%': 'Ti_%', 'W_ppm': 'W_ppm', 'V_ppm': 'V_ppm', 'Y_ppm': 'Y_ppm', 'Zn_ppm': 'Zn_ppm', 'Zr_ppm': 'Zr_ppm', 'Tl_ppm': 'Tl_ppm', });
lyr_Accesos_principales_4.set('fieldAliases', {'Id': 'Id', 'Tipo': 'Tipo', 'Distancia': 'Distancia', 'Fotos': 'Fotos', });
lyr_ConcesionesSantaRosa_Mazocruz_1.set('fieldImages', {'CODIGOU': 'TextEdit', 'FEC_DENU': 'DateTime', 'CONCESION': 'TextEdit', 'TIT_CONCES': 'TextEdit', 'D_ESTADO': 'TextEdit', 'CARTA': 'TextEdit', 'ZONA': 'TextEdit', 'LEYENDA': 'TextEdit', 'SUSTANCIA': 'TextEdit', 'DEPA': 'TextEdit', 'PROVI': 'TextEdit', 'DISTRI': 'TextEdit', 'HASDATUM': 'TextEdit', });
lyr_Volcanes_2.set('fieldImages', {'Id': 'TextEdit', 'Nombre': 'TextEdit', });
lyr_Geoqumica_franja1_3.set('fieldImages', {'Numeraci��': 'TextEdit', 'C�digo': 'TextEdit', 'Norte': 'TextEdit', 'Este': 'TextEdit', 'Au_ppb': 'TextEdit', 'Hg_ppm': 'TextEdit', 'Al_%': 'TextEdit', 'Sb_ppm': 'TextEdit', 'As_ppm': 'TextEdit', 'Be_ppm': 'TextEdit', 'Bi_ppm': 'TextEdit', 'Cd_ppm': 'TextEdit', 'Ca_%': 'TextEdit', 'Cr_ppm': 'TextEdit', 'Co_ppm': 'TextEdit', 'Cu_ppm': 'TextEdit', 'Fe_%': 'TextEdit', 'La_ppm': 'TextEdit', 'Pb_ppm': 'TextEdit', 'Mg_%': 'TextEdit', 'Mn_ppm': 'TextEdit', 'Mo_ppm': 'TextEdit', 'Ni_ppm': 'TextEdit', 'P_%': 'TextEdit', 'K_%': 'TextEdit', 'Sc_ppm': 'TextEdit', 'Ag_ppm': 'TextEdit', 'Na_%': 'TextEdit', 'Sr_ppm': 'TextEdit', 'Sn_ppm': 'TextEdit', 'Ti_%': 'TextEdit', 'W_ppm': 'TextEdit', 'V_ppm': 'TextEdit', 'Y_ppm': 'TextEdit', 'Zn_ppm': 'TextEdit', 'Zr_ppm': 'TextEdit', 'Tl_ppm': 'TextEdit', });
lyr_Accesos_principales_4.set('fieldImages', {'Id': 'TextEdit', 'Tipo': '', 'Distancia': '', 'Fotos': '', });
lyr_ConcesionesSantaRosa_Mazocruz_1.set('fieldLabels', {'CODIGOU': 'no label', 'FEC_DENU': 'no label', 'CONCESION': 'no label', 'TIT_CONCES': 'no label', 'D_ESTADO': 'no label', 'CARTA': 'no label', 'ZONA': 'no label', 'LEYENDA': 'no label', 'SUSTANCIA': 'no label', 'DEPA': 'no label', 'PROVI': 'no label', 'DISTRI': 'no label', 'HASDATUM': 'no label', });
lyr_Volcanes_2.set('fieldLabels', {'Id': 'no label', 'Nombre': 'no label', });
lyr_Geoqumica_franja1_3.set('fieldLabels', {'Numeraci��': 'no label', 'C�digo': 'no label', 'Norte': 'no label', 'Este': 'no label', 'Au_ppb': 'no label', 'Hg_ppm': 'no label', 'Al_%': 'no label', 'Sb_ppm': 'no label', 'As_ppm': 'no label', 'Be_ppm': 'no label', 'Bi_ppm': 'no label', 'Cd_ppm': 'no label', 'Ca_%': 'no label', 'Cr_ppm': 'no label', 'Co_ppm': 'no label', 'Cu_ppm': 'no label', 'Fe_%': 'no label', 'La_ppm': 'no label', 'Pb_ppm': 'no label', 'Mg_%': 'no label', 'Mn_ppm': 'no label', 'Mo_ppm': 'no label', 'Ni_ppm': 'no label', 'P_%': 'no label', 'K_%': 'no label', 'Sc_ppm': 'no label', 'Ag_ppm': 'no label', 'Na_%': 'no label', 'Sr_ppm': 'no label', 'Sn_ppm': 'no label', 'Ti_%': 'no label', 'W_ppm': 'no label', 'V_ppm': 'no label', 'Y_ppm': 'no label', 'Zn_ppm': 'no label', 'Zr_ppm': 'no label', 'Tl_ppm': 'no label', });
lyr_Accesos_principales_4.set('fieldLabels', {'Id': 'no label', 'Tipo': 'no label', 'Distancia': 'no label', 'Fotos': 'no label', });
lyr_Accesos_principales_4.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});