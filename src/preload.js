const { contextBridge } = require('electron');
const path = require('path');

contextBridge.exposeInMainWorld('electron', {
  path: {
    join: (...args) => path.join(...args)
  }
});