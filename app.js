'use strict';

// ─── City Data (name, IANA timezone, lat/lng) ─────────────────────────────────
const CITIES = [
  { name: 'New York',      tz: 'America/New_York',                   lat: 40.71,  lng: -74.01  },
  { name: 'Los Angeles',   tz: 'America/Los_Angeles',                lat: 34.05,  lng: -118.24 },
  { name: 'Chicago',       tz: 'America/Chicago',                    lat: 41.88,  lng: -87.63  },
  { name: 'Toronto',       tz: 'America/Toronto',                    lat: 43.65,  lng: -79.38  },
  { name: 'Mexico City',   tz: 'America/Mexico_City',                lat: 19.43,  lng: -99.13  },
  { name: 'São Paulo',     tz: 'America/Sao_Paulo',                  lat: -23.55, lng: -46.63  },
  { name: 'Buenos Aires',  tz: 'America/Argentina/Buenos_Aires',     lat: -34.61, lng: -58.38  },
  { name: 'London',        tz: 'Europe/London',                      lat: 51.51,  lng: -0.13   },
  { name: 'Paris',         tz: 'Europe/Paris',                       lat: 48.86,  lng: 2.35    },
  { name: 'Berlin',        tz: 'Europe/Berlin',                      lat: 52.52,  lng: 13.41   },
  { name: 'Madrid',        tz: 'Europe/Madrid',                      lat: 40.42,  lng: -3.70   },
  { name: 'Rome',          tz: 'Europe/Rome',                        lat: 41.90,  lng: 12.49   },
  { name: 'Amsterdam',     tz: 'Europe/Amsterdam',                   lat: 52.37,  lng: 4.90    },
  { name: 'Moscow',        tz: 'Europe/Moscow',                      lat: 55.75,  lng: 37.62   },
  { name: 'Istanbul',      tz: 'Europe/Istanbul',                    lat: 41.01,  lng: 28.95   },
  { name: 'Cairo',         tz: 'Africa/Cairo',                       lat: 30.04,  lng: 31.24   },
  { name: 'Lagos',         tz: 'Africa/Lagos',                       lat: 6.52,   lng: 3.38    },
  { name: 'Nairobi',       tz: 'Africa/Nairobi',                     lat: -1.29,  lng: 36.82   },
  { name: 'Cape Town',     tz: 'Africa/Johannesburg',                lat: -33.93, lng: 18.42   },
  { name: 'Dubai',         tz: 'Asia/Dubai',                         lat: 25.20,  lng: 55.27   },
  { name: 'Mumbai',        tz: 'Asia/Kolkata',                       lat: 19.08,  lng: 72.88   },
  { name: 'Delhi',         tz: 'Asia/Kolkata',                       lat: 28.61,  lng: 77.21   },
  { name: 'Karachi',       tz: 'Asia/Karachi',                       lat: 24.86,  lng: 67.01   },
  { name: 'Dhaka',         tz: 'Asia/Dhaka',                         lat: 23.72,  lng: 90.41   },
  { name: 'Bangkok',       tz: 'Asia/Bangkok',                       lat: 13.75,  lng: 100.52  },
  { name: 'Singapore',     tz: 'Asia/Singapore',                     lat: 1.35,   lng: 103.82  },
  { name: 'Beijing',       tz: 'Asia/Shanghai',                      lat: 39.91,  lng: 116.39  },
  { name: 'Shanghai',      tz: 'Asia/Shanghai',                      lat: 31.23,  lng: 121.47  },
  { name: 'Hong Kong',     tz: 'Asia/Hong_Kong',                     lat: 22.32,  lng: 114.17  },
  { name: 'Seoul',         tz: 'Asia/Seoul',                         lat: 37.57,  lng: 126.98  },
  { name: 'Tokyo',         tz: 'Asia/Tokyo',                         lat: 35.69,  lng: 139.69  },
  { name: 'Sydney',        tz: 'Australia/Sydney',                   lat: -33.87, lng: 151.21  },
  { name: 'Melbourne',     tz: 'Australia/Melbourne',                lat: -37.81, lng: 144.96  },
  { name: 'Brisbane',      tz: 'Australia/Brisbane',                 lat: -27.47, lng: 153.03  },
  { name: 'Auckland',      tz: 'Pacific/Auckland',                   lat: -36.86, lng: 174.77  },
  { name: 'Honolulu',      tz: 'Pacific/Honolulu',                   lat: 21.31,  lng: -157.86 },
  { name: 'Anchorage',     tz: 'America/Anchorage',                  lat: 61.22,  lng: -149.90 },
];

