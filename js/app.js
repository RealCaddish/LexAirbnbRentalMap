// set options for the map object
const options = {
  zoomSnap: 0.1,
  center: [36.1627, -86.7816],
  zoom: 11,
  minZoom: 2,
  maxZoom: 13,
};

// creating the map object
const map = L.map('map', options);

// load in data with d3 fetch
const blocksDataRaw = d3.json(
  '/data/geojson/blocks_census_airbnb_joined.geojson'
);
const listingsDataRaw = d3.csv('/data/csv/listings_cleaned.csv');
const listingsGeojson = d3.json('./data/geojson/listings_cleaned.geojson');

const visiblePoints = L.featureGroup().addTo(map);
const hiddenPoints = L.featureGroup();

// promise statement to call an array of data variables then proceed to mapping function
Promise.all([blocksDataRaw, listingsGeojson]).then(drawMap);

// set global variables for map layer
// mapped attribute, and normalizing attribute
let attributeValue = 'total_occu_sum';
let normValue = 'total_unit_sum';

console.log(normValue);

function drawMap(data) {
  // display Carto basemap tiles with light features and labels
  const tiles = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }
  );

  // add basemap tiles to map
  tiles.addTo(map);

  const blocksGeoJSON = data[0];
  const listingsGeoJSON = data[1];

  // airbnb point circle options
  var geojsonMarkerOptions = {
    radius: 8,
    fillColor: '#ff7800',
    color: '#000',
    weight: 1,
    opacity: 1,
    fillOpacity: 1,
  };

  // add airbnb points to map
  var airbnbListings = L.geoJson(listingsGeoJSON, {
    style: function (feature) {
      return {
        color: feature.properties.host_name,
      };
    },
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, geojsonMarkerOptions);
    },
  });

  // create Leaflet data layer and add to map
  const blockGroups = L.geoJson(blocksGeoJSON, {
    // style counties with initial default path options
    style: function (feature) {
      return {
        color: '#20282e',
        weight: 2,
        fillOpacity: 0.7,
        fillColor: '#1f78b4',
      };
    },
    // add hover/touch functionality to each feature layer
    onEachFeature: function (feature, layer) {
      // when mousing over a layer
      layer.on('mouseover', function () {
        // change the stroke color and bring that element to the front
        layer
          .setStyle({
            color: '#ff6e00',
          })
          .bringToFront();
      });

      // on mousing off layer
      layer.on('mouseout', function () {
        // reset the layer style to its original stroke color
        layer.setStyle({
          color: '#20282e',
        });
      });

      // zoom to block group on click
      layer.on('click', function (e) {
        map.flyTo(e.latlng, 13);
        showPoints(layer, airbnbListings);
      });
    },
  }).addTo(map);

  // fit the map's bounds and zoom level using the counties extent
  map.fitBounds(blockGroups.getBounds(), {
    padding: [18, 18], // add padding around counties
  });

  // set the coordinates for Davidson County
  var davidsonCoords = [36.1627, -86.7816];
  // return to initial layer zoom state on clicking the nashville button
  $('#button-fly-nash').on('click', function () {
    map.flyTo(davidsonCoords, 10.75);
  });

  // convert airbnbs to turf-friendly geojson
  //   var turfAirbnbs = airbnbListings.toGeoJSON();
  //   let pointsToShare = L.geoJson;

  // loop through blockGroups and update with points within the polygon from Turf
  //   blockGroups.eachLayer(function (layer) {
  //     // convert Leaflet layer to geojson with Leaflet toGeoJSON() method
  //     var turfBlock = layer.toGeoJSON();
  //     console.log(turfBlock);

  //     // if the result's feature is inside the polygon
  //     if (turf.booleanPointInPolygon(turfAirbnbs, turfBlock)) {
  //       // adjust the map pan/zoom to the block group bounds
  //       map.flyToBounds(layer.getBounds(), {
  //         padding: [20, 20],
  //       });

  //       // when the map is zooming on the flyto
  //       map.on('zoomend', function () {
  //         layer
  //           .setStyle({
  //             color: '#f0dc00',
  //             fill: false,
  //             weight: '3',
  //           })
  //           .bringToFront();
  //       });
  //     }
  //   });

  // function calls to loop through
  updateMap(blockGroups);
  addUi(blockGroups);
  //flyBack(county)
}

function showPoints(selectedLayer, airbnbListings) {
  airbnbListings.eachLayer(function (layer) {
    let pointGeoJSON = layer.toGeoJSON();
    let point = turf.getCoord(pointGeoJSON);
    if (turf.booleanPointInPolygon(point, selectedLayer.toGeoJSON())) {
      //   map.addLayer(layer);

      //   layer
      //     .setStyle({
      //       opacity: 1,
      //       fillOpacity: 1,
      //     })
      //     .bringToFront();

      visiblePoints.addLayer(layer);
    }
  });

  analyzeResults();
}

