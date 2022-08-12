//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Include files
//

#include "oscilloscope.h"
#include "scanner.h"


//
//	Oscilloscope::set
//

void Oscilloscope::midiEvent(uint8_t* data, unsigned int size) {
	if (data[2] == MIDI_REQUEST_OSCILLOSCOPE) {
		// store oscilloscope settings
		active = data[3];
		probes[0] = data[4];
		probes[1] = data[5];
		probes[2] = data[6];
		probes[3] = data[7];

		// reset oscilloscope
		capturing = false;
		p = 0;
	}
}


//
//	Oscilloscope::process
//

void Oscilloscope::process(Context* context) {
	// see if we are capturing
	if (capturing) {
		// capture all the probes
		for (auto i = 0; i < 4; i++) {
			if (probes[i]) {
				buffer[i][p] = context->scanner->getValue(probes[i]);
			}
		}

		// send data to controller if required
		if (++p == OSCILLOSCOPE_BUFFER_SIZE) {
			for (auto i = 0; i < 4; i++) {
				if (probes[i]) {
					sendProbeData(i);
				}
			}

			// reset state
			capturing = false;
			p = 0;
		}

	} else {
		// see if we need to start capturing
		if (active && probes[0]) {
			if (abs(context->scanner->getValue(probes[0])) > 25) {
				capturing = true;
			}
		}
	}
}


//
//	Oscilloscope::sendProbeData
//

void Oscilloscope::sendProbeData(int probe) {
	// construct midi message
	struct {
		uint8_t start;
		uint8_t vendor;
		uint8_t command;
		uint8_t probe;
		uint8_t sizeMsb;
		uint8_t sizeLsb;
		uint8_t values[2 * OSCILLOSCOPE_BUFFER_SIZE];
		uint8_t end;
	} msg;

	msg.start = 0xf0;
	msg.vendor = MIDI_VENDOR_ID;
	msg.command = MIDI_SEND_OSCILLOSCOPE;
	msg.probe = probe + 1;
	msg.sizeMsb = OSCILLOSCOPE_BUFFER_SIZE >> 7;
	msg.sizeLsb = OSCILLOSCOPE_BUFFER_SIZE & 0x7f;
	msg.end = 0xf7;

	// make readings positive and split into 7-bit values
	uint8_t* v = msg.values;

	for (auto i = 0; i < OSCILLOSCOPE_BUFFER_SIZE; i++) {
		auto offsetValue = buffer[probe][i] + 1024;
		*v++ = offsetValue >> 7;
		*v++ = offsetValue & 0x7f;
	}

	// send message
	usbMIDI.sendSysEx(sizeof(msg), (uint8_t*) &msg, true);
}
