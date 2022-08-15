//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Include files
//

#include <usb_midi.h>

#include "config.h"
#include "context.h"
#include "kit.h"
#include "monitor.h"
#include "oscilloscope.h"
#include "scanner.h"


//
//	Globals
//

static IntervalTimer timer;
static volatile bool ready = true;

static Context context;
static Oscilloscope oscilloscope;


//
//	Initialize firmware
//

void setup() {
	// initialize scan timer
	timer.begin([]() {
		ready = true;
	}, 1000000 / SAMPLING_RATE);

	// create scanner, drumkit and monitor
	context.scanner = new Scanner();
	context.kit = new Kit();
	context.monitor = new Monitor();

	// setup midi event handling
	usbMIDI.setHandleSystemExclusive([](uint8_t* data, unsigned int size) {
		if (data[0] == 0xf0 && data[1] == MIDI_VENDOR_ID) {
			// handle monitoring requests
			if (data[2] == MIDI_REQUEST_MONITOR) {
				context.monitor->midiEvent(data, size);

			// handle oscilloscope requests
		} else if (data[2] == MIDI_REQUEST_OSCILLOSCOPE) {
				oscilloscope.midiEvent(data, size);

			} else {
				// give message to kit
				context.kit->midiEvent(data, size);
			}
		}
	});
}


//
//	Firmware loop
//

void loop() {
	// wait for next scan time
	while (!ready) {
		delayMicroseconds(4);
	}

	ready = false;

	// get current time
	context.now = micros();

	// scan inputs and process them
	//elapsedMicros time;
	//Serial.println(time);
	context.scanner->read();
	context.kit->process(&context);
	oscilloscope.process(&context);

	// process midi inputs
	usbMIDI.read();
	usbMIDI.send_now();
}
