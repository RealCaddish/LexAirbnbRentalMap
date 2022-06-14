
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
  'data/geojson/blocks_census_airbnb_joined.geojson'
);
const listingsDataRaw = d3.csv('data/csv/listings_cleaned.csv');
const listingsGeojson = d3.json('data/geojson/listings_cleaned.geojson');

const visiblePoints = L.featureGroup().addTo(map);
const hiddenPoints = L.featureGroup();


// promise statement to call an array of data variables then proceed to mapping function
Promise.all([blocksDataRaw, listingsGeojson]).then(drawMap);

// set global variables for map layer
// mapped attribute, and normalizing attribute
let attributeValue = 'airbnbs';
let normValue = 'total_unit_sum';

// start of drawing Map function
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
    fillColor: 'blue',
    color: 'black',
    weight: 2,
    opacity: .8,
    fillOpacity: .3,
  };

  // add airbnb points to map
  var airbnbListings = L.geoJson(listingsGeoJSON, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, geojsonMarkerOptions).bringToFront();
    },
  }).on({
    mouseover: function (e) {
      this.openPopup();
      this.setStyle({ color: 'yellow' });
    },
    mouseout: function (e) {
      this.closePopup();
      this.setStyle({ color: '#537898' })
    }
  });

  // calculation function for proportionality for airnbnb points
  function calcRadius(val) {
    const radius = Math.sqrt(val / Math.PI);
    return radius * 1.4; // adjust .5 as a scale factor 
  };

  // resize airbnbs based on price 
  function resizeCircles(airbnbListings) {
    airbnbListings.eachLayer(function (layer) {
      const radius = calcRadius(layer.feature.properties.price);
      layer.setRadius(radius)
    });
  }

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
        layer.setStyle({
          color: '#ff6e00',
        })
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
        map.flyTo(e.latlng, 14);
        showPoints(layer, airbnbListings);
      });
    },
  }).addTo(map);

  // fit the map's bounds and zoom level using the counties extent
  map.fitBounds(blockGroups.getBounds(), {
    padding: [14, 14], // add padding around counties
  });

  // set the coordinates for Davidson County
  var davidsonCoords = [36.1627, -86.7816];
  // return to initial layer zoom state on clicking the nashville button
  $('#button-fly-nash').on('click', function () {
    map.flyTo(davidsonCoords, 10.75);
  });

  // function calls to loop through
  updateMap(blockGroups);
  addUi(blockGroups);
  resizeCircles(airbnbListings, 5)
  analyzeResults(airbnbListings)
}

// Geoprocessing in browser: select and zoom to bounds of census tract, populate airbnbs within it
function showPoints(selectedLayer, airbnbListings) {
  // loop through each airbnb point
  airbnbListings.eachLayer(function (layer) {
    // convert it to typical GeoJSON
    let pointGeoJSON = layer.toGeoJSON();
    // for turf, convert the point to a coordinate location
    let point = turf.getCoord(pointGeoJSON);
    // when user clicks on a tract (selectedLayer), populate the airbnb points within it
    if (turf.booleanPointInPolygon(point, selectedLayer.toGeoJSON())) {
      visiblePoints.addLayer(layer);
    }
    // remove points if user clicks on new tract to be populated
    else
      visiblePoints.removeLayer(layer);
  });
};

// create a d3 bar chart to add to a popup for prices of listings in the census tract 
function analyzeResults(visiblePoints) {

  // loop through visiblePoints
  visiblePoints.eachLayer(function (layer) {

    // convert the leaflet layer for visiblePoints to a json format 
    const data = layer.toGeoJSON()

    // call function to draw/update chart using D3
    const width = 400;
    const height = 300;
    const margin = { top: 10, bottom: 10, left: 10, right: 10 }

    const svg = d3.select('#d3-container')
      .append('svg')
      .attr('height', height - margin.top - margin.bottom)
      .attr('width', width - margin.left - margin.right)
      .attr('viewBox', [0, 0, width, height]);

    const x = d3.scaleBand()
      .domain(d3.range(visiblePoints.length))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, 1000])
      .range([height - margin.bottom, margin.top]);

    svg
      .append('g')
      .attr('fill', 'royalblue')
      .selectAll('rect')
      .data(data.sort((a, b) => d3.descending(a.name, b.price)))
      .join('rect')
      .attr('x', (d, i) => x(i))
      .attr('y', (d) => y(d.price))
      .attr('height', d => y(0) = y(d.price))
      .attr('width', x.bandwidth())

    svg.node()
  })
}


