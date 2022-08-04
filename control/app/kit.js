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
		// track the monitor object
		this.monitor = monitor;

		// create an empty kit
		this.clear();
	}

	// add a predefined pad type
	addPadType(type) {
		// track new type
		this.types.push(type);

		// add type to UI
		const select = document.getElementById("pad-type");
		const opt = document.createElement("option");
		opt.value = type.id;
		opt.innerHTML = type.name;
		select.appendChild(opt);
	}

	// add a new velocity curve
	addPadCurve(curve) {
		// track new curve
		this.curves.push(curve);

		// add curve to UI
		const select = document.getElementById("pad-curve");
		const opt = document.createElement("option");
		opt.value = curve.id;
		opt.innerHTML = curve.name;
		select.appendChild(opt);
	}

	// add a new pad to the kit based on provided properties
	addPad(pad) {
		// track new pad
		this.pads.push(pad);

		// add pad button to UI
		const bar = document.getElementById("pad-bar");
		const pd = bar.appendChild(document.createElement("input"));
		pd.setAttribute("id", `pad${pad.id}`);
		pd.setAttribute("type", "radio");
		pd.setAttribute("name", "pad-selector");
		pd.setAttribute("class", "btn-check");
		pd.checked = pad.id == 0;

		var label = bar.appendChild(document.createElement("label"));
		label.setAttribute("for", `pad${pad.id}`);
		label.setAttribute("class", "btn btn-outline-primary");
		label.appendChild(document.createTextNode(`${pad.id + 1}`));
	}

	// activate pad by sequence number
	activatePad(seqno) {
		// gt pad object
		var pad = this.pads[seqno];

		// activate it and tell monitor
		pad.activate();
		this.monitor.setPad(pad);
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
}
