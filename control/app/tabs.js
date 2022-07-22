//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Configure tab switching callbacks
//

function setupTabs() {
	// handle tab changes
	document.querySelectorAll("button[data-bs-toggle='tab']").forEach(function(button) {
		button.addEventListener("shown.bs.tab", function(event) {
			event.target.classList.remove("text-light");
			event.relatedTarget.classList.add("text-light");
		});
	});
}
