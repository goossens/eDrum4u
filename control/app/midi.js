//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Constants
//

const MIDI_VENDOR_ID = 0x66;

const MIDI_REQUEST_CONFIG = 1;
const MIDI_RECEIVE_CONFIG = 2;
const MIDI_RECEIVE_TYPE = 3;
const MIDI_RECEIVE_CURVE = 4;
const MIDI_RECEIVE_PAD = 5;
const MIDI_RECEIVE_READY = 6;
const MIDI_UPDATE_PAD = 7;
const MIDI_MONITOR_REQUEST = 8;
const MIDI_MONITOR_START = 9;
const MIDI_MONITOR_DATA = 10;
const MIDI_MONITOR_END = 11;
const MIDI_OSCILLOSCOPE_REQUEST = 12;
const MIDI_OSCILLOSCOPE_START = 13;
const MIDI_OSCILLOSCOPE_DATA = 14;
const MIDI_OSCILLOSCOPE_END = 15;


//
//	Layouts for midi messages
//

const midiHeaderLayout = {
	start: "s",
	vendor: "b",
	command: "b"
};

const midiConfigurationLayout = {
	start: "s",
	vendor: "b",
	command: "b",

	versionMajor: "b",
	versionMinor: "b",
	versionPatch: "b",
	samplingRate: "b",
	pads: "b",
	sensors: "b",

	end: "e"
};

const midiCurveLayout = {
	start: "s",
	vendor: "b",
	command: "b",
	id: "b",
	name: "t9",
	end: "e"
};

const midiPropertiesLayout = {
	start: "s",
	vendor: "b",
	command: "b",

	id: "b",
	type: "b",
	zones: "b",
	name: "t13",

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

	end: "e"
};

const midiMonitorStartLayout = {
	start: "s",
	vendor: "b",
	command: "b",
	pad: "b",
	channel: "b",
	size: "w",
	end: "e"
};

const midiMonitorDataLayout = {
	start: "s",
	vendor: "b",
	command: "b",
	pad: "b",
	channel: "b",
	offset: "w",
	data: "v",
	end: "e"
};

const midiMonitorEndLayout = {
	start: "s",
	vendor: "b",
	command: "b",
	pad: "b",
	channel: "b",
	end: "e"
};

const midiOscilloscopeStartLayout = {
	start: "s",
	vendor: "b",
	command: "b",
	probe: "b",
	size: "w",
	end: "e"
};

const midiOscilloscopeDataLayout = {
	start: "s",
	vendor: "b",
	command: "b",
	probe: "b",
	offset: "w",
	data: "v",
	end: "e"
};

const midiOscilloscopeEndLayout = {
	start: "s",
	vendor: "b",
	command: "b",
	probe: "b",
	end: "e"
};


//
//	Pack object attributes into buffer
//

function pack(layout, object) {

}


//
//	Unpack buffer into object
//

function unpack(layout, buffer) {
	var result = {};
	var offset = 0;

	// process all fields defined in layout
	for (field in layout) {
		var type = layout[field];

		// handle start/end of message fields
		if (type == "s" || type == "e") {
			offset++;

		// handle byte fields
		} else if (type == "b") {
			result[field] = buffer[offset++];

		// handle word fields
		} else if (type[0] == "w") {
			var msb = buffer[offset++];
			var lsb = buffer[offset++];
			result[field] = (msb << 7) | lsb;

		// handle text fields
		} else if (type[0] == "t") {
			var size = parseInt(type.substr(1));
			var string = "";

			for (var i = 0; i < size; i++) {
				var byte = buffer[offset++];

				if (byte) {
					string += String.fromCharCode(byte);
				}
			}

			result[field] = string;

		// handle variable length array of 14 bit integers
		} else if (type[0] == "v") {
			var sizeMsb = buffer[offset++];
			var sizelsb = buffer[offset++];
			var size = (sizeMsb << 7) | sizelsb;

			var values = [];

			for (var i = 0; i < size; i++) {
				var valueMsb = buffer[offset++];
				var valuelsb = buffer[offset++];
				var value = (valueMsb << 7) | valuelsb;
				values.push(value - 1024);
			}

			result[field] = values;

		} else {
			alert("Invalid type in unpack");
		}
	}

	// return result
	return result;
}


//
//	Midi class
//

class Midi extends Observable {
	constructor() {
		super();

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

			// pass event when we have both ports
			if (this.midiIn && this.midiOut) {
				this.emit(event.type, event);
			}
		}
	}

	// handle loss of midi interface
	onMidiDisconnect(event) {
		// ignore other midi ports and devices
		if (event.port.name == "eDrum4u") {
			// pass event to report connection loss
			if (this.midiIn && this.midiOut) {
				this.emit(event.type, event);
			}

			// track ports
			if (event.port.type == "input") {
				this.midiIn.removeListener();
				this.midiIn = null;

			} else {
				this.midiOut = null;
			}
		}
	}

	// handle midi messages
	onMidiEvent(event) {
		this.emit(event.type, event);
	}

	// send sysex message to module
	sendSysex(identification, data) {
		this.midiOut.sendSysex(identification, data);
	}
}
