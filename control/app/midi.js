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
const MIDI_REQUEST_MONITOR = 8;
const MIDI_RECEIVE_MONITOR = 9;
const MIDI_REQUEST_OSCILLOSCOPE= 10;
const MIDI_RECEIVE_OSCILLOSCOPE = 11;


//
//	Layouts for midi messages
//

const midiHeaderLayout = {
	start: "b",
	vendor: "b",
	command: "b"
};

const midiConfigurationLayout = {
	start: "b",
	vendor: "b",
	command: "b",

	versionMajor: "b",
	versionMinor: "b",
	versionPatch: "b",
	samplingRate: "b",
	pads: "b",
	sensors: "b",

	end: "b"
};

const midiCurveLayout = {
	start: "b",
	vendor: "b",
	command: "b",
	id: "b",
	name: "s9",
	end: "b"
};

const midiPropertiesLayout = {
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

const midiMonitorLayout = {
	start: "b",
	vendor: "b",
	command: "b",
	pad: "b",
	channel: "b",
	values: "v"
};

const midiOscilloscopeLayout = {
	start: "b",
	vendor: "b",
	command: "b",
	probe: "b",
	values: "v"
};
