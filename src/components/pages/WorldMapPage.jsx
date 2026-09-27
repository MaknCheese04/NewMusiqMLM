import React, { useEffect, useRef, useState } from 'react';
import { Globe2, Search } from 'lucide-react';
import * as L from '../../vendor/leaflet/leaflet-src.esm.js';
import '../../vendor/leaflet/leaflet.css';
import earthAtNight from '../../assets/earth-at-night-mercator.jpg';

const regions = [
  { name: 'North America', center: [39, -98] },
  { name: 'South America', center: [-16, -61] },
  { name: 'Europe', center: [51, 12] },
  { name: 'Africa', center: [2, 20] },
  { name: 'Asia', center: [34, 100] },
  { name: 'Oceania', center: [-25, 134] }
];
const worldBounds = [[-85.05112878, -180], [85.05112878, 180]];

export function WorldMapPage({ onOpenSearch }) {
  const containerRef = useRef(null);
  const zoomPanelRef = useRef(null);
  const mapRef = useRef(null);
  const [selected, setSelected] = useState('North America');
  const [tileError, setTileError] = useState(false);
  const [zoom, setZoom] = useState(2);
  const [focusPoint, setFocusPoint] = useState(null);

  useEffect(() => {
    const map = L.map(containerRef.current, {
      minZoom: 2,
      maxZoom: 19,
      zoomControl: false,
      doubleClickZoom: false,
      maxBounds: worldBounds,
      maxBoundsViscosity: 1,
      scrollWheelZoom: true
    }).setView([17, 0], 2);
    mapRef.current = map;
    const sizeObserver = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    sizeObserver.observe(containerRef.current);
    L.DomEvent.disableClickPropagation(zoomPanelRef.current);
    L.DomEvent.disableScrollPropagation(zoomPanelRef.current);

    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.scale({ position: 'bottomleft', metric: true, imperial: true }).addTo(map);
    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

    map.createPane('nightPane');
    map.getPane('nightPane').style.zIndex = 150;
    L.imageOverlay(earthAtNight, worldBounds, {
      pane: 'nightPane',
      className: 'world-night-image',
      attribution: 'Night imagery: <a href="https://science.nasa.gov/earth/earth-observatory/earth-at-night/maps/">NASA Earth Observatory</a>'
    }).addTo(map);

    // City detail loads only when the listener zooms in; no tiles are prefetched.
    const streets = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      noWrap: true,
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
    const focusMarker = L.circleMarker([0, 0], {
      radius: 7,
      color: '#fff',
      weight: 2,
      fillColor: '#59c7e8',
      fillOpacity: 1
    });

    const choosePoint = (event) => {
      const point = [event.latlng.lat, event.latlng.lng];
      setFocusPoint(point);
      focusMarker.setLatLng(event.latlng).addTo(map);
    };
    const zoomToPoint = (event) => {
      choosePoint(event);
      map.flyTo(event.latlng, Math.max(12, map.getZoom() + 3), { duration: 0.7 });
    };

    const updateLayers = () => {
      setZoom(map.getZoom());
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
    map.on('click', choosePoint);
    map.on('dblclick', zoomToPoint);

    return () => {
      sizeObserver.disconnect();
      map.off('zoomend', updateLayers);
      map.off('click', choosePoint);
      map.off('dblclick', zoomToPoint);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const chooseRegion = (region) => {
    setSelected(region.name);
    mapRef.current?.flyTo(region.center, 5, { duration: 0.7 });
  };
  const scaleLabel = zoom <= 3 ? 'World' : zoom <= 7 ? 'Region' : zoom <= 12 ? 'City' : 'Street';

  return (
    <div className="world-map-page">
      <div className="world-map-intro">
        <div className="world-map-intro-row">
          <div>
            <p className="eyebrow"><Globe2 size={15} /> EXPLORE</p>
            <h1>World Map</h1>
            <p>Drag to explore, use the scale slider, or double-click a city to zoom straight in.</p>
          </div>
          <button type="button" className="world-map-search" onClick={onOpenSearch}>
            <Search size={18} />
            <span>Search</span>
          </button>
        </div>
      </div>

      <div className="world-map-card">
        <div className="world-map-canvas">
          <div className="world-map-interactive" ref={containerRef} aria-label="Interactive world map; drag to pan and scroll or pinch to zoom" />
          <div className="world-map-zoom-panel" ref={zoomPanelRef}>
            <label htmlFor="world-map-zoom">Map scale</label>
            <input id="world-map-zoom" type="range" min="2" max="19" step="1" value={zoom}
              onChange={event => mapRef.current?.setZoom(Number(event.target.value))} />
            <span>{scaleLabel} · level {zoom}</span>
            <button type="button" disabled={!focusPoint}
              onClick={() => mapRef.current?.flyTo(focusPoint, Math.max(13, mapRef.current.getZoom()), { duration: 0.7 })}>
              {focusPoint ? 'Zoom to selected place' : 'Click a place on the map'}
            </button>
          </div>
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
