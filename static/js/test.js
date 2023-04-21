// Set up the Leaflet map and add the Mapbox Streets tile layer to the map
L.Control.Clock = L.Control.extend({
  options: {
    position: 'topleft',
  },

  onAdd: function () {
    var container = L.DomUtil.create('div', 'leaflet-control-clock');
    container.style.fontSize = '24px'; // Increase font size

    // Add styles to the container
    container.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    container.style.borderRadius = '5px';
    container.style.padding = '5px 10px';
    container.style.fontSize = '40px';
    container.style.fontWeight = 'bold';
    container.style.color = '#333';

    setInterval(function () {
      var currentTime = new Date();
      var hours = currentTime.getHours().toString().padStart(2, '0');
      var minutes = currentTime.getMinutes().toString().padStart(2, '0');
      var seconds = currentTime.getSeconds().toString().padStart(2, '0');

      container.innerHTML = hours + ':' + minutes + ':' + seconds;
    }, 1000);

    return container;
  },
});

L.control.clock = function (options) {
  return new L.Control.Clock(options);
};

function getInitialLayers() {
  var currentHour = new Date().getHours();
  if (currentHour >= 18 || currentHour < 6) {
    return [nightmap];
  } else {
    return [daymap];
  }
}

var daymap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'timng/clg7l7zdk000001qrbcimgzn8',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoidGltbmciLCJhIjoiY2xmMHBtNThwMDBxejNxcGpoY2c2aWxtNyJ9.2Z3rbpaUVbhqeuhxlfyQ2g'
  });

var daymap_detail = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'timng/clg7lan83001b01pjxi3ju52t',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoidGltbmciLCJhIjoiY2xmMHBtNThwMDBxejNxcGpoY2c2aWxtNyJ9.2Z3rbpaUVbhqeuhxlfyQ2g'
  });

var nightmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'timng/clg7kmhr5000a01n2wlszhy2p',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoidGltbmciLCJhIjoiY2xmMHBtNThwMDBxejNxcGpoY2c2aWxtNyJ9.2Z3rbpaUVbhqeuhxlfyQ2g'
  });

var nightmap_detail = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'timng/clg777o0g000501nsn81gkpze',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoidGltbmciLCJhIjoiY2xmMHBtNThwMDBxejNxcGpoY2c2aWxtNyJ9.2Z3rbpaUVbhqeuhxlfyQ2g'
  });

var map = L.map('map', {layers: getInitialLayers()}).setView([51.032077, -114.052983], 13);

var currentHour = new Date().getHours();

if (currentHour >= 18 || currentHour < 6) {
  var layer1 = {
    "Navigation Base Map": nightmap,
  };

  var layer2 = {
    "Facilities Visualization": nightmap_detail,
  };
} else {
  var layer1 = {
    "Navigation Base Map": daymap,
  };

  var layer2 = {
    "Facilities Visualization": daymap_detail,
  };
}

L.control.layers(layer1, layer2).addTo(map);

var clockControl = new L.Control.Clock({position: 'topleft'});
clockControl.addTo(map);

// Get the clock wrapper element
var clockWrapper = document.getElementById('clock-wrapper');
// Append the clock control to the clock wrapper
clockWrapper.appendChild(clockControl.getContainer());


