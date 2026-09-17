import React, { useEffect, useRef, useState } from 'react';
import { Globe2 } from 'lucide-react';
import * as L from '../../vendor/leaflet/leaflet-src.esm.js';
import '../../vendor/leaflet/leaflet.css';
import earthAtNight from '../../assets/earth-at-night-nasa.jpg';

const regions = [
  { name: 'North America', center: [39, -98] },
  { name: 'South America', center: [-16, -61] },
  { name: 'Europe', center: [51, 12] },
  { name: 'Africa', center: [2, 20] },
  { name: 'Asia', center: [34, 100] },
  { name: 'Oceania', center: [-25, 134] }
];

export function WorldMapPage() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [selected, setSelected] = useState('North America');
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    const map = L.map(containerRef.current, {
      minZoom: 2,
      maxZoom: 19,
      zoomControl: false,
      worldCopyJump: true,
      scrollWheelZoom: true
    }).setView([17, 0], 2);
    mapRef.current = map;

    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

    map.createPane('nightPane');
    map.getPane('nightPane').style.zIndex = 150;
    L.imageOverlay(earthAtNight, [[-85.05, -180], [85.05, 180]], {
      pane: 'nightPane',
      className: 'world-night-image',
      attribution: 'Night imagery: <a href="https://science.nasa.gov/earth/earth-observatory/earth-at-night/maps/">NASA Earth Observatory</a>'
    }).addTo(map);

    // City detail loads only when the listener zooms in; no tiles are prefetched.
    const streets = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    streets.on('tileerror', () => setTileError(true));
    streets.on('tileload', () => setTileError(false));

    const markers = L.layerGroup(regions.map(region => L.circleMarker(region.center, {
      radius: 9,
      color: '#fff3c7',
      weight: 2,
      fillColor: '#d6a855',
      fillOpacity: 0.95
    }).bindTooltip(region.name).on('click', () => {
      setSelected(region.name);
      map.flyTo(region.center, 5, { duration: 0.7 });
    }))).addTo(map);

    const updateLayers = () => {
      if (map.getZoom() >= 4) {
        if (!map.hasLayer(streets)) streets.addTo(map);
      } else if (map.hasLayer(streets)) {
        map.removeLayer(streets);
        setTileError(false);
      }
      if (map.getZoom() >= 7) {
        if (map.hasLayer(markers)) map.removeLayer(markers);
      } else if (!map.hasLayer(markers)) markers.addTo(map);
    };
    map.on('zoomend', updateLayers);

    return () => {
      map.off('zoomend', updateLayers);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const chooseRegion = (region) => {
    setSelected(region.name);
    mapRef.current?.flyTo(region.center, 5, { duration: 0.7 });
  };

  return (
    <div className="world-map-page">
      <div className="world-map-intro">
        <p className="eyebrow"><Globe2 size={15} /> EXPLORE</p>
        <h1>World Map</h1>
        <p>Drag to explore. Scroll or pinch to zoom from the night view into cities and streets.</p>
      </div>

      <div className="world-map-card">
        <div className="world-map-canvas">
          <div className="world-map-interactive" ref={containerRef} aria-label="Interactive world map; drag to pan and scroll or pinch to zoom" />
          {tileError && <p className="world-map-error" role="status">City map tiles are unavailable right now. Try again when connected.</p>}
        </div>
        <div className="world-map-details">
          <div><span className="eyebrow">SELECTED REGION</span><h2>{selected}</h2></div>
          <div className="world-map-region-list" aria-label="World regions">
            <button type="button" onClick={() => mapRef.current?.flyTo([17, 0], 2, { duration: 0.7 })}>Whole world</button>
            {regions.map(region => (
              <button key={region.name} type="button" className={selected === region.name ? 'active' : ''}
                onClick={() => chooseRegion(region)} aria-pressed={selected === region.name}>
                {region.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
