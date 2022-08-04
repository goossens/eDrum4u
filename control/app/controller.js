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

const MIDI_VENDOR_ID = 0x66;

const MIDI_REQUEST_CONFIG = 1;
const MIDI_SEND_CONFIG = 2;
const MIDI_SEND_TYPE = 3;
const MIDI_SEND_CURVE = 4;
const MIDI_SEND_PAD = 5;
const MIDI_SEND_READY = 6;
const MIDI_SEND_MONITOR = 7;
const MIDI_UPDATE_PAD = 8;


//
//	Controller class
//

class Controller {
	constructor() {
		// show splash screen for at least 1.5 seconds
		showModal("splash");

		setTimeout(function() {
			// setup UI
			this.setupTabs();
			this.setupRanges();

			// create required objects
			this.monitor = new Monitor();
			this.kit = new Kit(this.monitor);

			// start midi engine
			this.setupMidi();
	  }.bind(this), 1500);
	}

	// configure tab switching callbacks
	setupTabs() {
		// handle tab changes
		document.querySelectorAll("button[data-bs-toggle='tab']").forEach(function(button) {
			button.addEventListener("shown.bs.tab", function(event) {
				event.target.classList.remove("text-light");
				event.relatedTarget.classList.add("text-light");
			});
		});
	}

	// configure range tooltips
	setupRanges() {
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

	// initialize midi connection
	setupMidi() {
		// setup listeners for midi port events
		WebMidi.addListener("connected", this.onMidiConnect.bind(this));
		WebMidi.addListener("disconnected", this.onMidiDisconnect.bind(this));

		// enable midi library
		WebMidi.enable({
			sysex: true

		}).catch(function(err) {
			alert("Can't enable midi. Error:\n\n", err);
		});
	}

	// handle new midi interface
	onMidiConnect(event) {
		// ignore other midi ports and devices
		if (event.port.name == "eDrum4u") {
			// track ports
			if (event.port.type == "input") {
				this.midiIn = event.port;
				this.midiIn.addListener("sysex", this.onMidiEvent.bind(this));

			} else {
				this.midiOut = event.port;
			}

			// if we have both input and output ports, we get get the configuration
			if (this.midiIn && this.midiOut) {
				this.midiOut.sendSysex(MIDI_VENDOR_ID, [MIDI_REQUEST_CONFIG]);
			}
		}
	}

	// handle loss of midi interface
	onMidiDisconnect(event) {
		// ignore other midi ports and devices
		if (event.port.name == "eDrum4u") {
			// diasble tool by showing splash screen
			if (this.midiIn && this.midiOut) {
				this.monitor.clear();
				this.kit.clear();
				showModal("splash");
			}

			// track ports
			if (event.port.type == "input") {
				this.midiIn.removeListener("sysex");
				this.midiIn = null;

			} else {
				this.midiOut = null;
			}
		}
	}

	// handle midi events
	onMidiEvent(event) {
		// only process sysex events that pertain to us
		var msg = event.message.data;
		var header = unpack(midiHeaderLayout, msg);

		if (header.start == 0xf0 && header.vendor == MIDI_VENDOR_ID) {
			if (header.command == MIDI_SEND_CONFIG) {
				// update the about tab
				this.updateConfiguration(unpack(midiConfigurationLayout, msg));

		// ignore other messages if versions don't match
		} else if (this.versionMatch) {
				if (header.command == MIDI_SEND_TYPE) {
					// add a pad type to the list
					this.kit.addPadType(unpack(midiPropertiesLayout, msg));

				} else if (header.command == MIDI_SEND_CURVE) {
					// add a curve type to the list
					this.kit.addPadCurve(unpack(midiCurveLayout, msg));

				} else if (header.command == MIDI_SEND_PAD) {
					// add a pad definition
					this.kit.addPad(new Pad(unpack(midiPropertiesLayout, msg)));

				} else if (header.command == MIDI_SEND_READY) {
					// activate the first pad
					this.kit.activatePad(0);

					// now hide the splash screen
					hideModal("splash");

				} else if (header.command == MIDI_SEND_MONITOR) {
					var message = unpack(midiMonitorLayout, msg);
					this.monitor.setProbe(message.probe, message.values);
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

			// pass sampling rate to monitor
			this.monitor.setSamplingRate(msg.samplingRate);
		}
	}
}


//
//	Create a controller instance at startup
//

var controller;

document.addEventListener("DOMContentLoaded", function() {
	controller = new Controller();
});
