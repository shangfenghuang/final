// get today time
var date = new Date();
var hours = date.getHours();
const crime = document.getElementById('Crimes');
const crimes_text = document.getElementById('Crimes_text');
var history_route = {
        'type': 'FeatureCollection',
        'features': []
      };
var history_marker;
// console.log(history_route);
// if (history_route.features.length == 0){
//   console.log(123);
// }

//  change data and night
var style = 'mapbox://styles/';
if (hours >= 6 && hours <= 18) {
  style += 'timng/clg7l7zdk000001qrbcimgzn8'; //day
  crime.style.display = 'none';
  crimes_text.style.display = 'none';
} else {
  style += 'timng/clg7kmhr5000a01n2wlszhy2p'; // night
  // crime.style.display = 'block';

}
let map;
load_map(style);

const layerList = document.getElementById('menu');
const inputs = layerList.getElementsByTagName('input');
for (const input of inputs) {
  input.onclick = (layer) => {
    const layerId = layer.target.id;
    if (layerId == 'Navigation') {
      map.remove()
      if (hours >= 6 && hours <= 18) {
        load_map('mapbox://styles/timng/clg7l7zdk000001qrbcimgzn8');//day
      } else {
        load_map('mapbox://styles/timng/clg7kmhr5000a01n2wlszhy2p');// night
      }
    } else if (layerId == 'Facilities') {
      map.remove()
      if (hours >= 6 && hours <= 18) {
        load_map('mapbox://styles/timng/clg7lan83001b01pjxi3ju52t');//day
      } else {
        load_map('mapbox://styles/timng/clg777o0g000501nsn81gkpze');// night
      }
    }
    else if (layerId == 'Crimes' && crime.style.display != 'none'){
      load_map('mapbox://styles/timng/clgd7fu7x001g01l3ake6s1ch');
    }
  };
}



function load_map(style) {
  mapboxgl.accessToken = 'pk.eyJ1IjoidGltbmciLCJhIjoiY2xmMHBtNThwMDBxejNxcGpoY2c2aWxtNyJ9.2Z3rbpaUVbhqeuhxlfyQ2g';
  // get today time
  map = new mapboxgl.Map({
  container: 'map', // container id
  style: style,
  center: [-114.052983, 51.032077], // starting position
  zoom: 10 // starting zoom
  });

  var nav = new mapboxgl.NavigationControl();
  map.addControl(nav, 'top-left');

  directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    unit: 'metric',
    profile: 'mapbox/driving',
    alternatives: 'false',
    geometries: 'geojson',
    congestion: true,
    interactive: true,
    controls: {
      inputs: true,
      instructions: true,
      profileSwitcher: true
    }
  });
  map.scrollZoom.enable();
  map.addControl(directions, 'top-right');

  // get position
  var geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true
  });
  map.addControl(geolocate, 'top-left');
  geolocate.on('geolocate', function(position) {
    var lngLat = [position.coords.longitude, position.coords.latitude];
    // console.log(lngLat);
    directions.setOrigin(lngLat);
    // map.setCenter(lngLat);
    // map.setZoom(15);
    Promise.all([fetch('https://data.calgary.ca/resource/x34e-bcjz.json'),
      fetch('https://data.calgary.ca/resource/2axz-xm4q.json')])
      .then(function(responses) {
          return Promise.all(responses.map(function(response) {
            return response.json();
          }));
        })
        .then(function(data) {
          // 处理两个URL的数据
          let distance = 1000;
          let tmp_distance = 1000;
          let commuity_data;
          data[0].forEach(d =>{
            if (d['type'] != 'Community Centre'){
              // console.log(d['point']['coordinates']);
              tmp_distance = euclideanDistance(d['point']['coordinates'], lngLat);
              if (distance > tmp_distance){
                distance = tmp_distance;
                commuity_data = d;
              }
              // console.log(euclideanDistance(d['point']['coordinates'], lngLat));
            }
          })
          distance = 1000;
          tmp_distance = 1000;
          let LRT_data;
          data[1].forEach(d => {
              tmp_distance = euclideanDistance(d['the_geom']['coordinates'], lngLat);
              if (distance > tmp_distance){
                distance = tmp_distance;
                LRT_data = d;
              }
          })
          var popupContent = document.createElement('div');
          var button1 = document.createElement('button');
          button1.textContent = commuity_data['name'];
          button1.title = 'Type:' + commuity_data['type'] + '\nAddress:' + commuity_data['address'];
          button1.addEventListener('click', function() {
            directions.setDestination(commuity_data['point']['coordinates']);
          });
          popupContent.appendChild(button1);
          var button2 = document.createElement('button');
          button2.textContent = LRT_data['stationnam'];
          button2.title = LRT_data['stationnam'];
          button2.addEventListener('click', function() {
            directions.setDestination(LRT_data['the_geom']['coordinates']);
          });
          popupContent.appendChild(button2);
          var popup = new mapboxgl.Popup();
          popup.setLngLat(lngLat)
          .setDOMContent(popupContent);
          var marker = new mapboxgl.Marker().setLngLat(lngLat).addTo(map).setPopup(popup);
          marker.on('mouseenter', function() {
            map.getCanvas().style.cursor = 'pointer';
          });
          marker.on('mouseleave', function() {
            popup.remove();
            map.getCanvas().style.cursor = '';
          });
          geolocate.trigger();
        });
    geolocate.off('geolocate');
  });

  // real-time
  var directionsControl = document.getElementById('directions-control');
  var startNavigationBtn = document.getElementById('start-navigation-btn');
  var exitNavigationBtn = document.getElementById('exit-navigation-btn');

  directions.on('route', function() {
      directionsControl.style.display = 'block';
  });
  let endLocation;
  directions.on('route', function(e) {
      if (e.route.length) {
        endLocation = e.route[0].legs[e.route[0].legs.length - 1].steps[e.route[0].legs[e.route[0].legs.length - 1].steps.length - 1].maneuver.location;
      }
  });

  let intervalId;
  let retryCount=0;
  startNavigationBtn.addEventListener('click', function() {
    // console.log(endLocation);
    if (history_route.features.length != 0){
      history_route.features = [];
    }
    intervalId = setInterval(function() {
      getLocation();
    }, 30000);
  });

  exitNavigationBtn.addEventListener('click', function (){
    setTimeout(function() {
        clearInterval(intervalId);
      }, 100);
    history_route.features = []
    history_marker.remove();
    map.setCenter([-114.052983, 51.032077]);
    map.setZoom(10);
  });

  load_incidents()
}