// ─── Time Helpers ─────────────────────────────────────────────────────────────
function getTime(tz) {
  return new Date().toLocaleTimeString('en-US', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
}

function getDate(tz) {
  return new Date().toLocaleDateString('en-US', {
    timeZone: tz, weekday: 'short', month: 'short', day: 'numeric'
  });
}

function getShortTz(tz) {
  return new Date().toLocaleTimeString('en-US', {
    timeZone: tz, timeZoneName: 'short'
  }).split(' ').pop();
}

// ─── Local Clock ──────────────────────────────────────────────────────────────
function initLocalClock() {
  const clockEl = document.getElementById('local-clock');
  const dateEl  = document.getElementById('local-date');
  const cityEl  = document.getElementById('local-city');

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    cityEl.textContent = tz.split('/').pop().replace(/_/g, ' ');
  } catch (_) {}

  // Exposed so the shared ticker can update this element
  window._tickLocalClock = () => {
    clockEl.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
    dateEl.textContent  = new Date().toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    });
  };
  window._tickLocalClock();
}

// ─── Day/Night Terminator (ported from joergdietrich/Leaflet.Terminator) ──────
// Source algorithm: https://github.com/joergdietrich/Leaflet.Terminator
const _D2R = Math.PI / 180;
const _R2D = 180 / Math.PI;

function _julian(date) {
  return date / 86400000 + 2440587.5;
}

function _GMST(jd) {
  return (18.697374558 + 24.06570982441908 * (jd - 2451545.0)) % 24;
}

function _sunEclipticPosition(jd) {
  const n      = jd - 2451545.0;
  const L      = (280.460 + 0.9856474 * n) % 360;
  const g      = (357.528 + 0.9856003 * n) % 360;
  const lambda = L + 1.915 * Math.sin(g * _D2R) + 0.02 * Math.sin(2 * g * _D2R);
  return { lambda };
}

function _eclipticObliquity(jd) {
  const T = (jd - 2451545.0) / 36525;
  return 23.43929111 -
    T * (46.836769 / 3600
      - T * (0.0001831 / 3600
        + T * (0.00200340 / 3600
          - T * (0.576e-6 / 3600 - T * 4.34e-8 / 3600))));
}

function _sunEquatorialPosition(lambda, obliq) {
  let alpha = Math.atan(Math.cos(obliq * _D2R) * Math.tan(lambda * _D2R)) * _R2D;
  const delta = Math.asin(Math.sin(obliq * _D2R) * Math.sin(lambda * _D2R)) * _R2D;
  const lQ = Math.floor(lambda / 90) * 90;
  const rQ = Math.floor(alpha  / 90) * 90;
  alpha += lQ - rQ;
  return { alpha, delta };
}

function _hourAngle(lng, sunPos, gst) {
  return (gst + lng / 15) * 15 - sunPos.alpha;
}

function _terminatorLat(ha, sunPos) {
  return Math.atan(-Math.cos(ha * _D2R) / Math.tan(sunPos.delta * _D2R)) * _R2D;
}

function buildTerminatorLatLngs(date) {
  const jd     = _julian(date || new Date());
  const gst    = _GMST(jd);
  const eclPos = _sunEclipticPosition(jd);
  const obliq  = _eclipticObliquity(jd);
  const sunPos = _sunEquatorialPosition(eclPos.lambda, obliq);

  const lngRange = 720;
  const res      = 2;           // points per degree
  const latLng   = [];

  for (let i = 0; i <= lngRange * res; i++) {
    const lng = -lngRange / 2 + i / res;
    const ha  = _hourAngle(lng, sunPos, gst);
    latLng[i + 1] = [_terminatorLat(ha, sunPos), lng];
  }

  // Close polygon at the unlit pole
  if (sunPos.delta < 0) {
    latLng[0]              = [90, -lngRange / 2];
    latLng[latLng.length]  = [90,  lngRange / 2];
  } else {
    latLng[0]              = [-90, -lngRange / 2];
    latLng[latLng.length]  = [-90,  lngRange / 2];
  }

  return latLng;
}

// ─── Leaflet Map ──────────────────────────────────────────────────────────────
let map, terminatorLayer;

function initMap() {
  map = L.map('map', {
    center: [20, 10],
    zoom: 2,
    minZoom: 1,
    maxZoom: 10,
    zoomControl: true,
    worldCopyJump: true,
  });

  // Dark tile layer (CartoDB Dark Matter)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ' +
      '&copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(map);

  // Day/night terminator overlay
  terminatorLayer = L.polygon(buildTerminatorLatLngs(), {
    color:       'rgba(100,140,200,0.45)',
    weight:      1,
    fillColor:   '#060d1e',
    fillOpacity: 0.48,
    interactive: false,
    smoothFactor: 4,
  }).addTo(map);

  // Update once per minute as Earth rotates
  setInterval(() => terminatorLayer.setLatLngs(buildTerminatorLatLngs()), 60000);

  addCityMarkers();
}

