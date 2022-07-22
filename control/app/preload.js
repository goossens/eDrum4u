//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.

const ipc = require("electron").ipcRenderer;

window.addEventListener("DOMContentLoaded", function() {
	document.querySelectorAll(".open-external").forEach(function(button) {
		button.addEventListener("click", function() {
			ipc.send("open-external", button.getAttribute("data-link"));
		});
	});

	for (const dependency of ["chrome", "node", "electron"]) {
		const element = document.getElementById(`${dependency}-version`);

		if (element) {
			element.value = process.versions[dependency];
		}
	}
});
