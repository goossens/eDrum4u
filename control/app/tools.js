//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	remove all children of an element
//

function removeAllChildren(element) {
	const node = document.getElementById(element);

	while (node.firstChild) {
		node.removeChild(node.lastChild);
	}
}


//
//	Show/hide elements
//

function showElement(element) {
	document.getElementById(element).style.display = "block";
}

function hideElement(element) {
	document.getElementById(element).style.display = "none";
}


//
//	Enable/disable element
//

function enableElement(element) {
	document.getElementById(element).disabled = false;
}

function disableElement(element) {
	document.getElementById(element).disabled = true;
}


//
//	Set/get element values
//

function setValue(element, value) {
	document.getElementById(element).value = value;
}

function getValue(element) {
	return document.getElementById(element).value;
}


//
//	Add an option to a selector
//

function addSelectorOption(element, value, name) {
	var selector = document.getElementById(element);
	const opt = document.createElement("option");
	opt.value = value;
	opt.innerHTML = name;
	selector.appendChild(opt);
}


//
//	Configure range tooltips
//

function setupRanges() {
	// create tooltops for each slider
	document.querySelectorAll("input[type='range']").forEach(function(range) {
		// we must have a title otherwise a tooltip will not be created
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


//
//	Configure tab switching callbacks
//

function setupTabs(callback) {
	// handle tab changes
	document.querySelectorAll("button[data-bs-toggle='tab']").forEach(function(button) {
		button.addEventListener("shown.bs.tab", function(event) {
			event.target.classList.remove("text-light");
			event.relatedTarget.classList.add("text-light");
			callback("shown", event.target.id);
		});

		button.addEventListener("hidden.bs.tab", function(event) {
			callback("hidden", event.target.id);
		});
	});
}


//
//	Show/hide modal dialog
//

function showModal(element) {
	bootstrap.Modal.getOrCreateInstance(document.getElementById(element)).show();
}

function hideModal(element) {
	bootstrap.Modal.getOrCreateInstance(document.getElementById(element)).hide();
}


//
//	Observable class
//

class Observable {
	constructor() {
		this.events = {};
	}

	// add a new callback
	addListener(event, callback) {
		if (!this.events[event]) {
			this.events[event] = [];
		}

		this.events[event].push(callback);
	}

	// emit the specified event to all callbacks
	emit(event, data) {
		if (this.events[event]) {
			for (const callback of this.events[event]) {
				callback(data);
			}
		}
	}
}


//
//	Scale class
//

class Scale {
	constructor(min, max) {
		this.min = min;
		this.max = max;
		this.range = Math.log(max - min + 1);
	}

	convert(v) {
		if (v <= this.min) {
			return 0;

		} else if (v >= this.max) {
			return 1;

		} else {
			return Math.log(v - this.min + 1) / this.range;
		}
	}
}
