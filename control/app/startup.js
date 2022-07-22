//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Startup function
//

document.addEventListener("DOMContentLoaded", function() {
	// setup our components
	setupMidi();
	setupTabs();
	setupRanges();
	setupMonitor();
});
