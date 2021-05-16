// Store APIs inside URLs
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform request on queryUrl and retrieve features from geojson
d3.json(queryUrl, function (data) {
  createFeatures(data.features);
});

// Define each feature function
function createFeatures(earthquakeData) {
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function (feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "<p>" + "Depth: " + feature.geometry['coordinates'][2] + "</p>" + "<p>" + "Mag : " + feature.properties.mag + "</p>")
    },
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng, {
          radius: radiusSize(feature.properties.mag),
          fillColor: getColor(feature.geometry['coordinates'][2]),
          fillOpacity: .75,
          color: "white"
      })
    }
  });
  createMap(earthquakes)
};

function createMap(earthquakes) {
  // Define map layers
  var outdoorsmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/outdoors-v11",
    accessToken: API_KEY
  });
  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });
  var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-v9",
    accessToken: API_KEY
  });
  // Define base maps
  var baseMaps = {
    "Outdoors Map": outdoorsmap,
    "Dark Map": darkmap,
    "Satellite Map": satellitemap
  };
  var tectonicPlates = new L.LayerGroup()
  // Create overlay
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
  };
  // Create map, providing layers to display
  var myMap = L.map("mapid", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [outdoorsmap, earthquakes, tectonicPlates]
  });
  d3.json(platesUrl, function (tectData) {
    L.geoJSON(tectData, {
      color: "blue",
      weight: 2
    }).addTo(tectonicPlates)
  });
  // Create layer control, and add to map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create legend https://gis.stackexchange.com/questions/193161/add-legend-to-leaflet-map
  var legend = L.control({position: "bottomleft"});

  legend.onAdd = function () {
    var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 5, 10, 15, 20],
    labels = [],
    colors = ["blue", "green", "yellow", "orange", "red"];

    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style=background:' + getColor(grades[i] + 1) + '"></i>' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+')
    }
    return div
  }
  legend.addTo(myMap);
}

// Marker functions
function radiusSize(mag) {
  return mag * 50000
}
function getColor(d) {
  return d > 20 ? 'red' :
         d > 15 ? 'orange' :
         d > 10 ? 'yellow' :
         d > 5  ? 'green' :
                  'blue';
}