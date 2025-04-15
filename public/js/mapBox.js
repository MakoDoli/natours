/* eslint-disable */
console.log('Hello');

const locations = JSON.parse(document.getElementById('map').dataset.locations);

// Initialize Leaflet map
const map = L.map('map', {
  scrollWheelZoom: false,
}).setView([locations[0].coordinates[1], locations[0].coordinates[0]], 5.4);

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: '/leaflet/images/marker-shadow.png',
});

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
}).addTo(map);

// Add markers
locations.forEach((loc) => {
  const [lng, lat] = loc.coordinates;
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(`<b>${loc.description}</b>`)
    .openPopup();
});
