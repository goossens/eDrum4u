//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Include files
//

#include <usb_midi.h>

#include "kit.h"


//
//	Kit::Kit
//

Kit::Kit() {
	// add pads
	for (auto i = 0; i < PAD_COUNT; i++) {
		pads[i] = new Pad(i);
	}

	// reload setting from EEPROM
	// loadSettings();

	// add types
	for (auto i = 0; i < TYPE_COUNT; i++) {
		types[i] = new Type(i);
	}

	// add curves
	for (auto i = 0; i < CURVE_COUNT; i++) {
		curves[i] = new Curve(i);
	}
}


//
//	Kit::process
//

void Kit::process(Context* context) {
	// process all pads
	for (auto i = 0; i < 1; i++) {
		pads[i]->process(context);
	}
}


//
//	Kit::saveSettings
//

void Kit::saveSettings() {
	for (auto i = 0; i < PAD_COUNT; i++) {
		int offset = i * MAX_BYTES_PER_PAD;
		pads[i]->saveSettings(offset);
	}
}


//
//	Kit::loadSettings
//

void Kit::loadSettings() {
	for (auto i = 0; i < PAD_COUNT; i++) {
		int offset = i * MAX_BYTES_PER_PAD;
		pads[i]->loadSettings(offset);
	}
}


//
//	Kit::midiEvent
//

void Kit::midiEvent(uint8_t* data, unsigned int size) {
	if (data[2] == MIDI_REQUEST_CONFIG) {
		// send configuration
		sendConfiguration();

		// send type specifications
		for (auto i = 0; i < TYPE_COUNT; i++) {
			types[i]->sendAsMidi();
		}

		// send curve specifications
		for (auto i = 0; i < CURVE_COUNT; i++) {
			curves[i]->sendAsMidi();
		}

		// send pad configuration
		for (auto i = 0; i < PAD_COUNT; i++) {
			pads[i]->sendAsMidi();
		}

		// we're ready now
		sendReady();
	}
}


//
//	Kit::sendConfiguration
//

void Kit::sendConfiguration() {
	// send firmware configuration to controller
	struct {
		uint8_t start;
		uint8_t vendor;
		uint8_t command;
		uint8_t versionMajor;
		uint8_t versionMinor;
		uint8_t versionPatch;
		uint8_t samplingRate;
		uint8_t pads;
		uint8_t sensors;
		uint8_t end;
	} msg = {
		0xf0,
		MIDI_VENDOR_ID,
		MIDI_SEND_CONFIG,
		VERSION_MAJOR,
		VERSION_MINOR,
		VERSION_PATCH,
		SAMPLING_RATE / 1000,
		PAD_COUNT,
		NUMBER_OF_SENSORS,
		0xf7
	};

	usbMIDI.sendSysEx(sizeof(msg), (uint8_t*) &msg, true);
}


//
//	Kit::sendReady
//

void Kit::sendReady() {
	// send ready event to controller
	struct {
		uint8_t start;
		uint8_t vendor;
		uint8_t command;
		uint8_t end;
	} msg = {
		0xf0,
		MIDI_VENDOR_ID,
		MIDI_SEND_READY,
		0xf7
	};

	usbMIDI.sendSysEx(sizeof(msg), (uint8_t*) &msg, true);
}
