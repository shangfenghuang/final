// mapboxgl.accessToken = 'pk.eyJ1IjoiaHVhc2F3IiwiYSI6ImNsZjFxNnFzZjBhdm4zems3OWNzZHNvZ3gifQ.oVkMRAu3eoQCa9KpzhOM_Q'
// var map = new mapboxgl.Map({
//     container: "map",
//     style: 'mapbox://styles/huasaw/clg9viivb000m01o47ctyvruw',
//     center: [-114.06, 51.05],
//     zoom: 11
// });
// // add layer
// map.on('load', function() {
//     map.addSource('contours', {
//         type: 'vector',
//         url: 'mapbox://yekongsun.ahq0bna1'
//     });
    
//     map.addLayer({
//         'id': 'contours',
//         "type": "line",
//         "source": "contours",
//         'paint': {
//             'line-color': {
//                 property: 'volume',
//                 stops: [
//                     [1000, '#69cbf5'],
//                     [48250, '#5E9FC7'],
//                     [95500, '#9AD17B'],
//                     [142750, '#EF6769'],
//                     [190000, '#FCBA70']
//                 ]
//             },
//             'line-width': 2,
//             'line-opacity': 1,
//         },
//         "source-layer": "1-5pi9vx"
//     });
// });

// // 获取当前时间
// var date = new Date();
// var hours = date.getHours();

// // 判断当前是白天还是晚上
// var style = 'mapbox://styles/mapbox/';
// if (hours >= 6 && hours <= 18) {
//   style += 'streets-v11'; // 白天的地图样式
// } else {
//   style += 'dark-v10'; // 晚上的地图样式
// }

// // 创建地图对象并设置样式
// var map = new mapboxgl.Map({
//   container: 'map',
//   style: style, // 根据时间判断使用哪个地图样式
//   center: [-122.4194, 37.7749],
//   zoom: 12
// });


// // 更新时间显示函数
// function updateTime() {
//     var date = new Date();
//     var hours = date.getHours();
//     var minutes = date.getMinutes();
//     var seconds = date.getSeconds();
  
//     // 将时间格式化为字符串
//     var timeStr = (hours < 10 ? '0' : '') + hours + ':';
//     timeStr += (minutes < 10 ? '0' : '') + minutes + ':';
//     timeStr += (seconds < 10 ? '0' : '') + seconds;
  
//     // 更新页面上的时间显示
//     document.getElementById('time').innerHTML = timeStr;
//   }
  
//   // 定时更新时间显示
//   setInterval(updateTime, 1000);
  


<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Demo: Route avoidance with the Directions API and Turf.js</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!-- Mapbox GL JS -->
    <script src="https://api.tiles.mapbox.com/mapbox-gl-js/v2.13.0/mapbox-gl.js"></script>
    <link
      href="https://api.tiles.mapbox.com/mapbox-gl-js/v2.13.0/mapbox-gl.css"
      rel="stylesheet"
    />

    <!-- Mapbox GL Directions -->
    <script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.0.2/mapbox-gl-directions.js"></script>
    <link
      rel="stylesheet"
      href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.0.2/mapbox-gl-directions.css"
      type="text/css"
    />

    <!-- Turf & Polyline -->
    <script src="https://npmcdn.com/@turf/turf/turf.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mapbox-polyline/1.1.1/polyline.js"></script>

    <style>
      body {
        color: #404040;
        font: 400 15px/22px 'Source Sans Pro', 'Helvetica Neue', sans-serif;
        margin: 0;
        padding: 0;
      }

      * {
        box-sizing: border-box;
      }

      #map {
        position: absolute;
        left: 15%;
        top: 0;
        bottom: 0;
        width: 85%;
      }

      .sidebar {
        position: absolute;
        width: 15%;
        height: 100%;
        top: 0;
        left: 0;
        overflow: hidden;
        border-right: 1px solid rgba(0, 0, 0, 0.25);
      }

      h1 {
        font-size: 22px;
        margin: 0;
        font-weight: 400;
      }

      a {
        color: #404040;
        text-decoration: none;
      }

      a:hover {
        color: #101010;
      }

      .heading {
        background: #fff;
        border-bottom: 1px solid #eee;
        min-height: 60px;
        line-height: 60px;
        padding: 0 10px;
      }

      .reports {
        height: 100%;
        overflow: auto;
        padding-bottom: 60px;
      }

      .reports .item {
        display: block;
        border-bottom: 1px solid #eee;
        padding: 10px;
        text-decoration: none;
      }

      .reports .item:last-child {
        border-bottom: none;
      }

      .reports .item .title {
        display: block;
        color: #00853e;
        font-weight: 700;
      }

      .reports .item .warning {
        display: block;
        color: red;
        font-weight: 700;
      }

      .reports .item .title small {
        font-weight: 400;
      }

      .reports .item.active .title,
      .reports .item .title:hover {
        color: #8cc63f;
      }

      .reports .item.active {
        background-color: #f8f8f8;
      }

      ::-webkit-scrollbar {
        width: 3px;
        height: 3px;
        border-left: 0;
        background: rgba(0, 0, 0, 0.1);
      }

      ::-webkit-scrollbar-track {
        background: none;
      }

      ::-webkit-scrollbar-thumb {
        background: #00853e;
        border-radius: 0;
      }
    </style>
  </head>

  <body>
    <div id="map"></div>
    <div class="sidebar">
      <div class="heading">
        <h1>Routes</h1>
      </div>
      <div id="reports" class="reports"></div>
    </div>

    <script>
      mapboxgl.accessToken = 'pk.eyJ1IjoiaHVhc2F3IiwiYSI6ImNsZjFxNnFzZjBhdm4zems3OWNzZHNvZ3gifQ.oVkMRAu3eoQCa9KpzhOM_Q';

      const map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-84.5, 38.05], // starting position
        zoom: 11 // starting zoom
      });

      const directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken,
        unit: 'metric',
        profile: 'mapbox/driving',
        alternatives: 'false',
        geometries: 'geojson'
      });

      map.scrollZoom.enable();
      map.addControl(directions, 'top-right');

      const clearances = {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': [-84.47426, 38.06673]
            },
            'properties': {
              'clearance': "13' 2"
            }
          },
          {
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': [-84.47208, 38.06694]
            },
            'properties': {
              'clearance': "13' 7"
            }
          },
          {
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': [-84.47184, 38.06694]
            },
            'properties': {
              'clearance': "13' 7"
            }
          },
          {
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': [-84.60485, 38.12184]
            },
            'properties': {
              'clearance': "13' 7"
            }
          },
          {
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': [-84.61905, 37.87504]
            },
            'properties': {
              'clearance': "12' 0"
            }
          },
          {
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': [-84.55946, 38.30213]
            },
            'properties': {
              'clearance': "13' 6"
            }
          },
          {
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': [-84.27235, 38.04954]
            },
            'properties': {
              'clearance': "13' 6"
            }
          },
          {
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': [-84.27264, 37.82917]
            },
            'properties': {
              'clearance': "11' 6"
            }
          }
        ]
      };

      const obstacle = turf.buffer(clearances, 0.25, { units: 'kilometers' });

      map.on('load', () => {
        map.addLayer({
          id: 'clearances',
          type: 'fill',
          source: {
            type: 'geojson',
            data: obstacle
          },
          layout: {},
          paint: {
            'fill-color': '#f03b20',
            'fill-opacity': 0.5,
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
    </script>
  </body>
</html>
