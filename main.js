// Initialisation de la carte avec coordonnées et zoom
let map = L.map('map').setView([49.4419, 1.0934], 10);

// Ajouter le fond de carte par défaut
let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors'
});

let Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.stadiamaps.com/">Stadia Maps</a>'
});

// Contrôle pour changer le fond de carte
let basemap = {
    'Open Street Map': osm,
    'Open Topo Map': OpenTopoMap,
    'Stadia Dark': Stadia_AlidadeSmoothDark
};

L.control.layers(basemap).addTo(map);
L.control.scale().addTo(map); // Ajout de l'échelle

// Fonction pour attribuer une couleur en fonction de la densité
function getColor(densite) {
    return densite > 5413 ? '#641e16' :
           densite > 1500 ? '#a93226' :
           densite > 300 ? '#cd6155' :
           densite > 25 ? '#d98880' :
                          '#feedde';
}

// Style des zones GeoJSON
function style(feature) {
    return {
        fillColor: getColor(feature.properties.densite),
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.9
    };
}

// Mettre en surbrillance une zone
function highlightFeature(e) {
    let layer = e.target;
    layer.setStyle({
        weight: 2,
        color: 'red',
        dashArray: '1',
        fillOpacity: 0.8
    });
    layer.bringToFront();
}

// Réinitialiser le style d'origine
function resetHighlight(e) {
    geojson.resetStyle(e.target);
}

// Fonction de zoom sur une zone
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

// Associer événements et popups
function onEachFeature(feature, layer) {
    let popupContent = `<strong>${feature.properties.nom}</strong><br> Densité: ${feature.properties.densite} hab/km²`;

    layer.on({
        mouseover: function (e) {
            highlightFeature(e);
            layer.openPopup();
        },
        mouseout: function (e) {
            resetHighlight(e);
            layer.closePopup();
        },
        click: zoomToFeature
    });

    layer.bindPopup(popupContent);
}

// Vérifier si les données GeoJSON sont définies
if (typeof rouen_f !== 'undefined') {
    var geojson = L.geoJSON(rouen_f, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);
}

// Ajouter une légende
let legend = L.control({ position: 'bottomleft' });

legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend');
    let grades = [0, 25, 300, 1500, 5413];
    let labels = [];

    div.innerHTML = '<p><strong>Densité de la population (hab/km²)</strong></p>';

    for (let i = 0; i < grades.length; i++) {
        let from = grades[i];
        let to = grades[i + 1];

        labels.push(
            `<i style="background:${getColor(from + 1)}"></i> ${from}${to ? '&ndash;' + to : '+'}`
        );
    }

    div.innerHTML += labels.join('<br>');
    return div;
};

legend.addTo(map);
