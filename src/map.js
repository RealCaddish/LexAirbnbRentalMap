"use strict"
import listings from '../data/csv/listings_cleaned.csv';
import L from 'leaflet';

function makeMap() {

  // set options for the map object
  const options = {
    zoomSnap: .1,
    center: [-.23, 37.8],
    zoom: 7,
    minZoom: 2,
    maxZoom: 13,
  };

  // creating the map object
  const map = L.map('map', options);


   // display Carto basemap tiles with light features and labels
   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

}
export default makeMap