'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,

  // Main window: ask main process to open a new floating clock OS window
  spawnClock: (name, tz, x, y) =>
    ipcRenderer.invoke('spawn-clock', { name, tz, x, y }),

  // Clock windows: close this window
  closeWindow: () => ipcRenderer.send('close-window'),

  // Clock windows: read query params passed via loadFile({ query })
  getParams: () => {
    const p = new URLSearchParams(window.location.search);
    return { name: p.get('name') || '', tz: p.get('tz') || 'UTC' };
  },
});
