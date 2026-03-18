'use strict';

// Get city data from URL query params (passed by main.js via loadFile({ query }))
const params = window.electronAPI
  ? window.electronAPI.getParams()
  : Object.fromEntries(new URLSearchParams(window.location.search));

const { name, tz } = params;

// Populate static fields
document.getElementById('wg-name').textContent = name || 'Clock';

document.getElementById('wg-tz').textContent = new Date().toLocaleTimeString('en-US', {
  timeZone: tz, timeZoneName: 'short',
}).split(' ').pop();

// Live ticker
function tick() {
  document.getElementById('wg-time').textContent =
    new Date().toLocaleTimeString('en-US', {
      timeZone: tz,
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    });

  document.getElementById('wg-date').textContent =
    new Date().toLocaleDateString('en-US', {
      timeZone: tz,
      weekday: 'short', month: 'short', day: 'numeric',
    });
}

tick();
setInterval(tick, 1000);

// Close button
document.getElementById('wg-close').addEventListener('click', () => {
  if (window.electronAPI) window.electronAPI.closeWindow();
  else window.close();
});
