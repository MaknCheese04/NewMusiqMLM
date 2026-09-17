import React, { useState } from 'react';
import { Globe2, MapPin } from 'lucide-react';
import earthAtNight from '../../assets/earth-at-night-nasa.jpg';

const regions = [
  { name: 'North America', x: 20, y: 35 },
  { name: 'South America', x: 31, y: 70 },
  { name: 'Europe', x: 50, y: 29 },
  { name: 'Africa', x: 52, y: 56 },
  { name: 'Asia', x: 70, y: 36 },
  { name: 'Oceania', x: 84, y: 76 }
];

export function WorldMapPage() {
  const [selected, setSelected] = useState('North America');

  return (
    <div className="world-map-page">
      <div className="world-map-intro">
        <p className="eyebrow"><Globe2 size={15} /> EXPLORE</p>
        <h1>World Map</h1>
        <p>Explore the world through music, after dark.</p>
      </div>

      <div className="world-map-card">
        <div className="world-map-canvas" role="group" aria-label="Select a world region">
          <img src={earthAtNight} alt="Satellite composite showing Earth and city lights at night" />
          {regions.map(region => (
            <button
              key={region.name}
              type="button"
              className={`world-map-pin ${selected === region.name ? 'active' : ''}`}
              style={{ left: `${region.x}%`, top: `${region.y}%` }}
              aria-label={`Select ${region.name}`}
              aria-pressed={selected === region.name}
              onClick={() => setSelected(region.name)}
            ><MapPin size={21} fill="currentColor" /></button>
          ))}
          <a className="world-map-credit" href="https://science.nasa.gov/earth/earth-observatory/earth-at-night/maps/" target="_blank" rel="noreferrer">Night imagery: NASA Earth Observatory</a>
        </div>
        <div className="world-map-details">
          <div><span className="eyebrow">SELECTED REGION</span><h2>{selected}</h2></div>
          <div className="world-map-region-list" aria-label="World regions">
            {regions.map(region => (
              <button key={region.name} type="button" className={selected === region.name ? 'active' : ''}
                onClick={() => setSelected(region.name)} aria-pressed={selected === region.name}>
                {region.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
