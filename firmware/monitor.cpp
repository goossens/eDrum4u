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
	if (data[2] == MIDI_MONITOR_REQUEST) {
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
			sendChannel(i);
		}

		// reset monitor
		capturing = false;
	}
}


//
//	Monitor::sendChannel
//

void Monitor::sendChannel(int channel) {
	// send start of monitoring message
	struct {
		uint8_t start;
		uint8_t vendor;
		uint8_t command;
		uint8_t pad;
		uint8_t channel;
		uint8_t sizeMsb;
		uint8_t sizeLsb;
		uint8_t end;
	} startMsg = {
		0xf0,
		MIDI_VENDOR_ID,
		MIDI_MONITOR_START,
		(uint8_t) pad,
		(uint8_t) (channel + 1),
		(uint8_t) (p >> 7),
		(uint8_t) (p & 0x7f),
		0xf7
	};

	usbMIDI.sendSysEx(sizeof(startMsg), (uint8_t*) &startMsg, true);

	// send each of the chunks
	int start = 0;

	while (start < p) {
		int size = min(MONITOR_CHUNK_SIZE, p - start);
		sendData(channel, start, size);
		start += size;
	}

	// send end of monitoring message
	struct {
		uint8_t start;
		uint8_t vendor;
		uint8_t command;
		uint8_t pad;
		uint8_t channel;
		uint8_t end;
	} endMsg = {
		0xf0,
		MIDI_VENDOR_ID,
		MIDI_MONITOR_END,
		(uint8_t) pad,
		(uint8_t) (channel + 1),
		0xf7
	};

	usbMIDI.sendSysEx(sizeof(endMsg), (uint8_t*) &endMsg, true);
}


//
//	Monitor::sendData
//

void Monitor::sendData(int channel, int offset, int size) {
	// construct midi message
	struct {
		uint8_t start;
		uint8_t vendor;
		uint8_t command;
		uint8_t pad;
		uint8_t channel;
		uint8_t offsetMsb;
		uint8_t offsetLsb;
		uint8_t sizeMsb;
		uint8_t sizeLsb;
		uint8_t values[2 * MONITOR_CHUNK_SIZE];
		uint8_t end;
	} msg;

	msg.start = 0xf0;
	msg.vendor = MIDI_VENDOR_ID;
	msg.command = MIDI_MONITOR_DATA;
	msg.pad = pad;
	msg.channel = channel + 1;
	msg.offsetMsb = offset >> 7;
	msg.offsetLsb = offset & 0x7f;
	msg.sizeMsb = size >> 7;
	msg.sizeLsb = size & 0x7f;
	msg.end = 0xf7;

	// make readings positive and split into 7-bit values
	uint8_t* v = msg.values;

	for (auto i = 0; i < size; i++) {
		auto offsetValue = buffer[channel][offset + i] + 1024;
		*v++ = offsetValue >> 7;
		*v++ = offsetValue & 0x7f;
	}

	*v++ = 0xf7;

	// send message
	auto msgSize = v - (uint8_t*) &msg;
	usbMIDI.sendSysEx(msgSize, (uint8_t*) &msg, true);
}
