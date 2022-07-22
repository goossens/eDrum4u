//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Configure range tooltips
//

function setupRanges() {
	// create tooltops for each slider
	document.querySelectorAll("input[type='range']").forEach(function(range) {
		// we must have a title otherwise a tooltip will not be xreated
		range.setAttribute("title", "0");

		// respond to slider changes
		range.addEventListener("input", function(event) {
			bootstrap.Tooltip.getInstance(range).setContent({ ".tooltip-inner": range.value });
		});

		// update tooltip when popped up
		range.addEventListener("show.bs.tooltip", function(event) {
			bootstrap.Tooltip.getInstance(range).setContent({ ".tooltip-inner": range.value });
		});

		// create the tooltip
		return bootstrap.Tooltip.getOrCreateInstance(range, {
			animation: false,
			trigger: "hover",
			placement: "left",
			offset: function() {
				// move tooltip based on slider value
				var offset = (range.offsetWidth - 16) * (range.value - range.min) / range.max - 5;
				return [0, -offset];
			}
		});
	});
}