// ─── City Markers ─────────────────────────────────────────────────────────────
function addCityMarkers() {
  CITIES.forEach(city => {
    const icon = L.divIcon({
      className: '',
      html: `<div class="city-marker-wrap">
               <div class="city-dot-marker"></div>
               <div class="city-label-map">${city.name}</div>
             </div>`,
      iconSize: [8, 8],
      iconAnchor: [4, 4],
    });

    const marker = L.marker([city.lat, city.lng], { icon })
      .addTo(map)
      .bindPopup(() => buildPopup(city), { maxWidth: 180 });

    city._marker = marker;
  });
}

function buildPopup(city) {
  const div = document.createElement('div');
  div.className = 'city-popup';

  const inPanel = activeCities.has(city.name);
  div.innerHTML = `
    <div class="popup-name">${city.name}</div>
    <div class="popup-time" id="ptime-${city.name.replace(/\s/g,'-')}">${getTime(city.tz)}</div>
    <div class="popup-date">${getDate(city.tz)} · ${getShortTz(city.tz)}</div>
    <button class="popup-add-btn${inPanel ? ' added' : ''}"
            onclick="handlePopupAdd('${city.name}', this)">
      ${inPanel ? '✓ Added' : '+ Add to panel'}
    </button>
  `;

  // Tick the popup time while it's open
  const interval = setInterval(() => {
    const el = document.getElementById('ptime-' + city.name.replace(/\s/g,'-'));
    if (el) el.textContent = getTime(city.tz);
    else clearInterval(interval);
  }, 1000);

  return div;
}

window.handlePopupAdd = function(cityName, btn) {
  addCityToPanel(cityName);
  btn.textContent = '✓ Added';
  btn.classList.add('added');
};

// ─── City Panel ───────────────────────────────────────────────────────────────
const activeCities = new Set();

function initCityPanel() {
  const select = document.getElementById('city-select');
  CITIES.forEach(city => {
    const opt = document.createElement('option');
    opt.value       = city.name;
    opt.textContent = city.name;
    select.appendChild(opt);
  });

  document.getElementById('add-city-btn').addEventListener('click', () => {
    const val = select.value;
    if (val) {
      addCityToPanel(val);
      select.value = '';
    }
  });

  // Default cities shown on load
  ['New York', 'London', 'Tokyo', 'Sydney'].forEach(n => addCityToPanel(n));
}

function addCityToPanel(cityName) {
  if (activeCities.has(cityName)) return;
  activeCities.add(cityName);

  const city = CITIES.find(c => c.name === cityName);
  if (!city) return;

  const card = document.createElement('div');
  card.className = 'city-card';
  card.dataset.city = cityName;

  card.innerHTML = `
    <div class="card-header">
      <span class="card-city-name">${city.name}</span>
      <span class="card-tz">${getShortTz(city.tz)}</span>
    </div>
    <div class="card-time">${getTime(city.tz)}</div>
    <div class="card-date">${getDate(city.tz)}</div>
    <button class="card-remove" title="Remove">&#215;</button>
    <div class="card-drag-hint">&#8689; drag to desktop</div>
  `;

  city._cardTimeEl = card.querySelector('.card-time');
  city._cardDateEl = card.querySelector('.card-date');

  card.querySelector('.card-remove').addEventListener('click', e => {
    e.stopPropagation();
    removeCityCard(cityName, card, city);
  });

  card.addEventListener('mousedown', e => {
    if (e.target.classList.contains('card-remove')) return;
    startCardDrag(e, city, card);
  });

  document.getElementById('city-cards').appendChild(card);
}

function removeCityCard(cityName, card, city) {
  activeCities.delete(cityName);
  card.remove();
  city._cardTimeEl = null;
  city._cardDateEl = null;
}

// ─── Shared Ticker — snaps to the next wall-clock second boundary ────────────
// All clocks (header, cards, browser floating divs) update in the same frame.
function startTicker() {
  function tick() {
    // Local clock in header
    if (window._tickLocalClock) window._tickLocalClock();

    // City panel cards
    CITIES.forEach(city => {
      if (city._cardTimeEl) city._cardTimeEl.textContent = getTime(city.tz);
      if (city._cardDateEl) city._cardDateEl.textContent = getDate(city.tz);
    });

    // Browser-mode floating divs
    floatingClocks.forEach(fc => {
      fc.timeEl.textContent = getTime(fc.city.tz);
      fc.dateEl.textContent = getDate(fc.city.tz);
    });
  }

  // Wait until the next exact second boundary, then tick every 1000 ms
  const msUntilNextSecond = 1000 - (Date.now() % 1000);
  setTimeout(() => {
    tick();
    setInterval(tick, 1000);
  }, msUntilNextSecond);
}

