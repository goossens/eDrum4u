//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


#pragma once


//
//	Pad properties class
//

struct Properties {
	// constructors
	Properties();
	Properties(uint8_t t, const char* n, uint8_t st, uint8_t mt, uint8_t rt, uint8_t c, uint8_t hs, uint8_t hy, uint8_t hh, uint8_t hn, uint8_t rs, uint8_t ry, uint8_t rh, uint8_t rn);

	// save/load settings to/from EEPROM
	uint16_t saveSettings(uint16_t offset);
	uint16_t loadSettings(uint16_t offset);

	// send properties as midi message
	void sendAsMidi(uint8_t command, uint8_t number);

	// properties
	uint8_t type;
	uint8_t name[13];

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
};
