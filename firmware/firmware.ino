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
#include "scanner.h"


//
//	Globals
//

static IntervalTimer timer;
static volatile bool ready = true;

static Context context;


//
//	Initialize firmware
//

void setup() {
	// setup console
	Serial.begin(115200);

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
			context.kit->midiEvent(data, size);
		}
	});
}


//
//	Firmware loop
//

void loop() {
	// wait for next scan time
	int c = 0;
	while (!ready) {
		c++;
		delayMicroseconds(5);
	}

	//Serial.println(c * 5);
	ready = false;

	// get current time
	context.now = micros();

	// scan inputs
	context.scanner->read();

	// process kit
	context.kit->process(&context);

	// process midi inputs
	usbMIDI.read();

	// send without waiting
	usbMIDI.send_now();
}
