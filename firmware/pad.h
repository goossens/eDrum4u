//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


#pragma once


//
//	Include files
//

#include "context.h"
#include "curve.h"
#include "properties.h"


//
//	Generic Pad class
//

class Pad {
public:
	// constructor
	Pad(uint8_t id);

	// save/load settings to/from EEPROM
	uint16_t saveSettings(uint16_t offset);
	uint16_t loadSettings(uint16_t offset);

	// process next sample
	void process(Context* context);

	// send pad configuration over midi
	void sendAsMidi();

private:
	// pad ID
	uint8_t id;

	// pad properties
	Properties p;

	// current curve
	Curve curve;

	// scanning parameters
	uint8_t headState;
	unsigned long headStateStartTime;
	unsigned long headStateDuration;
	uint8_t headVelocity;
	unsigned long headPeakTime;

};
