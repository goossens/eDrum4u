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
//	Monitor::midiEvent
//

void Monitor::midiEvent(uint8_t* data, unsigned int size) {
	if (data[2] == MIDI_REQUEST_MONITOR) {
		// store monitor settings
		active = data[3];
		pad = data[4];

		// reset monitor
		capturing = false;
		p = 0;
	}
}


//
//	Monitor::start
//

void Monitor::start(int pd, int chans) {
	// see if we are active and this is the pad we are capturing
	if (active && pad == pd) {
		capturing = true;
		channels = chans;
		p = 0;
	}
}


//
//	Monitor::sample
//

void Monitor::sample(int pd, int sample1, int sample2, int sample3) {
	// ensure we are capturing this pad
	if (capturing && pad == pd) {
		// add sample to buffer (but avoid overflow)
		if (p < MONITOR_BUFFER_SIZE) {
			buffer[0][p] = sample1;
			buffer[1][p] = sample2;
			buffer[2][p] = sample3;
			p++;
		}
	}
}


//
//	Monitor::end
//

void Monitor::end(int pd) {
	// ensure we are capturing this pad
	if (capturing && pad == pd) {
		// send data
		for (auto i = 0; i < channels; i++) {
			sendData(i);
		}

		// reset monitor
		capturing = false;
	}
}


//
//	Monitor::sendData
//

void Monitor::sendData(int channel) {
	// create midi message
	struct {
		uint8_t start;
		uint8_t vendor;
		uint8_t command;
		uint8_t pad;
		uint8_t channel;
		uint8_t sizeMsb;
		uint8_t sizeLsb;
		uint8_t values[MONITOR_BUFFER_SIZE * 2];
		uint8_t end;
	} msg;

	msg.start = 0xf0;
	msg.vendor = MIDI_VENDOR_ID;
	msg.command = MIDI_SEND_MONITOR;
	msg.pad = pad;
	msg.channel = channel + 1;
	msg.sizeMsb = p >> 7;
	msg.sizeLsb = p & 0x7f;
	uint8_t* v = msg.values;

	// make readings positive and split into 7-bit values
	for (auto i = 0; i < p; i++) {
		auto offsetValue = buffer[channel][i] + 1024;
		*v++ = offsetValue >> 7;
		*v++ = offsetValue & 0x7f;
	}

	// terminate variable length midi message
	*v++ = 0xf7;

	// send message
	auto size = v - (uint8_t*) &msg;
	usbMIDI.sendSysEx(size, (uint8_t*) &msg, true);
}
