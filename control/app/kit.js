//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Kit class
//

class Kit {
	constructor(monitor) {
		// track monitor
		this.monitor = monitor;

		// create an empty kit
		this.clear();
	}

	// clear the kit
	clear() {
		// remove all information
		this.types = [];
		this.curves = [];
		this.pads = [];

		// clear the UI
		removeAllChildren("pad-bar");
		removeAllChildren("pad-type");
		removeAllChildren("pad-curve");
	}

	// specify sensor count
	setSensorCount(sensors) {
	}

	// add a predefined pad type
	addPadType(type) {
		// track new type and add it to UI
		this.types.push(type);
		addSelectorOption("pad-type", type.id, type.name);
	}

	// add a new velocity curve
	addPadCurve(curve) {
		// track new curve and add it to UI
		this.curves.push(curve);
		addSelectorOption("pad-curve", curve.id, curve.name);
	}

	// add a new pad to the kit based on provided properties
	addPad(pad) {
		// track new pad
		this.pads.push(pad);

		// add pad button to UI
		const bar = document.getElementById("pad-bar");
		const pd = bar.appendChild(document.createElement("input"));
		pd.setAttribute("data-id", pad.id);
		pd.setAttribute("id", `pad${pad.id}`);
		pd.setAttribute("type", "radio");
		pd.setAttribute("name", "pad-selector");
		pd.setAttribute("class", "btn-check");
		pd.checked = pad.id == 1;

		// add callback to activate pad
		pd.addEventListener("change", function(event) {
			// switch to selected pad
			pad.activate();
			this.monitor.setPad(pad);
		}.bind(this));

		// add label for pad
		var label = bar.appendChild(document.createElement("label"));
		label.setAttribute("for", `pad${pad.id}`);
		label.setAttribute("class", "btn btn-outline-primary");
		label.appendChild(document.createTextNode(pad.id));

		// activate pad if it's the first one
		if (pad.id == 1) {
			pad.activate();
			this.monitor.setPad(pad);
		}
	}
}
