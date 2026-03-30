const { app, BrowserWindow, Menu, shell } = require('electron');
Menu.setApplicationMenu(null);
require('./server.js');
const path = require('path');

app.whenReady().then(() => {
    const win = new BrowserWindow({ width: 1200, height: 800, icon: path.join(__dirname, 'assets/meetdesk.ico')});
    win.loadURL('http://localhost:4721');

    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
})