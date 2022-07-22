//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Constants
//

const VERSION_MAJOR = 0;
const VERSION_MINOR = 0;
const VERSION_PATCH = 1;

const MIDI_VENDOR_ID = 0x66;

const MIDI_REQUEST_CONFIG = 1;
const MIDI_SEND_CONFIG = 2;
const MIDI_SEND_TYPE = 3;
const MIDI_SEND_CURVE = 4;
const MIDI_SEND_PAD = 5;
const MIDI_SEND_READY = 6;
const MIDI_UPDATE_PAD = 7;


//
//	Globals
//

var midiIn;
var midiOut;

var versionMatch = true;


//
//	Schemes for midi messages
//

var midiHeaderScheme = {
	start: "b",
	vendor: "b",
	command: "b"
};

var midiConfigurationScheme = {
	start: "b",
	vendor: "b",
	command: "b",

	versionMajor: "b",
	versionMinor: "b",
	versionPatch: "b",
	pads: "b",
	sensors: "b",

	end: "b"
};

var midiCurveScheme = {
	start: "b",
	vendor: "b",
	command: "b",
	id: "b",
	name: "s9",
	end: "b"
};

var midiPropertiesScheme = {
	start: "b",
	vendor: "b",
	command: "b",

	id: "b",
	type: "b",
	zones: "b",
	name: "s13",

	scanTime: "b",
	maskTime: "b",
	retriggerTime: "b",
	curve: "b",

	headSensor: "b",
	headSensitivity: "b",
	headThreshold: "b",
	headNote: "b",

	rimSensor: "b",
	rimSensitivity: "b",
	rimThreshold: "b",
	rimNote: "b",

	end: "b"
};


//
//	Update firmware info
//

function updateConfiguration(msg) {
	// ensure firmware version matches controller version
	const controller = `${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_PATCH}`;
	const firmware = `${msg.versionMajor}.${msg.versionMinor}.${msg.versionPatch}`;

	if (controller != firmware) {
		versionMatch = false;
		alert(`Version mismatch between Controller (${controller}) and Firmware (${firmware})`);

	} else {
		document.getElementById("firmware-version").value = firmware;
		document.getElementById("pad-count").value = msg.pads;
		document.getElementById("sensor-count").value = msg.sensors;
	}
}


//
//	Midi event callback
//

function onMidiEvent(event) {
	// only process sysex events that pertain to us
	var msg = event.message.data;
	var header = unpack(midiHeaderScheme, msg);

	if (header.start == 0xf0 && header.vendor == MIDI_VENDOR_ID) {
		if (header.command == MIDI_SEND_CONFIG) {
			// update the about tab
			updateConfiguration(unpack(midiConfigurationScheme, msg));

		// ignore other messages if versions don't match
		} else if (versionMatch) {
			if (header.command == MIDI_SEND_TYPE) {
				// add a pad type to the list
				addPadType(unpack(midiPropertiesScheme, msg));

			} else if (header.command == MIDI_SEND_CURVE) {
				// add a curve type to the list
				addPadCurve(unpack(midiCurveScheme, msg));

			} else if (header.command == MIDI_SEND_PAD) {
				// add a pad definition
				addPad(unpack(midiPropertiesScheme, msg));

			} else if (header.command == MIDI_SEND_READY) {
				// activate the first pad
				activatePad(0);

				// now hide the splash screen
				hideModal("splash");
			}
		}
	}
}


//
//	Handle midi port connect/disconnect events
//

function onMidiConnect(event) {
	// ignore other midi ports and devices
	if (event.port.name == "eDrum4u") {
		// track ports
		if (event.port.type == "input") {
			midiIn = event.port;
			midiIn.addListener("sysex", onMidiEvent);

		} else {
			midiOut = event.port;
		}

		// if we have both input and output ports, we get get the configuration
		if (midiIn && midiOut) {
			midiOut.sendSysex(MIDI_VENDOR_ID, [MIDI_REQUEST_CONFIG]);
		}
	}
}


function onMidiDisconnect(event) {
	// ignore other midi ports and devices
	if (event.port.name == "eDrum4u") {
		// diasble tool by showing splash screen
		if (midiIn && midiOut) {
			clearPads();
			showModal("splash");
		}

		// track ports
		if (event.port.type == "input") {
			midiIn.removeListener("sysex", onMidiEvent);
			midiIn = null;

		} else {
			midiOut = null;
		}
	}
}


//
//	Initialize midi connection
//

async function setupMidi() {
	// show splash screen
	showModal("splash");
	await sleep(1500);

	// setup listeners for midi port events
	WebMidi.addListener("connected", onMidiConnect);
	WebMidi.addListener("disconnected", onMidiDisconnect);

	// enable midi library
	WebMidi.enable({
		sysex: true

	}).catch(function(err) {
		alert("Can't enable midi. Error:\n\n", err);
	});
}
