//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Include files
//

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

Pad::Pad(uint8_t i) {
	id = i;
	headState = IDLE;
	curve = Curve(p.curve);
}


//
//	Pad::saveSettings
//

uint16_t Pad::saveSettings(uint16_t offset) {
	return p.saveSettings(offset);
}


//
//	Pad::loadSettings
//

uint16_t Pad::loadSettings(uint16_t offset) {
	offset = p.loadSettings(offset);
	curve =Curve(p.curve);
	return offset;
}


//
//	Pad::process
//

void Pad::process(Context* context) {
	// get current value
	uint8_t value = context->scanner->getValue(p.headSensor);

	// waiting for a hit
	if (headState == IDLE) {
		if (value > p.headThreshold) {
			// we have the start of a hit, start scanning phase
			headVelocity = value;
			headState = SCANNING;
			headStateStartTime = context->now;
			headStateDuration = p.scanTime * 1000;
			context->monitor->start1(value);
		}

	// handle scanning cycle
	} else if (headState == SCANNING) {
		if (value > headVelocity) {
			headVelocity = value;
			headPeakTime = context->now;
		}

		context->monitor->next1(value);

		if (context->now - headStateStartTime > headStateDuration) {
			// we are done scanning, let's calculate note velocity
			if (headVelocity > p.headSensitivity) {
				headVelocity = p.headSensitivity;
			}

			// map input signal to midi scale
			headVelocity = (((int) (headVelocity - p.headThreshold) * 127)) /
				((int) (p.headSensitivity - p.headThreshold));

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
		context->monitor->next1(value);

		if (context->now - headStateStartTime > headStateDuration) {
			headState = RETRIGGER;
			headStateStartTime = context->now;
			headStateDuration = p.retriggerTime * 1000;
		}

	// handle retrigger period
	} else if (headState == RETRIGGER) {
		context->monitor->next1(value);

		if (context->now - headStateStartTime > headStateDuration) {
			headState = IDLE;
			context->monitor->end1();
		}
	}
}



//
//	Pad::sendAsMidi
//

void Pad::sendAsMidi() {
	p.sendAsMidi(MIDI_SEND_PAD, id);
}
