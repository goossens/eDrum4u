//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Include files
//

#include <string.h>

#include <EEPROM.h>
#include <usb_midi.h>

#include "config.h"
#include "curve.h"
#include "properties.h"
#include "type.h"


//
//	Properties::Properties
//

Properties::Properties() {
	type = TYPE_GENERIC;
	strcpy((char*) name, "Generic");

	scanTime = 2;
	maskTime = 10;
	retriggerTime = 40;
	curve = CURVE_LOUD1;

	headSensor = 0;
	headSensitivity = 80;
	headThreshold = 5;
	headNote = 48;

	rimSensor = 0;
	rimSensitivity = 80;
	rimThreshold = 5;
	rimNote = 48;
}


//
//	Properties::Properties
//

Properties::Properties(uint8_t t, const char* n, uint8_t st, uint8_t mt, uint8_t rt, uint8_t c, uint8_t hs, uint8_t hy, uint8_t hh, uint8_t hn, uint8_t rs, uint8_t ry, uint8_t rh, uint8_t rn) {
	type = t;
	strcpy((char*) name, n);

	scanTime = st;
	maskTime = mt;
	retriggerTime = rt;
	curve = c;

	headSensor = hs;
	headSensitivity = hy;
	headThreshold = hh;
	headNote = hn;

	rimSensor = rs;
	rimSensitivity = ry;
	rimThreshold = rh;
	rimNote = rn;
}


//
//	Properties::saveSettings
//

uint16_t Properties::saveSettings(uint16_t offset) {
	EEPROM.update(offset++, type);

	for (size_t i = 0; i < sizeof(name); i++) {
		EEPROM.update(offset++, name[i]);
	}

	EEPROM.update(offset++, scanTime);
	EEPROM.update(offset++, maskTime);
	EEPROM.update(offset++, retriggerTime);
	EEPROM.update(offset++, curve);

	EEPROM.update(offset++, headSensor);
	EEPROM.update(offset++, headSensitivity);
	EEPROM.update(offset++, headThreshold);
	EEPROM.update(offset++, headNote);

	EEPROM.update(offset++, rimSensor);
	EEPROM.update(offset++, rimSensitivity);
	EEPROM.update(offset++, rimThreshold);
	EEPROM.update(offset++, rimNote);

	return offset;
}

//
//	Properties::loadSettings
//

uint16_t Properties::loadSettings(uint16_t offset) {
	type = EEPROM.read(offset++);

	for (size_t i = 0; i < sizeof(name); i++) {
		name[i] = EEPROM.read(offset++);
	}

	scanTime = EEPROM.read(offset++);
	maskTime = EEPROM.read(offset++);
	retriggerTime = EEPROM.read(offset++);
	curve = EEPROM.read(offset++);

	headSensor = EEPROM.read(offset++);
	headSensitivity = EEPROM.read(offset++);
	headThreshold = EEPROM.read(offset++);
	headNote = EEPROM.read(offset++);

	rimSensor = EEPROM.read(offset++);
	rimSensitivity = EEPROM.read(offset++);
	rimThreshold = EEPROM.read(offset++);
	rimNote = EEPROM.read(offset++);

	return offset;
}


//
//	Properties::sendAsMidi
//

void Properties::sendAsMidi(uint8_t command, uint8_t number) {
	// build message
	struct MidiPropertiesMsg {
		uint8_t start;
		uint8_t id;
		uint8_t command;
		uint8_t number;
		Properties p;
		uint8_t end;
	} msg;

	msg.start = 0xf0;
	msg.id = MIDI_VENDOR_ID;
	msg.command = command;
	msg.number = number;
	memcpy(&msg.p, this, sizeof(Properties));
	msg.end = 0xf7;

	// send message
	usbMIDI.sendSysEx(sizeof(msg), (uint8_t*) &msg, true);
}
