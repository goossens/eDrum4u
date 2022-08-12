//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Include files
//

#include <string.h>

#include <WString.h>
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
	zones = SINGLE_ZONE;

	memset(name, 0, sizeof(name));
	strcpy((char*) name, "Generic");

	scanTime = 3;
	maskTime = 5;
	retriggerTime = 40;
	curve = CURVE_LOUD1;

	headSensor = 1;
	headSensitivity = 80;
	headThreshold = 8;
	headNote = 48;

	rimSensor = 2;
	rimSensitivity = 80;
	rimThreshold = 10;
	rimNote = 48;
}


//
//	Properties::Properties
//

Properties::Properties(int t, int z, const char* n, int st, int mt, int rt, int c, int hs, int hy, int hh, int hn, int rs, int ry, int rh, int rn) {
	type = t;
	zones = z;

	memset(name, 0, sizeof(name));
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

int Properties::saveSettings(int offset) {
	EEPROM.update(offset++, type);
	EEPROM.update(offset++, zones);

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

int Properties::loadSettings(int offset) {
	type = EEPROM.read(offset++);
	zones = EEPROM.read(offset++);

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

void Properties::sendAsMidi(int command, int id) {
	// build message
	struct {
		uint8_t start;
		uint8_t vendor;
		uint8_t command;

		uint8_t id;
		uint8_t type;
		uint8_t zones;
		char name[13];

		uint8_t scanTime;
		uint8_t maskTime;
		uint8_t retriggerTime;
		uint8_t curve;

		uint8_t headSensor;
		uint8_t headSensitivity;
		uint8_t headThreshold;
		uint8_t headNote;

		uint8_t rimSensor;
		uint8_t rimSensitivity;
		uint8_t rimThreshold;
		uint8_t rimNote;

		uint8_t end;
	} msg;

	msg.start = 0xf0;
	msg.vendor = MIDI_VENDOR_ID;
	msg.command = command;
	msg.id = id;

	msg.type = type;
	msg.zones = zones;
	memset(msg.name, 0, sizeof(msg.name));
	strcpy(msg.name, name);

	msg.scanTime = scanTime;
	msg.maskTime = maskTime;
	msg.retriggerTime = retriggerTime;
	msg.curve = curve;

	msg.headSensor = headSensor;
	msg.headSensitivity = headSensitivity;
	msg.headThreshold = headThreshold;
	msg.headNote = headNote;

	msg.rimSensor = rimSensor;
	msg.rimSensitivity = rimSensitivity;
	msg.rimThreshold = rimThreshold;
	msg.rimNote = rimNote;

	msg.end = 0xf7;

	// send message
	usbMIDI.sendSysEx(sizeof(msg), (uint8_t*) &msg, true);
}
