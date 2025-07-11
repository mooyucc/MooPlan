const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null; // 新增全局变量

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  // 加载你的前端页面（开发环境用 Vite，生产环境请替换为 build 后的 index.html 路径）
  if (process.env.NODE_ENV === 'development') {
    // 开发环境：加载 Vite 本地服务器
    mainWindow.loadURL('http://localhost:5173');
  } else {
    // 生产环境：加载打包后的 index.html
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // 监听窗口关闭，释放引用
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 任务导出 IPC
ipcMain.handle('export-tasks', async (event, dataStr) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: '导出任务',
    defaultPath: `tasks-${Date.now()}.json`,
    filters: [{ name: 'JSON 文件', extensions: ['json'] }]
  });
  if (!canceled && filePath) {
    fs.writeFileSync(filePath, dataStr, 'utf-8');
    return { success: true, filePath };
  }
  return { success: false };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// 监听 activate 事件，macOS 下点击 Dock 图标时触发
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
}); 