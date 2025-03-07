// parametrage de la carte coordonnees et le zoom
var map= L.map('map').setView([49.44189804185607, 1.0934024503415607],10);

// etape 3 : Ajouter un fond du carte 
// liens pour telecharge les tuiles : Leaflet Provider Demo (leaflet-extras.github.io)
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
}).addTo(map);

var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
}).addTo(map);

// parametre les fonds cartes
var basmap= {
    'Open Street Map' : osm,
    'Open Topo Map': OpenTopoMap,
    'Stadia AlidadeSmoothDark':Stadia_AlidadeSmoothDark
};

L.control.layers(basmap).addTo(map)

// connecter le fiche js avec le donnée geojson 
//var rouen = L.geoJSON(rouen_test).addTo(map)
//fonction qui affecte une coleur à la densite de population 
function getColor(densite){
    return densite > 5413 ? '#641e16':
           densite > 1500 ? '#a93226':
           densite > 300 ? '#cd6155':
           densite > 25 ? '#d98880':
                          '#feedde';
}

function style(features){
    return {
        fillColor : getColor(features.properties.densite),
        weight : 1,
        opacity:1,
        color:'white',
        dashArray: '3',
        fillOpacity: 0.95
    };
}

//L.geoJSON(rouen_f,{style:style}).addTo(map)

//fonction pour ajouter le contour 
function HighlightFeature(e){
    var layer= e.target;
    layer.setStyle({
        weight:2,
        color: 'red',
        dashArray:'1',
        fillOpacity:0.8
    });
    layer.bringToFront();
}

//fonction pour réintialiser le contour 
function resetHighlight(e){
    geojson.resetStyle(e.target);
}

//fonction qui lie les événements
function onEachFeature(feature,layer){
    var popupContent ="<strong>"+ feature.properties.nom+"<strong><br>"+ "Densité: " + feature.properties.densite+"habitants/km²";

    layer.on({
        mouseover:function(e){
            HighlightFeature(e);   //surline lors du sourvol
            layer.openPopup();     //Ouvrir le popup lors du survol
        },
        mouseout:function(e){
            resetHighlight(e);     //effacer le surliner lors du sourvol
            layer.closePopup();    //ferme le popup lors du survol
        },
        click: zoomToFeature,      //
    });
    layer.bindPopup(popupContent); //
}
function zoomToFeature(e){
    map.fitBounds(e.target.getBounds());
}

var geojson = L.geoJSON(rouen_f,{style:style, onEachFeature:onEachFeature}).addTo(map)

//ajouter une legend

var legend= L.control({position:'bottomleft'});

legend.onAdd=function(map){
    var div = L.DomUtil.create('div','info legend'),

        grades=[0, 25, 300, 1500, 5413],
        labels=[],
        from,to;
        div.innerHTML='<p>Densité de la population (hab/km²) </p>';
    
        for(var i=0;i<grades.length;i++){
        from=grades[i];
        to=grades[i+1];

        labels.push(
            '<i style="background:' +getColor(from + 1)+ '"></i>'+
            from+ (to ? '&ndash;' + to :'+'));
    }
    
    div.innerHTML+=labels.join('<br>');
    
    return div;
};

legend.addTo(map)