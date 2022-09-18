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
//	Oscilloscope::midiEvent
//

void Oscilloscope::midiEvent(uint8_t* data, unsigned int size) {
	if (data[2] == MIDI_OSCILLOSCOPE_REQUEST) {
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
					sendProbe(i);
				}
			}

			// reset state
			capturing = false;
			p = 0;
		}

	// see if we need to start capturing
	} else if (active && probes[0]) {
		if (abs(context->scanner->getValue(probes[0])) > 25) {
			capturing = true;
		}
	}
}


//
//	Oscilloscope::sendData
//

void Oscilloscope::sendProbe(int probe) {
	// send start of scope message
	struct {
		uint8_t start;
		uint8_t vendor;
		uint8_t command;
		uint8_t probe;
		uint8_t sizeMsb;
		uint8_t sizeLsb;
		uint8_t end;
	} startMsg = {
		0xf0,
		MIDI_VENDOR_ID,
		MIDI_OSCILLOSCOPE_START,
		(uint8_t) (probe + 1),
		OSCILLOSCOPE_BUFFER_SIZE >> 7,
		OSCILLOSCOPE_BUFFER_SIZE & 0x7f,
		0xf7
	};

	usbMIDI.sendSysEx(sizeof(startMsg), (uint8_t*) &startMsg, true);

	// send each of the chunks
	int start = 0;

	while (start < OSCILLOSCOPE_BUFFER_SIZE) {
		int size = min(OSCILLOSCOPE_CHUNK_SIZE, OSCILLOSCOPE_BUFFER_SIZE - start);
		sendData(probe, start, size);
		start += size;
	}

	// send end of scope message
	struct {
		uint8_t start;
		uint8_t vendor;
		uint8_t command;
		uint8_t probe;
		uint8_t end;
	} endMsg = {
		0xf0,
		MIDI_VENDOR_ID,
		MIDI_OSCILLOSCOPE_END,
		(uint8_t) (probe + 1),
		0xf7
	};

	usbMIDI.sendSysEx(sizeof(endMsg), (uint8_t*) &endMsg, true);
	Serial.println("MIDI_OSCILLOSCOPE_END");
}


//
//	Oscilloscope::sendData
//

void Oscilloscope::sendData(int probe, int offset, int size) {
	// construct midi message
	struct {
		uint8_t start;
		uint8_t vendor;
		uint8_t command;
		uint8_t probe;
		uint8_t offsetMsb;
		uint8_t offsetLsb;
		uint8_t sizeMsb;
		uint8_t sizeLsb;
		uint8_t values[2 * OSCILLOSCOPE_CHUNK_SIZE];
		uint8_t end;
	} msg;

	msg.start = 0xf0;
	msg.vendor = MIDI_VENDOR_ID;
	msg.command = MIDI_OSCILLOSCOPE_DATA;
	msg.probe = probe + 1;
	msg.offsetMsb = offset >> 7;
	msg.offsetLsb = offset & 0x7f;
	msg.sizeMsb = size >> 7;
	msg.sizeLsb = size & 0x7f;
	msg.end = 0xf7;

	// make readings positive and split into 7-bit values
	uint8_t* v = msg.values;

	for (auto i = 0; i < size; i++) {
		auto offsetValue = buffer[probe][offset + i] + 1024;
		*v++ = offsetValue >> 7;
		*v++ = offsetValue & 0x7f;
	}

	*v++ = 0xf7;

	// send message
	auto msgSize = v - (uint8_t*) &msg;
	usbMIDI.sendSysEx(msgSize, (uint8_t*) &msg, true);
}
