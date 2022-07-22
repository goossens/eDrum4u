//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Constants
//

const TRIGGER_SINGLE_ZONE = 0;
const TRIGGER_DUAL_ZONE = 1;
const TRIGGER_TRIPLE_ZONE = 2;
const TRIGGER_HIHAT = 3;


//
//	Globals
//

var pads = [];


//
//	Clear all pad information
//

function clearPads() {
	pads = [];
	removeAllChildren("pad-bar");
	removeAllChildren("pad-type");
	removeAllChildren("pad-curve");
}


//
//	Apply pad type to input fields
//

function applyPadType(id) {
	// get pad data
	const pad = pads[id];
}


//
//	Activate a new pad
//

function activatePad(id) {
	// get pad data
	const pad = pads[id];

	// update pad fields
	setValue("pad-type", pad.type);
	setValue("pad-name", pad.name);
	setValue("pad-curve", pad.curve);

	setValue("pad-scan-time", pad.scanTime);
	setValue("pad-mask-time", pad.maskTime);
	setValue("pad-head-threshold", pad.headThreshold);
	setValue("pad-head-sensitivity", pad.headSensitivity);
	setValue("pad-rim-threshold", pad.rimThreshold);
	setValue("pad-rim-sensitivity", pad.rimSensitivity);

	// set field visibility based on pad type
	applyPadType(id);
}


//
//	Add a pad type
//

function addPadType(type) {
	const select = document.getElementById("pad-type");
	const opt = document.createElement("option");
	opt.value = type.id;
	opt.innerHTML = type.name;
	select.appendChild(opt);
}


//
//	Add a velocity curve
//

function addPadCurve(curve) {
	const select = document.getElementById("pad-curve");
	const opt = document.createElement("option");
	opt.value = curve.id;
	opt.innerHTML = curve.name;
	select.appendChild(opt);
}


//
//	Add a new pad specification
//

function addPad(pad) {
	// track pads
	pads.push(pad);

	// update GUI
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