function analyzeResults() {
  // loop through visiblePoints and analyze data attribute
  // analyze with simple stats
  // call function to draw/update chart using D3
}

///////////////////////////////////////////////////////////////
// get class breaks for data based on airbnbs per block
function getClassBreaks(blockGroups) {
  // create empty array for storing values
  const values = [];

  // loop through all of the blocks
  blockGroups.eachLayer(function (layer) {
    let value =
      layer.feature.properties[attributeValue] /
      layer.feature.properties[normValue];
    values.push(value);
  });

  // determine similar clusters
  const clusters = ss.ckmeans(values, 5);

  // create an array of the lowest value within each cluster
  const breaks = clusters.map(function (cluster) {
    return [cluster[0], cluster.pop()];
  });

  // return an array of arrays
  return breaks;
}
///////////////////////////////////////////////////////////////
// Get color of blockgroup
function getColor(d, breaks) {
  // function accepts a single normalized data attribute value
  // and uses a series of conditional statements to determine which
  // which color value to return to return to the function caller

  if (d <= breaks[0][1]) {
    return '#edf8fb';
  } else if (d <= breaks[1][1]) {
    return '#b3cde3';
  } else if (d <= breaks[2][1]) {
    return '#8c96c6';
  } else if (d <= breaks[3][1]) {
    return '#8856a7';
  } else if (d <= breaks[4][1]) {
    return '#810f7c';
  }
}
/////////////////////////////////////////////////////////////////
function updateMap(blockGroups) {
  // check if the data is being pipelined from drawMap function to updateMap function
  console.log(blockGroups);

  // get the class breaks for the current data attribute
  const breaks = getClassBreaks(blockGroups);

  // loop through each block layer and update the color and tooltip info
  blockGroups.eachLayer(function (layer) {
    const props = layer.feature.properties;

    // set the fill color of the layer based on its normalized data value
    layer.setStyle({
      fillColor: getColor(props[attributeValue] / props[normValue], breaks),
    });

    // assemble string sequence of info for tooltip

    let tooltipInfo = `<b>Tract: ${props.TRACTCE}</b></br>
      ${((props[attributeValue] / props[normValue]) * 100).toLocaleString()}%`;

    // bind tooltip to layer with block-specific information
    layer.bindTooltip(tooltipInfo, {
      //sticky property so tooltip follows mouse
      sticky: true,
    });
  });

  // update legend with current data attribute info
  addLegend(breaks);
}
////////////////////////////////////////////////////////////////////////
// add legend to map
function addLegend(breaks) {
  // create new Leaflet control object and position it top left
  const legendControl = L.control({
    position: 'bottomright',
  });

  // when legend is added to the map
  legendControl.onAdd = function () {
    // select a div element with an id attribute of legend
    const legend = L.DomUtil.get('legend');

    // disable scroll and click/touch on map when on legend
    L.DomEvent.disableScrollPropagation(legend);
    L.DomEvent.disableClickPropagation(legend);

    // return the selection to the method
    return legend;
  };

  // add the empty legend div to the map
  legendControl.addTo(map);

  // select the legend, add a title, begin an unordered list and assign to variable
  const legend = $('#legend').html(`<h5>${attributeValue}</h5>`);

  // loop through the array of classification break values
  for (let i = 0; i <= breaks.length - 1; i++) {
    let color = getColor(breaks[i][0], breaks);

    legend.append(
      `<span style="background:${color}"></span>
      <label>${(breaks[i][0] * 100).toLocaleString()} &mdash;
        ${(breaks[i][1] * 100).toLocaleString()}%</label>`
    );
  }
}
///////////////////////////////////////////////////////////////////////
function addUi(blockGroups) {
  // create the slider control
  var selectControl = L.control({
    position: 'topright',
  });

  // when control is added
  selectControl.onAdd = function () {
    // get the element with id attribute of ui-controls
    return L.DomUtil.get('dropdown-ui');
  };
  // add control to the map
  selectControl.addTo(map);

  $('#dropdown-ui select').change(function () {
    attributeValue = this.value;

    console.log(this.value);
    updateMap(blockGroups);
  });
}
//////////////////////////////////////////////////////////////////////
// add fly
// function flyBack(county) {
//   // create flyback control
//   var flyControl = L.control({
//     position: 'bottomleft'
//   });

//   //when control is added
//   selectControl.onAdd = function () {
//     // get the nashville button with id of button-fly-nash
//     return L.DomUtil.get("fly-to-nash");
//   };
//   // add control to the map
//   selectControl.addTo(map)
// }
