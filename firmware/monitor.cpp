//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Include files
//

#include <Arduino.h>

#include "config.h"
#include "monitor.h"


//
//	Monitor::start
//

void Monitor::start() {
	// reset
	p = 0;
}


//
//	Monitor::end
//

void Monitor::end() {
	for (auto i = 0; i < p; i++) {
		Serial.println(buffer1[i]);
	}

	// create midi message for probe 1
	struct {
		uint8_t start;
		uint8_t vendor;
		uint8_t command;
		uint8_t probe;
		uint8_t count;
		uint8_t values[512];
		uint8_t end;
	} msg;

	msg.start = 0xf0;
	msg.vendor = MIDI_VENDOR_ID;
	msg.command = MIDI_SEND_MONITOR;
	msg.probe = 1;
	msg.count = p;
	auto v = msg.values;

	// make readings positive and split into 7-bit values
	for (auto i = 0; i < p; i++) {
		auto offsetValue = buffer1[i] + 2014;
		*v++ = offsetValue >> 7;
		*v++ = offsetValue & 0x7f;
	}

	*v++ = 0xf7;
	auto size = (uint8_t*) v - (uint8_t*) &msg;

	// send message
	usbMIDI.sendSysEx(size, (uint8_t*) &msg, true);

	// update message for probe 2
	msg.probe = 2;
	v = msg.values;

	// make readings positive and split into 7-bit values
	for (auto i = 0; i < p; i++) {
		auto offsetValue = buffer2[i] + 1024;
		*v++ = offsetValue >> 7;
		*v++ = offsetValue & 0x7f;
	}

	// send message
	usbMIDI.sendSysEx(size, (uint8_t*) &msg, true);
}


//
//	Monitor::probe
//

void Monitor::probe(int sample1, int sample2) {
	// add sample to buffer (but avoid overflow)
	if (p < 256) {
		buffer1[p] = sample1;
		buffer2[p] = sample2;
		p++;
	}
}
