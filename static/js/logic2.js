//// Store API inside queryUrl -using hour data for inital build
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
//   preform request on url and retrieve features from GEOJson
d3.json(queryUrl, function (data) {
  createFeatures(data.features);
});

// define each feature function
function createFeatures(earthquakeData) {
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function (feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "<p>" + "Depth: " + feature.geometry['coordinates'][2] + "</p>" + "<p>" + "Mag : " + feature.properties.mag + "</p>")
    },
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,

        {
          radius: radiusSize(feature.properties.mag),
          fillColor: getColor(feature.geometry['coordinates'][2]),
          fillOpacity: .75,
          color: "white",
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
  var satmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-v9",
    accessToken: API_KEY
  });
  // define base maps
  var baseMaps = {
    "Outdoors Map": outdoorsmap,
    "Dark Map": darkmap,
    "Satellite Map": satmap
  };
  var tectonicPlates = new L.LayerGroup()
  //  create overlay object
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Techtonic Plates": tectonicPlates
  };
  // Create our map, giving it the layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [outdoorsmap, earthquakes, tectonicPlates]
  });
  d3.json(tectonicPlatesURL, function (tData) {
    L.geoJSON(tData, {
      color: "blue",
      weight: 2
    })
      .addTo(tectonicPlates)
  })
  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // create legend https://gis.stackexchange.com/questions/193161/add-legend-to-leaflet-map or https://leafletjs.com/examples/choropleth/
  var legend = L.control({
    position: "bottomleft"
  })

  legend.onAdd = function () {
    var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 5, 10, 15, 20],
      labels = []
      colors = ["magenta", "blue", "yellow", "orange", "red"] 
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style=background:' + getColor(grades[i] + 1) + '"></i>' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+')
    }
    return div
  }
  legend.addTo(myMap)
  // var legend = L.control({position:"bottomleft"});
  // legend.onAdd = function(){
  //   var div = L.DomUtil.create("div", "info legend");
  //   var limits = [0,5,10,15,20]
  //   var colors = ["magenta", "blue", "yellow", "orange", "red"]
  //   var lables = [];
  //   var legendInfo = "<h1>Earthquake Depth</h1>" +
  //     "<div class=\"labels\">"+
  //     "<div class=\"min\">" + limits[0] + "</div>" +
  //     "<div class=\"max\">" + limits[limits.length + 1] + "</div>" +
  //     "</div>";
  //   div.innerHTML = legendInfo

  //   limits.forEach(function(limit, index){
  //     lables.push("<li style=\"background-color: " + colors[index] + "\"></li>")
  //   })
  //   div.innerHTML += "<ul>" + lables.join("") + "</ul>"
  //   returndiv
  // }
  // legend.addTo(myMap)

}


// marker functions:
function radiusSize(mag) {
  return mag * 50000
}
function getColor(d) {
  if (d > 20) {
    return "red"
  }
  else if (d > 15) {
    return "orange"
  }
  else if (d > 10) {
    return "yellow"
  }
  else if (d > 5) {
    return "blue"
  } else {
    return "magenta"
  }
}
// function circleColor(d) {
//   return d <  ? 'red' :
//         d > 2 ? 'green' :
//         d > 3 ? 'yellow' :
//         d > 4 ? 'blue' :
//         d > 5 ? 'black' :
//         'purple';
// }

// function radiusSize(mag) {
//   return mag * 50000
// }
// function circleColor(d) {
//   if (d < 1) {
//     return "#fce2fb"
//   }
//   else if (d < 5 & d > 1 ) {
//     return "#fef5ee"
//   }
//   else if (d < 10 & d > 5) {
//     return "#932598"
//   }
//   else if (d > 10) {
//     return "#c91367"
//   } else {
//     return "#380a8a"
//   }