// ─── Drag: card → floating clock ──────────────────────────────────────────────
let dragState = null;

const dragGhost = document.createElement('div');
dragGhost.id = 'drag-ghost';
document.body.appendChild(dragGhost);

function startCardDrag(e, city, card) {
  e.preventDefault();
  dragState = { city, card, startX: e.clientX, startY: e.clientY, moved: false };

  dragGhost.innerHTML = `
    <div class="ghost-name">${city.name}</div>
    <div class="ghost-time">${getTime(city.tz)}</div>
  `;
  dragGhost.style.left = (e.clientX + 14) + 'px';
  dragGhost.style.top  = (e.clientY - 24) + 'px';
  dragGhost.classList.add('visible');
  card.classList.add('dragging');

  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup',   onDragEnd);
}

function onDragMove(e) {
  if (!dragState) return;
  dragGhost.style.left = (e.clientX + 14) + 'px';
  dragGhost.style.top  = (e.clientY - 24) + 'px';

  const dx = e.clientX - dragState.startX;
  const dy = e.clientY - dragState.startY;
  if (Math.abs(dx) > 6 || Math.abs(dy) > 6) dragState.moved = true;
}

function onDragEnd(e) {
  if (!dragState) return;

  dragGhost.classList.remove('visible');
  dragState.card.classList.remove('dragging');

  if (dragState.moved) {
    if (window.electronAPI) {
      // Electron: spawn a real frameless always-on-top OS window
      // e.screenX/Y gives absolute screen coordinates
      window.electronAPI.spawnClock(
        dragState.city.name,
        dragState.city.tz,
        e.screenX - 90,
        e.screenY - 55
      );
    } else {
      // Browser fallback: HTML floating div (only if dropped outside panel)
      const panel = document.getElementById('city-panel');
      const r = panel.getBoundingClientRect();
      const inPanel = e.clientX >= r.left && e.clientX <= r.right &&
                      e.clientY >= r.top  && e.clientY <= r.bottom;
      if (!inPanel) {
        spawnFloatingClock(dragState.city, e.clientX - 77, e.clientY - 45);
      }
    }
  }

  dragState = null;
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup',   onDragEnd);
}

// ─── Floating Clocks ──────────────────────────────────────────────────────────
const floatingClocks = [];

function spawnFloatingClock(city, x, y) {
  // Clamp to viewport
  x = Math.max(4, Math.min(window.innerWidth  - 160, x));
  y = Math.max(4, Math.min(window.innerHeight - 110, y));

  const el = document.createElement('div');
  el.className = 'floating-clock';
  el.style.left = x + 'px';
  el.style.top  = y + 'px';

  const timeEl = document.createElement('div');
  timeEl.className = 'fc-time';
  timeEl.textContent = getTime(city.tz);

  const dateEl = document.createElement('div');
  dateEl.className = 'fc-date';
  dateEl.textContent = getDate(city.tz);

  const tzEl = document.createElement('div');
  tzEl.className = 'fc-tz';
  tzEl.textContent = getShortTz(city.tz);

  el.innerHTML = `
    <div class="fc-header">
      <span class="fc-name">${city.name}</span>
      <button class="fc-close" title="Close">&#215;</button>
    </div>
  `;
  el.appendChild(timeEl);
  el.appendChild(dateEl);
  el.appendChild(tzEl);

  el.querySelector('.fc-close').addEventListener('click', () => {
    el.remove();
    const idx = floatingClocks.findIndex(f => f.el === el);
    if (idx !== -1) floatingClocks.splice(idx, 1);
  });

  makeFloatingDraggable(el);

  document.getElementById('floating-clocks').appendChild(el);
  floatingClocks.push({ city, el, timeEl, dateEl });
}

function makeFloatingDraggable(el) {
  const header = el.querySelector('.fc-header');

  header.addEventListener('mousedown', e => {
    if (e.target.classList.contains('fc-close')) return;
    e.preventDefault();

    const startX    = e.clientX;
    const startY    = e.clientY;
    const startLeft = parseInt(el.style.left) || 0;
    const startTop  = parseInt(el.style.top)  || 0;

    el.classList.add('dragging-fc');

    function onMove(e) {
      const nx = startLeft + (e.clientX - startX);
      const ny = startTop  + (e.clientY - startY);
      el.style.left = Math.max(0, Math.min(window.innerWidth  - el.offsetWidth,  nx)) + 'px';
      el.style.top  = Math.max(0, Math.min(window.innerHeight - el.offsetHeight, ny)) + 'px';
    }

    function onUp() {
      el.classList.remove('dragging-fc');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  });
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initLocalClock();
  initMap();
  initCityPanel();
  startTicker();
});