function load_incidents() {
  // console.log(date)
  var localTime = new Date(date.getTime() - (10*60 + date.getTimezoneOffset())*60*1000);
  const dateString = localTime.toISOString().slice(0, 19) + '.000';
  // console.log(dateString)
  var url = "https://data.calgary.ca/resource/35ra-9556.json";
  fetch(url)
    .then(response => response.json())
    .then(function(datas) {
      var incidents = {
        'type': 'FeatureCollection',
        'features': []
      };
      datas.forEach((d) => {
        if (d['start_dt'] >= dateString){
          incidents.features.push({
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': d['point']['coordinates']
            },
            'properties': {
              'description': d['description'],
              'incident_info': d['incident_info'],
              'start_dt': d['start_dt'],
              'modified_dt': d['modified_dt']
            }
          });
        }
      });
      // console.log(incidents.features);
      const obstacle = turf.buffer(incidents, 0.25, { units: 'kilometers' });

map.on('load', () => {
  map.addLayer({
    id: 'incidents',
    type: 'fill',
    source: {
      type: 'geojson',
      data: obstacle
    },
    layout: {},
    paint: {
      'fill-color': '#f03b20',
      'fill-opacity': 0.05,
      'fill-outline-color': '#f03b20'
    }
});


// Create sources and layers for the returned routes.
// There will be a maximum of 3 results from the Directions API.
// We use a loop to create the sources and layers.
for (let i = 0; i < 3; i++) {

  map.addSource(`route${i}`, {
    type: 'geojson',
    data: {
      type: 'Feature'
    }
  });

  map.addLayer({
    id: `route${i}`,
    type: 'line',
    source: `route${i}`,
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#cccccc',
      'line-opacity': 0.5,
      'line-width': 13,
      'line-blur': 0.5
    }
  });
}
});
// console.log(incidents);
map.on('load', function() {
  map.loadImage('https://shangfenghuang.github.io/images/icon_jiaotongshigu.png', function(error, image) {
    if (error) throw error;
    map.addImage('custom-marker', image);
    map.addLayer({
      id: 'incident',
      type: 'symbol',
      source: {
        type: 'geojson',
        data: incidents
      },
      layout: {
        'icon-image': 'custom-marker',
        'icon-size': 0.2,
        'icon-allow-overlap': true
      },
      paint: { }
    });
  });

// console.log(incidents);
var popup = new mapboxgl.Popup();

map.on('mousemove', function(e) {

var features = map.queryRenderedFeatures(e.point, { layers: ['incident'] });
if (!features.length) {
    popup.remove();
    return;
}

var feature = features[0];

popup.setLngLat(feature.geometry.coordinates)
.setHTML('<h6> description:' + feature.properties.description + '</h6><h6>incident_info:' + feature.properties.incident_info + '</h6>'+
'</h6><h6> start_time:' + feature.properties.start_dt + '</h6>')
.addTo(map);
map.getCanvas().style.cursor = features.length ? 'pointer' : '';
});
});


directions.on('route', (event) => {
  const reports = document.getElementById('reports');
  reports.innerHTML = '';
  const report = reports.appendChild(document.createElement('div'));
  // Add IDs to the routes
  const routes = event.route.map((route, index) => ({
    ...route,
    id: index
  }));

  // Hide all routes by setting the opacity to zero.
  for (let i = 0; i < 3; i++) {
    map.setLayoutProperty(`route${i}`, 'visibility', 'none');
  }

  // display the routes good or bad
  for (const route of routes) {
    // Make each route visible, by setting the opacity to 50%.
    map.setLayoutProperty(`route${route.id}`, 'visibility', 'visible');

    // Get GeoJSON LineString feature of route
    const routeLine = polyline.toGeoJSON(route.geometry);

    // Update the data for the route, updating the visual.
    map.getSource(`route${route.id}`).setData(routeLine);

    const isClear = turf.booleanDisjoint(obstacle, routeLine) === true;

    const collision = isClear ? 'is good!' : 'is bad.';
    const emoji = isClear ? '✔️' : '⚠️';
    const detail = isClear ? 'does not go' : 'goes';
    report.className = isClear ? 'item' : 'item warning';

    if (isClear) {
      map.setPaintProperty(`route${route.id}`, 'line-color', '#74c476');
    } else {
      map.setPaintProperty(`route${route.id}`, 'line-color', '#de2d26');
    }

    // Add a new report section to the sidebar.
    // Assign a unique `id` to the report.
    report.id = `report-${route.id}`;

    // Add the response to the individual report created above.
    const heading = report.appendChild(document.createElement('h3'));

    // Set the class type based on clear value.
    heading.className = isClear ? 'title' : 'warning';
    heading.innerHTML = `${emoji} Route ${route.id + 1} ${collision}`;

    // Add details to the individual report.
    const details = report.appendChild(document.createElement('div'));
    details.innerHTML = `This route ${detail} through an avoidance area.`;
    report.appendChild(document.createElement('hr'));
  }
});
    })
    .catch(error => console.error(error));
}
function euclideanDistance(a, b) {
  var diff = a.map(function(x, i) { return x - b[i]; });
  var squares = diff.map(function(x) { return x * x; });
  var sum = squares.reduce(function(x, y) { return x + y; }, 0);
  var dist = Math.sqrt(sum);
  return dist;
}
function getLocation() {
  navigator.geolocation.getCurrentPosition(function (position) {
        // 获取位置和朝向
        var location = [position.coords.longitude, position.coords.latitude];
        // var bearing = position.coords.heading;
        directions.setOrigin(location);
        map.setCenter(location);
        map.setZoom(15);
        console.log('Location updated');
        // map.setBearing(bearing);
        update_history_route(location)
        // var history_popup = new mapboxgl.Popup();
        // // console.log(history_route.features[history_route.features.length-1]['geometry']['coordinates']);
        // history_popup.setLngLat(history_route.features[history_route.features.length-1]['geometry']['coordinates'])
        //     .addTo(map);
        lngLat = history_route.features[history_route.features.length-1]['geometry']['coordinates'];
        history_marker = new mapboxgl.Marker().setLngLat(lngLat).addTo(map);
      },
      (error) => {
        console.error(error);
      });
}
function update_history_route(coordinates){
  var date = new Date();
  console.log(date);
  history_route.features.push({
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': coordinates,
              'datatime': date
            },
  });
}
