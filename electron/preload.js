const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('calendarAPI', {
  getEvents: () => ipcRenderer.invoke('get-events'),
  saveEvents: (events) => ipcRenderer.invoke('save-events', events),
  resolveConflicts: () => ipcRenderer.invoke('resolve-conflicts'),
  getSyncFolder: () => ipcRenderer.invoke('get-sync-folder'),
  getHolidays: () => ipcRenderer.invoke('get-holidays'),
  importWallpaper: () => ipcRenderer.invoke('import-wallpaper'),
  deleteWallpaper: (filename) => ipcRenderer.invoke('delete-wallpaper', filename),
  getWallpapers: () => ipcRenderer.invoke('get-wallpapers'),
  getWallpaperDir: () => ipcRenderer.invoke('get-wallpaper-dir'),
  saveWallpaperSettings: (settings) => ipcRenderer.invoke('save-wallpaper-settings', settings),
  loadWallpaperSettings: () => ipcRenderer.invoke('load-wallpaper-settings'),
});
