/* eslint-disable */

export const initMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiaXlrLXRlIiwiYSI6ImNtYXIyd2tqeDA1bzkyanNjZWRmNHVmemEifQ.QzoP0MYS0uGIT0uMSnNzBg';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/iyk-te/cmavauiqd004401sc9y72hqya'
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Create Marker
    const el = document.createElement('div');
    el.className = 'marker';
    // Add Marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
    // Add Popup
    new mapboxgl.Popup({ offset: 30, closeOnClick: false })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};
