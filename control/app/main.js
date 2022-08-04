//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { shell } = require("electron");

// define app startup actions
app.whenReady().then(function() {
	// create a new window
	var window = new BrowserWindow({
		width: 1024,
		height: 768,
		webPreferences: {
			preload: path.join(__dirname, "preload.js")
		}
	});

	// load controller app
	window.loadFile("index.html");

	// open url in external browser (counterpart is in preload.js)
	ipcMain.on("open-external", function(event, url) {
		shell.openExternal(url);
	});
});
