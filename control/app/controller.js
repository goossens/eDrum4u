//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Constants
//

const VERSION_MAJOR = 0;
const VERSION_MINOR = 1;
const VERSION_PATCH = 1;


//
//	Globals
//

const padInputFields = [
	"pad-type",
	"pad-name",
	"pad-curve",
	"pad-scan-time",
	"pad-mask-time",
	"pad-retrigger-time",
	"pad-head-threshold",
	"pad-head-sensitivity",
	"pad-rim-threshold",
	"pad-rim-sensitivity"
];


//
//	Controller class
//

class Controller {
	constructor() {
		// show splash screen for at least 1.5 seconds
		showModal("splash");

		setTimeout(function() {
			// setup UI
			setupTabs(this.onTabChange.bind(this));
			setupRanges();

			for (const field of padInputFields) {
				document.getElementById(field).addEventListener("input", this.updatePad.bind(this));
			}

			// create new objects
			this.midi = new Midi();
			this.oscilloscope = new Oscilloscope();
			this.monitor = new Monitor();

			// add midi event listeners
			this.midi.addListener("connected", this.onMidiConnect.bind(this));
			this.midi.addListener("disconnected", this.onMidiDisconnect.bind(this));
			this.midi.addListener("sysex", this.onMidiSysex.bind(this));
		}.bind(this), 1500);

		// clear our data
		this.clear();
	}

	// clear the UI
	clear() {
		// remove all information
		this.types = [];
		this.curves = [];
		this.pads = [];
	}

	clearUI() {
		// also clear data
		this.clear();

		// clear the UI
		removeAllChildren("pad-bar");
		removeAllChildren("pad-type");
		removeAllChildren("pad-curve");

		this.monitor.clear();
		this.oscilloscope.clear();
	}

	// handle tab changes
	onTabChange(event, tab) {
		if (event == "shown" && tab == "scope-tab") {
			this.oscilloscope.show();

		} else if (event == "hidden" && tab == "scope-tab") {
			this.oscilloscope.hide();
		}
	}

	// handle midi connection events
	onMidiConnect(event) {
		this.midi.sendSysex(MIDI_VENDOR_ID, [MIDI_REQUEST_CONFIG]);
	}

	// handle midi disconnection events
	onMidiDisconnect(event) {
		this.clearUI();
		showModal("splash");
	}

	// handle midi sysex events
	onMidiSysex(event) {
		var msg = event.message.data;
		var header = unpack(midiHeaderLayout, msg);

		// only process sysex events that pertain to us
		if (header.vendor == MIDI_VENDOR_ID) {
			if (header.command == MIDI_RECEIVE_CONFIG) {
				// update the about tab
				this.updateConfiguration(unpack(midiConfigurationLayout, msg));

			// ignore other messages if versions don't match
			} else if (this.versionMatch) {
				if (header.command == MIDI_RECEIVE_TYPE) {
					// add a new pad type
					this.addPadType(unpack(midiPropertiesLayout, msg));

				} else if (header.command == MIDI_RECEIVE_CURVE) {
					// add a new pad curve
					this.addPadCurve(unpack(midiCurveLayout, msg));

				} else if (header.command == MIDI_RECEIVE_PAD) {
					// add a pad definition
					this.addPad(new Pad(unpack(midiPropertiesLayout, msg)));

				} else if (header.command == MIDI_RECEIVE_READY) {
					// now hide the splash screen
					hideModal("splash");

				} else if (header.command == MIDI_MONITOR_START) {
					this.monitor.start(unpack(midiMonitorStartLayout, msg));

				} else if (header.command == MIDI_MONITOR_DATA) {
					this.monitor.data(unpack(midiMonitorDataLayout, msg));

				} else if (header.command == MIDI_MONITOR_END) {
					this.monitor.end(unpack(midiMonitorEndLayout, msg));

				} else if (header.command == MIDI_OSCILLOSCOPE_START) {
					this.oscilloscope.start(unpack(midiOscilloscopeStartLayout, msg));

				} else if (header.command == MIDI_OSCILLOSCOPE_DATA) {
					this.oscilloscope.data(unpack(midiOscilloscopeDataLayout, msg));

				} else if (header.command == MIDI_OSCILLOSCOPE_END) {
					this.oscilloscope.end(unpack(midiOscilloscopeEndLayout, msg));
				}
			}
		}
	}

	// update firmware info
	updateConfiguration(msg) {
		// ensure firmware version matches controller version
		const controller = `${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_PATCH}`;
		const firmware = `${msg.versionMajor}.${msg.versionMinor}.${msg.versionPatch}`;

		if (controller != firmware) {
			this.versionMatch = false;
			alert(`Version mismatch between Controller (${controller}) and Firmware (${firmware}).\n\nPlease update!`);

		} else {
			this.versionMatch = true;

			// update about tab
			document.getElementById("firmware-version").value = firmware;
			document.getElementById("pad-count").value = msg.pads;
			document.getElementById("sensor-count").value = msg.sensors;
			document.getElementById("sampling-rate").value = msg.samplingRate * 1000;

			// pass information to monitor and oscilloscope
			this.monitor.setMidi(this.midi);
			this.monitor.setSamplingRate(msg.samplingRate);

			this.oscilloscope.setMidi(this.midi);
			this.oscilloscope.setSamplingRate(msg.samplingRate);
			this.oscilloscope.setSensorCount(msg.sensors);
		}
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

	// add a new pad based on provided properties
	addPad(pad) {
		// track new pad
		this.pads.push(pad);

		// add pad radio button to UI
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
			this.activatePad(pad);
		}.bind(this));

		// add label for pad
		var label = bar.appendChild(document.createElement("label"));
		label.setAttribute("for", `pad${pad.id}`);
		label.setAttribute("class", "btn btn-outline-primary");
		label.appendChild(document.createTextNode(pad.id));

		// activate pad if it's the first one
		if (pad.id == 1) {
			this.activatePad(pad);
		}

		// add callback to handle pad changes
		pad.addListener("change", this.onPadChange.bind(this));

	}

	// activate the specified pad
	activatePad(pad) {
		this.pad = pad;
		pad.activate();
		this.monitor.setPad(pad);
	}

	// update the current pad
	updatePad() {
		this.pad.update();
	}

	// handle changes to pad properties
	onPadChange(event) {
		// tell monitor to redraw itself
		this.monitor.render();
	}
}


//
//	Create a controller instance at startup
//

var controller;

document.addEventListener("DOMContentLoaded", function() {
	controller = new Controller();
});
