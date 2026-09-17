import React, { useState } from 'react';
import { Globe2, MapPin } from 'lucide-react';

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
        <p>Pick a region to explore the world through music.</p>
      </div>

      <div className="world-map-card">
        <div className="world-map-canvas" role="group" aria-label="Select a world region">
          <svg viewBox="0 0 1000 500" role="img" aria-label="Stylized map of the world" preserveAspectRatio="xMidYMid meet">
            <defs>
              <pattern id="map-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="1000" height="500" fill="url(#map-grid)" className="world-map-grid" />
            <g className="world-map-land">
              <path d="M75 87 L120 66 L178 70 L205 53 L236 72 L239 101 L276 113 L291 140 L273 161 L253 155 L239 178 L220 183 L205 215 L178 224 L169 247 L144 233 L127 205 L108 194 L95 163 L69 147 L54 118 Z" />
              <path d="M220 49 L252 34 L292 45 L307 68 L282 83 L247 73 Z" />
              <path d="M273 234 L312 245 L345 277 L359 313 L345 346 L333 367 L321 409 L300 443 L281 417 L267 378 L255 344 L248 302 L257 268 Z" />
              <path d="M468 116 L488 102 L509 110 L520 127 L510 141 L487 139 L475 151 L456 140 Z" />
              <path d="M453 161 L495 151 L543 160 L565 185 L574 226 L556 261 L538 300 L521 349 L488 359 L468 326 L448 295 L441 249 L428 210 Z" />
              <path d="M514 101 L549 83 L592 82 L614 62 L660 67 L686 83 L724 73 L768 86 L809 78 L854 99 L874 131 L851 149 L821 144 L797 169 L769 165 L751 188 L720 183 L708 219 L680 239 L655 215 L632 226 L604 199 L582 183 L565 155 L539 155 L519 139 Z" />
              <path d="M679 239 L711 245 L728 267 L710 291 L691 281 Z" />
              <path d="M780 293 L814 282 L853 293 L875 319 L878 351 L851 369 L811 365 L784 345 L768 317 Z" />
              <path d="M903 385 L912 394 L906 409 L895 402 Z" />
              <path d="M393 84 L402 79 L407 87 L402 94 Z" />
            </g>
          </svg>
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
