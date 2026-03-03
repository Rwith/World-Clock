'use strict';

// ─── City Data ───────────────────────────────────────────────────────────────
const CITIES = [
  { name: 'New York',   tz: 'America/New_York',    mx: 198, my: 155 },
  { name: 'Los Angeles',tz: 'America/Los_Angeles',  mx: 140, my: 148 },
  { name: 'Chicago',    tz: 'America/Chicago',      mx: 185, my: 140 },
  { name: 'London',     tz: 'Europe/London',        mx: 458, my: 85  },
  { name: 'Paris',      tz: 'Europe/Paris',         mx: 475, my: 90  },
  { name: 'Berlin',     tz: 'Europe/Berlin',        mx: 492, my: 83  },
  { name: 'Dubai',      tz: 'Asia/Dubai',           mx: 580, my: 140 },
  { name: 'Mumbai',     tz: 'Asia/Kolkata',         mx: 605, my: 165 },
  { name: 'Singapore',  tz: 'Asia/Singapore',       mx: 680, my: 220 },
  { name: 'Tokyo',      tz: 'Asia/Tokyo',           mx: 745, my: 115 },
  { name: 'Sydney',     tz: 'Australia/Sydney',     mx: 800, my: 305 },
  { name: 'São Paulo',  tz: 'America/Sao_Paulo',    mx: 245, my: 295 },
  { name: 'Cairo',      tz: 'Africa/Cairo',         mx: 510, my: 148 },
  { name: 'Lagos',      tz: 'Africa/Lagos',         mx: 462, my: 220 },
  { name: 'Moscow',     tz: 'Europe/Moscow',        mx: 540, my: 75  },
  { name: 'Seoul',      tz: 'Asia/Seoul',           mx: 740, my: 105 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getTime(tz) {
  return new Date().toLocaleTimeString('en-US', {
    timeZone: tz,
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
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

// ─── Local clock ─────────────────────────────────────────────────────────────
function initLocalClock() {
  const clockEl  = document.getElementById('local-clock');
  const dateEl   = document.getElementById('local-date');
  const cityEl   = document.getElementById('local-city');

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    cityEl.textContent = tz.split('/').pop().replace(/_/g, ' ');
  } catch (_) {}

  function tick() {
    clockEl.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
    dateEl.textContent  = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
  tick();
  setInterval(tick, 1000);
}

// ─── SVG City Dots on Map ────────────────────────────────────────────────────
function initMapDots() {
  const g   = document.getElementById('city-dots');
  const map = document.getElementById('world-map');

  CITIES.forEach(city => {
    // dot
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', city.mx);
    circle.setAttribute('cy', city.my);
    circle.setAttribute('r',  5);
    circle.classList.add('city-dot');
    circle.dataset.city = city.name;

    // label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', city.mx + 7);
    text.setAttribute('y', city.my + 4);
    text.classList.add('city-label-map');
    text.textContent = city.name;

    g.appendChild(circle);
    g.appendChild(text);

    // Dragging from map dot → cube
    circle.addEventListener('mousedown', e => startDragFromMap(e, city));
  });
}

// ─── City List Panel ──────────────────────────────────────────────────────────
function initCityList() {
  const list = document.getElementById('city-list');
  CITIES.forEach(city => {
    const card = document.createElement('div');
    card.className = 'city-card';
    card.dataset.city = city.name;
    card.draggable = false;

    const left  = document.createElement('div');
    const nameEl = document.createElement('div');
    nameEl.className = 'city-name';
    nameEl.textContent = city.name;
    const tzEl  = document.createElement('div');
    tzEl.className = 'city-tz';
    tzEl.textContent = getShortTz(city.tz);
    left.appendChild(nameEl);
    left.appendChild(tzEl);

    const timeEl = document.createElement('div');
    timeEl.className = 'city-time';
    timeEl.textContent = getTime(city.tz);

    // store ref so ticker can update
    city._timeEl = timeEl;

    card.appendChild(left);
    card.appendChild(timeEl);
    list.appendChild(card);

    card.addEventListener('mousedown', e => startDragFromCard(e, city, card));
  });
}

// ─── City List Ticker ─────────────────────────────────────────────────────────
function startCityTicker() {
  setInterval(() => {
    CITIES.forEach(c => {
      if (c._timeEl) c._timeEl.textContent = getTime(c.tz);
    });
  }, 1000);
}

// ─── Drag System ──────────────────────────────────────────────────────────────
let dragState = null;
const ghost = document.createElement('div');
ghost.id = 'drag-ghost';
document.body.appendChild(ghost);

const dropZone    = document.getElementById('drop-zone');
const cubesArea   = document.getElementById('cubes-area');
const threeCanvas = document.getElementById('three-canvas');

function startDrag(e, city) {
  dragState = { city, startX: e.clientX, startY: e.clientY };
  ghost.textContent = city.name + '  ' + getTime(city.tz);
  ghost.style.left  = (e.clientX + 12) + 'px';
  ghost.style.top   = (e.clientY - 20) + 'px';
  ghost.classList.add('visible');
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup',   onDragEnd);
}

function startDragFromMap(e, city) {
  e.preventDefault();
  startDrag(e, city);
}

function startDragFromCard(e, city, card) {
  e.preventDefault();
  card.classList.add('dragging-card');
  dragState = { city, card };
  startDrag(e, city);
}

function onDragMove(e) {
  if (!dragState) return;
  ghost.style.left = (e.clientX + 12) + 'px';
  ghost.style.top  = (e.clientY - 20) + 'px';

  // highlight cubes area when hovering over it
  const cubesRect = cubesArea.getBoundingClientRect();
  const inCubes = e.clientX >= cubesRect.left && e.clientX <= cubesRect.right &&
                  e.clientY >= cubesRect.top  && e.clientY <= cubesRect.bottom;
  cubesArea.style.outline = inCubes ? '2px solid var(--accent)' : 'none';

  const dropRect = dropZone.getBoundingClientRect();
  const inDrop = e.clientX >= dropRect.left && e.clientX <= dropRect.right &&
                 e.clientY >= dropRect.top  && e.clientY <= dropRect.bottom;
  dropZone.classList.toggle('drag-over', inDrop);
}

function onDragEnd(e) {
  if (!dragState) return;

  ghost.classList.remove('visible');
  cubesArea.style.outline = 'none';
  dropZone.classList.remove('drag-over');

  if (dragState.card) dragState.card.classList.remove('dragging-card');

  const cubesRect = cubesArea.getBoundingClientRect();
  const inCubes   = e.clientX >= cubesRect.left && e.clientX <= cubesRect.right &&
                    e.clientY >= cubesRect.top  && e.clientY <= cubesRect.bottom;

  if (inCubes) {
    // Convert drop position to a normalised scene position
    const relX = ((e.clientX - cubesRect.left)  / cubesRect.width  - 0.5) * 20;
    const relY = -((e.clientY - cubesRect.top)  / cubesRect.height - 0.5) * 10;
    addCube(dragState.city, relX, relY);
  }

  dragState = null;
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup',   onDragEnd);
}

// ─── Three.js Cube Scene ─────────────────────────────────────────────────────
let scene, camera, renderer, raycaster, mouse;
const cubeObjects = []; // { mesh, city, labelCanvas, labelTexture }

function initThree() {
  const area = document.getElementById('cubes-area');

  scene    = new THREE.Scene();
  scene.background = new THREE.Color(0x0d1117);

  camera   = new THREE.PerspectiveCamera(50, area.clientWidth / area.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 18);

  renderer = new THREE.WebGLRenderer({ canvas: threeCanvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(area.clientWidth, area.clientHeight);

  // Ambient + directional lights
  scene.add(new THREE.AmbientLight(0x8888cc, 0.8));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
  dirLight.position.set(5, 8, 10);
  scene.add(dirLight);
  const dirLight2 = new THREE.DirectionalLight(0x3399ff, 0.4);
  dirLight2.position.set(-5, -5, -5);
  scene.add(dirLight2);

  // Grid floor
  const grid = new THREE.GridHelper(40, 30, 0x1c2333, 0x1c2333);
  grid.position.y = -4;
  scene.add(grid);

  raycaster = new THREE.Raycaster();
  mouse     = new THREE.Vector2();

  window.addEventListener('resize', onResize);
  threeCanvas.addEventListener('mousemove', onCanvasHover);
  threeCanvas.addEventListener('click',     onCanvasClick);

  animate();
}

function onResize() {
  const area = document.getElementById('cubes-area');
  camera.aspect = area.clientWidth / area.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(area.clientWidth, area.clientHeight);
}

// ─── Cube Label Canvas ────────────────────────────────────────────────────────
function makeLabelCanvas(city) {
  const W = 512, H = 512;
  const c = document.createElement('canvas');
  c.width  = W;
  c.height = H;
  const ctx = c.getContext('2d');

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#1c2e4a');
  grad.addColorStop(1, '#0d1b30');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Border glow
  ctx.strokeStyle = '#58a6ff';
  ctx.lineWidth   = 18;
  ctx.strokeRect(9, 9, W - 18, H - 18);

  ctx.strokeStyle = 'rgba(88,166,255,0.25)';
  ctx.lineWidth   = 4;
  ctx.strokeRect(28, 28, W - 56, H - 56);

  // City name
  ctx.fillStyle = '#e6edf3';
  ctx.font      = 'bold 52px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(city.name, W / 2, 200);

  // Timezone
  ctx.fillStyle = '#7d8590';
  ctx.font      = '30px "Segoe UI", Arial, sans-serif';
  ctx.fillText(getShortTz(city.tz), W / 2, 250);

  // Time
  ctx.fillStyle = '#3fb950';
  ctx.font      = 'bold 100px "Courier New", monospace';
  ctx.fillText(getTime(city.tz), W / 2, 370);

  // Date
  ctx.fillStyle = '#7d8590';
  ctx.font      = '30px "Segoe UI", Arial, sans-serif';
  ctx.fillText(getDate(city.tz), W / 2, 430);

  return c;
}

function updateLabelCanvas(obj) {
  const ctx = obj.labelCanvas.getContext('2d');
  const W   = obj.labelCanvas.width;
  const H   = obj.labelCanvas.height;

  // Clear time area only (optimisation)
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.clearRect(30, 290, W - 60, 160);

  const grad = ctx.createLinearGradient(0, 290, W, 450);
  grad.addColorStop(0, '#1c2e4a');
  grad.addColorStop(1, '#0d1b30');
  ctx.fillStyle = grad;
  ctx.fillRect(30, 290, W - 60, 160);

  ctx.fillStyle = '#3fb950';
  ctx.font      = 'bold 100px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(getTime(obj.city.tz), W / 2, 370);

  ctx.fillStyle = '#7d8590';
  ctx.font      = '30px "Segoe UI", Arial, sans-serif';
  ctx.fillText(getDate(obj.city.tz), W / 2, 430);

  obj.labelTexture.needsUpdate = true;
}

// ─── Add Cube ─────────────────────────────────────────────────────────────────
function addCube(city, x, y) {
  const labelCanvas  = makeLabelCanvas(city);
  const labelTexture = new THREE.CanvasTexture(labelCanvas);

  // Faces: front/back = label, others = solid tinted
  const sideMat = new THREE.MeshPhongMaterial({ color: 0x1c2e4a, shininess: 60 });
  const frontMat = new THREE.MeshPhongMaterial({ map: labelTexture, shininess: 80 });

  const materials = [sideMat, sideMat, sideMat, sideMat, frontMat, frontMat];

  const geo  = new THREE.BoxGeometry(4.5, 4.5, 4.5);
  const mesh = new THREE.Mesh(geo, materials);

  mesh.position.set(x, y, 0);
  // subtle random rotation for depth
  mesh.rotation.y = (Math.random() - 0.5) * 0.3;
  mesh.rotation.x = (Math.random() - 0.5) * 0.1;

  scene.add(mesh);

  const obj = { mesh, city, labelCanvas, labelTexture };
  cubeObjects.push(obj);
  mesh.userData.cubeObj = obj;
}

// ─── Cube Hover / Click ───────────────────────────────────────────────────────
const tooltip = document.createElement('div');
tooltip.id = 'cube-tooltip';
document.body.appendChild(tooltip);

function onCanvasHover(e) {
  const rect = threeCanvas.getBoundingClientRect();
  mouse.x =  ((e.clientX - rect.left)  / rect.width)  * 2 - 1;
  mouse.y = -((e.clientY - rect.top)   / rect.height)  * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(cubeObjects.map(o => o.mesh));

  if (hits.length) {
    const city = hits[0].object.userData.cubeObj.city;
    tooltip.textContent = city.name + ' · ' + getShortTz(city.tz) + ' · ' + getTime(city.tz);
    tooltip.style.left  = (e.clientX + 12) + 'px';
    tooltip.style.top   = (e.clientY - 30) + 'px';
    tooltip.classList.add('visible');
    threeCanvas.style.cursor = 'pointer';
  } else {
    tooltip.classList.remove('visible');
    threeCanvas.style.cursor = 'default';
  }
}

function onCanvasClick(e) {
  const rect = threeCanvas.getBoundingClientRect();
  mouse.x =  ((e.clientX - rect.left)  / rect.width)  * 2 - 1;
  mouse.y = -((e.clientY - rect.top)   / rect.height)  * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(cubeObjects.map(o => o.mesh));
  if (!hits.length) return;

  const mesh = hits[0].object;
  const idx  = cubeObjects.findIndex(o => o.mesh === mesh);
  if (idx === -1) return;

  // Right-click / double-click to remove, single click spins
  if (e.detail === 2) {
    const obj = cubeObjects[idx];
    scene.remove(obj.mesh);
    obj.labelTexture.dispose();
    cubeObjects.splice(idx, 1);
  }
}

// ─── Animate ──────────────────────────────────────────────────────────────────
let lastTick = 0;

function animate(ts = 0) {
  requestAnimationFrame(animate);

  // Gentle idle rotation for all cubes
  cubeObjects.forEach(obj => {
    obj.mesh.rotation.y += 0.003;
  });

  // Update labels every second
  if (ts - lastTick > 1000) {
    lastTick = ts;
    cubeObjects.forEach(obj => updateLabelCanvas(obj));
  }

  renderer.render(scene, camera);
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initLocalClock();
  initMapDots();
  initCityList();
  startCityTicker();
  initThree();

  // Show hint cubes for two demo cities on load
  setTimeout(() => {
    addCube(CITIES.find(c => c.name === 'Tokyo'),   -5, 0.5);
    addCube(CITIES.find(c => c.name === 'London'),   2, 0.5);
  }, 200);
});
