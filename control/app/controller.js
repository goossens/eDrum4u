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

			// create new objects
			this.kit = new Kit();
			this.oscilloscope = new Oscilloscope();

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

		// capture tab events
		document.getElementById("scope-tab").addEventListener("shown.bs.tab", function(event) {
			this.oscilloscope.show();
		}.bind(this), true);

		document.getElementById("scope-tab").addEventListener("hidden.bs.tab", function(event) {
			this.oscilloscope.hide();
		}.bind(this), true);
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
				this.kit.clear();
				this.oscilloscope.clear();
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
			if (header.command == MIDI_RECEIVE_CONFIG) {
				// update the about tab
				this.updateConfiguration(unpack(midiConfigurationLayout, msg));

		// ignore other messages if versions don't match
		} else if (this.versionMatch) {
				if (header.command == MIDI_RECEIVE_TYPE) {
					// add a pad type to the list
					this.kit.addPadType(unpack(midiPropertiesLayout, msg));

				} else if (header.command == MIDI_RECEIVE_CURVE) {
					// add a curve type to the list
					this.kit.addPadCurve(unpack(midiCurveLayout, msg));

				} else if (header.command == MIDI_RECEIVE_PAD) {
					// add a pad definition
					this.kit.addPad(new Pad(unpack(midiPropertiesLayout, msg)));

				} else if (header.command == MIDI_RECEIVE_READY) {
					// now hide the splash screen
					hideModal("splash");

				} else if (header.command == MIDI_RECEIVE_MONITOR) {
					var message = unpack(midiMonitorLayout, msg);
					this.kit.handleMonitor(message.probe, message.values);

				} else if (header.command == MIDI_RECEIVE_OSCILLOSCOPE) {
					var message = unpack(midiOscilloscopeLayout, msg);
					this.oscilloscope.setProbe(message.probe, message.values);
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

			// pass information to kit and oscilloscope
			this.kit.setSamplingRate(msg.samplingRate);

			this.oscilloscope.setMidi(this.midiOut);
			this.oscilloscope.setSamplingRate(msg.samplingRate);
			this.oscilloscope.setSensorCount(msg.sensors);
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
