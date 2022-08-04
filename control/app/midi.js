//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


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
	probe: "b",
	values: "v"
};
