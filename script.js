import { feature } from "https://cdn.skypack.dev/topojson@3.0.2";
import { geoContains, geoCentroid, geoDistance } from "https://cdn.skypack.dev/d3@7.0.0";


async function success(position) {
  const topology = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json").then(response => response.json());
  const geojson = feature(topology, topology.objects.countries);

  const {
    longitude,
    latitude } =
  position.coords;

  const location = geojson.features.
  filter(d => geoContains(d, [longitude, latitude])).
  shift();

  if (location) {
    document.querySelector('#location').innerHTML = `You are in <u>${location.properties.name}</u>`;
  }

  if (!location) {
    const closestCountry = geojson.features
    // You could improve the distance calculation so that you get a more accurate result
    .map(d => ({ ...d, distance: geoDistance(geoCentroid(d), [longitude, latitude]) })).
    sort((a, b) => a.distance - b.distance).
    splice(0, 5);

    if (closestCountry.length > 0) {
      const possibleLocations = closestCountry.map(d => d.properties.name);
      const suggestLoctions = `${possibleLocations.slice(0, -1).join(', ')} or ${possibleLocations.slice(-1)}`;

      document.querySelector('#location').innerHTML = `It's not clear where you are!<section>Looks like you are in ${suggestLoctions}</section>`;
    }

    if (closestCountry.length === 0) {
      error();
    }
  }
}

function error() {
  document.querySelector('#location').innerHTML = 'Sorry, I could not locate you';
};


navigator.geolocation.getCurrentPosition(success, error);