//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { shell } = require('electron')

app.whenReady().then(function() {
	var window = new BrowserWindow({
		width: 1024,
		height: 768,
		webPreferences: {
			preload: path.join(__dirname, "preload.js")
		}
	});

	window.loadFile("index.html");

	ipcMain.on("open-external", function(event, url) {
		shell.openExternal(url);
	});
});
