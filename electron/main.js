const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

const RESOURCE_DIR = path.join(app.getPath('userData'), 'Resource');
const EVENTS_FILE = 'calendar-events.json';
const WALLPAPER_DIR = path.join(RESOURCE_DIR, 'wallpapers');
const SETTINGS_FILE = path.join(RESOURCE_DIR, 'wallpaper-settings.json');

function getEventsPath() {
  return path.join(RESOURCE_DIR, EVENTS_FILE);
}

let mainWindow;


async function atomicWrite(filePath, data) {
  const tmpPath = filePath + '.tmp';
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tmpPath, filePath);
}

async function resolveConflicts() {
  try {
    const files = await fs.readdir(RESOURCE_DIR);
    const conflictFiles = files.filter(
      f => f === EVENTS_FILE || f.startsWith(EVENTS_FILE + '.sync-conflict-')
    );

    if (conflictFiles.length <= 1) return;

    let latestFile = null;
    let latestMtime = 0;

    for (const f of conflictFiles) {
      const stat = await fs.stat(path.join(RESOURCE_DIR, f));
      if (stat.mtimeMs > latestMtime) {
        latestMtime = stat.mtimeMs;
        latestFile = f;
      }
    }

    if (latestFile !== EVENTS_FILE && latestFile) {
      const data = await fs.readFile(path.join(RESOURCE_DIR, latestFile), 'utf-8');
      const parsed = JSON.parse(data);
      await atomicWrite(getEventsPath(), parsed);
    }

    for (const f of conflictFiles) {
      if (f !== EVENTS_FILE) {
        await fs.unlink(path.join(RESOURCE_DIR, f));
      }
    }
  } catch (_) {}
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 900,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'src', 'index.html'));
}

ipcMain.handle('get-events', async () => {
  try {
    const data = await fs.readFile(getEventsPath(), 'utf-8');
    return JSON.parse(data);
  } catch (_) {
    return null;
  }
});

ipcMain.handle('save-events', async (_event, events) => {
  await atomicWrite(getEventsPath(), events);
});

ipcMain.handle('resolve-conflicts', async () => {
  await resolveConflicts();
});

ipcMain.handle('get-sync-folder', () => {
  return RESOURCE_DIR;
});

ipcMain.handle('get-holidays', async () => {
  const srcDir = path.join(__dirname, '..', 'src');
  try {
    const files = await fs.readdir(srcDir);
    const holidayFiles = files.filter(f => /^holidays-\d{4}\.json$/.test(f));
    const result = { holidays: {}, workdays: {} };
    for (const f of holidayFiles) {
      const data = await fs.readFile(path.join(srcDir, f), 'utf-8');
      const parsed = JSON.parse(data);
      Object.assign(result.holidays, parsed.holidays);
      Object.assign(result.workdays, parsed.workdays);
    }
    return result;
  } catch (_) { return { holidays: {}, workdays: {} }; }
});

// --- Wallpaper handlers ---

ipcMain.handle('import-wallpaper', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择壁纸图片',
    filters: [{ name: '图片', extensions: ['jpg','jpeg','png','bmp','webp'] }],
    properties: ['openFile'],
  });
  if (result.canceled || !result.filePaths.length) return null;

  const srcPath = result.filePaths[0];
  const ext = path.extname(srcPath);
  const destName = `wp_${Date.now()}${ext}`;
  const destPath = path.join(WALLPAPER_DIR, destName);

  await fs.mkdir(WALLPAPER_DIR, { recursive: true });
  await fs.copyFile(srcPath, destPath);
  return destName;
});

ipcMain.handle('delete-wallpaper', async (_event, filename) => {
  const filePath = path.join(WALLPAPER_DIR, filename);
  await fs.unlink(filePath).catch(() => {});
});

ipcMain.handle('get-wallpapers', async () => {
  await fs.mkdir(WALLPAPER_DIR, { recursive: true });
  const files = await fs.readdir(WALLPAPER_DIR);
  return files.filter(f => /\.(jpg|jpeg|png|bmp|webp)$/i.test(f));
});

ipcMain.handle('get-wallpaper-dir', () => {
  return WALLPAPER_DIR;
});

ipcMain.handle('save-wallpaper-settings', async (_event, settings) => {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
});

ipcMain.handle('load-wallpaper-settings', async () => {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (_) { return null; }
});

app.whenReady().then(async () => {
  try {
    await fs.mkdir(RESOURCE_DIR, { recursive: true });
  } catch (_) {}

  const tmpFiles = (await fs.readdir(RESOURCE_DIR).catch(() => [])).filter(
    f => f.endsWith('.tmp')
  );
  await Promise.all(
    tmpFiles.map(f => fs.unlink(path.join(RESOURCE_DIR, f)).catch(() => {}))
  );

  await resolveConflicts();
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});