///////////////////////////////////////////////////////////////
// get class breaks for data based on airbnbs per block
function getClassBreaks(blockGroups) {
  // create empty array for storing values
  const values = [];

  if (attributeValue == 'airbnbs') {
    // loop through all of the blocks
    blockGroups.eachLayer(function (layer) {
      let value =
        layer.feature.properties[attributeValue] /
        layer.feature.properties[normValue];
      values.push(value);
    });
  } else {
    blockGroups.eachLayer(function (layer) {
      values.push(layer.feature.properties[attributeValue]);
    });
  }

  // determine similar clusters
  // const clusters = ss.ckmeans(values, 5);
  // console.log(clusters);
  // create an array of the lowest value within each cluster
  // const breaks = clusters.map(function (cluster) {
  //   return [cluster[0], cluster.pop()];
  // });

  const breaks = ss.equalIntervalBreaks(values, 5);
  console.log(breaks);

  // return an array of arrays
  return breaks;
}
///////////////////////////////////////////////////////////////
// Get color of blockgroup
function getColor(d, breaks) {
  // function accepts a single normalized data attribute value
  // and uses a series of conditional statements to determine which
  // which color value to return to return to the function caller

  // if (d <= breaks[0][1]) {
  //   return '#edf8fb';
  // } else if (d <= breaks[1][1]) {
  //   return '#b3cde3';
  // } else if (d <= breaks[2][1]) {
  //   return '#8c96c6';
  // } else if (d <= breaks[3][1]) {
  //   return '#8856a7';
  // } else if (d <= breaks[4][1]) {
  //   return '#810f7c';
  // }

  if (d <= breaks[1]) {
    return '#edf8fb';
  } else if (d <= breaks[2]) {
    return '#b3cde3';
  } else if (d <= breaks[3]) {
    return '#8c96c6';
  } else if (d <= breaks[4]) {
    return '#8856a7';
  } else if (d <= breaks[5]) {
    return '#810f7c';
  }
}
/////////////////////////////////////////////////////////////////
function updateMap(blockGroups) {
  // check if the data is being pipelined from drawMap function to updateMap function
  console.log(blockGroups);

  // get the class breaks for the current data attribute
  const breaks = getClassBreaks(blockGroups);
  console.log(breaks);
  // loop through each block layer and update the color and tooltip info
  blockGroups.eachLayer(function (layer) {
    const props = layer.feature.properties;

    if (attributeValue == 'airbnbs') {
      // set the fill color of the layer based on its normalized data value
      layer.setStyle({
        fillColor: getColor(props[attributeValue] / props[normValue], breaks),
      });
    } else {
      layer.setStyle({
        fillColor: getColor(props[attributeValue], breaks),
      });
    }

    // assemble string sequence of info for tooltip
    let tooltipInfo = `<strong>Tract: ${props.TRACTCE}</strong></br>
      Number of Airbnbs Per 1,000 Housing Units:<strong><u>${((props[attributeValue] / props[normValue] * 1000)).toLocaleString()}</strong>`;

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
  for (let i = 0; i <= breaks.length - 2; i++) {
    // let color = getColor(breaks[i][0], breaks);
    // if (attributeValue == 'airbnbs') {
    //   legend.append(
    //     `<span style="background:${color}"></span>
    //     <label>${breaks[i][0] * 1000} &mdash;
    //       ${breaks[i][1] * 1000}</label>`
    //   );
    // } else {
    //   legend.append(
    //     `<span style="background:${color}"></span>
    //     <label>${breaks[i][0]} &mdash;
    //       ${breaks[i][1]}%</label>`
    //   );
    // }

    let color = getColor(breaks[i], breaks);
    if (attributeValue == 'airbnbs') {
      legend.append(
        `<span style="background:${color}"></span>
        <label>${Math.round(breaks[i] * 1000)} &mdash;
          ${Math.round(breaks[i + 1] * 1000)}</label>`
      );
    } else {
      legend.append(
        `<span style="background:${color}"></span>
        <label>${breaks[i]} &mdash;
          ${breaks[i + 1]}%</label>`
      );
    }
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

