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
	Properties(int t, int z, const char* n, int st, int mt, int rt, int c, int hs, int hy, int hh, int hn, int rs, int ry, int rh, int rn);

	// save/load settings to/from EEPROM
	int saveSettings(int offset);
	int loadSettings(int offset);

	// send properties as midi message
	void sendAsMidi(int command, int number);

	// properties
	int type;
	int zones;
	char name[13];

	int scanTime;
	int maskTime;
	int retriggerTime;
	int curve;

	int headSensor;
	int headSensitivity;
	int headThreshold;
	int headNote;

	int rimSensor;
	int rimSensitivity;
	int rimThreshold;
	int rimNote;
};
