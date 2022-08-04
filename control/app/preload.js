//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.

const ipc = require("electron").ipcRenderer;

window.addEventListener("DOMContentLoaded", function() {
	// add callback to open web links in external browser for buttons with the "open-external" class
	document.querySelectorAll(".open-external").forEach(function(button) {
		button.addEventListener("click", function() {
			ipc.send("open-external", button.getAttribute("data-link"));
		});
	});

	// get the version numbers of the key packages
	for (const package of ["chrome", "node", "electron"]) {
		document.getElementById(`${package}-version`).value = process.versions[package];
	}
});
