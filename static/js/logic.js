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
      layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "<p>" + "Depth: " + feature.geometry['coordinates'][2] + " km" + "</p>" + "<p>" + "Mag : " + feature.properties.mag + "</p>")
    },
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng, {
          radius: radiusSize(feature.properties.mag),
          fillColor: chooseColor(feature.geometry['coordinates'][2]),
          fillOpacity: .99999,
          color: "white"
      })
    }
  });
  createMap(earthquakes)
};

function createMap(earthquakes) {
  // Define base layers
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
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [outdoorsmap, earthquakes, tectonicPlates]
  });
  d3.json(platesUrl, function (tectData) {
    L.geoJSON(tectData, {
      color: "red",
      weight: 1
    }).addTo(tectonicPlates)
  });
  // Create layer control, and add to map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create legend
  var info = L.control({position: "bottomright"});

  info.onAdd = function () {
    var div = L.DomUtil.create("div", "legend");
    return div;
  }
    
  info.addTo(myMap);
  
  document.querySelector(".legend").innerHTML=displayLegend();
  
  function displayLegend(){
    var legendInfo = [{
        limit: "0-5 km",
        color: '#FFFF00'
    },{
        limit: "5-10 km",
        color: '#FFA500'
    },{
        limit: "10-15 km",
        color: '#FF4500'
    },{
        limit: "15-20 km",
        color: '#FF0000'
    },{
        limit: "20+ km",
        color: '#800000'
    }];

    var header = "<h3 style = \"color:green; text-align:center;\">Depth</h3><hr>";

    var strng = "";

    for (i = 0; i < legendInfo.length; i++){
        strng += "<p style = \"background-color: "+legendInfo[i].color+"; text-align:center;\"><strong style = \"color:SeaGreen\">"+legendInfo[i].limit+"</strong></p> "
    };
    
    return header+strng;

  }
}

// Marker functions
function radiusSize(mag) {
  return mag * 25000
}
function chooseColor(d) {
  // switch(true){
  //   case (d > 20):
  //       return '#800000';
  //   case (d > 15):
  //       return '#FF0000';
  //   case (d > 10):
  //       return '#FF4500';
  //   case (d > 5):
  //       return '#FFA500';
  //   default:
  //       return '#FFFF00';
  // };

  // if (d > 20) {
  //   var outcome = '#800000';
  // } else if (d > 15) {
  //   var outcome = '#FF0000';
  // } else if (d > 10) {
  //   var outcome = '#FF4500';
  // } else if (d > 5) {
  //   var outcome = '#FFA500';
  // } else {
  //   var outcome = '#FFFF00';
  // }
  // return outcome;

  return d > 20 ? '#800000' :
         d > 15 ? '#FF0000' :
         d > 10 ? '#FF4500' :
         d > 5  ? '#FFA500' :
                  '#FFFF00';
}