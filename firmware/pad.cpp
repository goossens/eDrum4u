//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Include files
//

#include <WString.h>
#include <EEPROM.h>
#include <usb_midi.h>

#include "pad.h"
#include "monitor.h"
#include "scanner.h"


//
//	Pad trigger states
//

enum {
	IDLE,
	SCANNING,
	MASK,
	RETRIGGER,
	CHOKE
};


//
//	Pad::Pad
//

Pad::Pad(int i) {
	id = i;
	headState = IDLE;
	curve = Curve(p.curve);
}


//
//	Pad::saveSettings
//

int Pad::saveSettings(int offset) {
	return p.saveSettings(offset);
}


//
//	Pad::loadSettings
//

int Pad::loadSettings(int offset) {
	offset = p.loadSettings(offset);
	curve =Curve(p.curve);
	return offset;
}


//
//	Pad::process
//

void Pad::process(Context* context) {
	// get current value (-512 to 512)
	int value = context->scanner->getValue(p.headSensor);

	// rectify value and get it into midi velocity range (0 to 127)
	int velocity = abs(value) >> 2;

	// waiting for a hit
	if (headState == IDLE) {
		if (velocity > p.headThreshold) {
			// we have the start of a hit, start scanning phase
			headVelocity = velocity;
			headHitTime = context->now;
			headPeakTime = context->now;
			headZeroCrossingTime = 0;

			headState = SCANNING;
			headStateStartTime = context->now;
			headStateDuration = p.scanTime * 1000;
			context->monitor->start();
			context->monitor->probe(value);
		}

	// handle scanning cycle
	} else if (headState == SCANNING) {
		// detect peak
		if (velocity > headVelocity) {
			headVelocity = velocity;
			headPeakTime = context->now;
		}

		// detect zero crossing
		if (!headZeroCrossingTime && (value * context->scanner->getPrevious(p.headSensor)) < 0) {
			headZeroCrossingTime = context->now;
		}

		context->monitor->probe(value);

		if (context->now - headStateStartTime > headStateDuration) {
			// limit velocity to sensitivity (if required)
			if (headVelocity > p.headSensitivity) {
				headVelocity = p.headSensitivity;
			}

			// map input signal to full midi range
			headVelocity = ((headVelocity - p.headThreshold) * 127) /
				(p.headSensitivity - p.headThreshold);

			// apply curve
			headVelocity = curve.apply(headVelocity);

			// send note
			usbMIDI.sendNoteOn(p.headNote, headVelocity, MIDI_CHANNEL);
			usbMIDI.sendNoteOff(p.headNote, 0, MIDI_CHANNEL);

			// enter mask phase
			headState = MASK;
			headStateStartTime = context->now;
			headStateDuration = p.maskTime * 1000;
		}

	// handle mask phase
	} else if (headState == MASK) {
		context->monitor->probe(value);

		if (context->now - headStateStartTime > headStateDuration) {
			headState = RETRIGGER;
			headStateStartTime = context->now;
			headStateDuration = p.retriggerTime * 1000;
		}

	// handle retrigger period
	} else if (headState == RETRIGGER) {
		context->monitor->probe(value);

		if (context->now - headStateStartTime > headStateDuration) {
			headState = IDLE;
			context->monitor->end();
		}
	}
}


//
//	Pad::sendAsMidi
//

void Pad::sendAsMidi() {
	p.sendAsMidi(MIDI_SEND_PAD, id);
}
