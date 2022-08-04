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
	Pad(int id);

	// save/load settings to/from EEPROM
	int saveSettings(int offset);
	int loadSettings(int offset);

	// process next sample
	void process(Context* context);

	// send pad configuration over midi
	void sendAsMidi();

private:
	// pad ID
	int id;

	// pad properties
	Properties p;

	// current curve
	Curve curve;

	// scanning parameters
	int headState;
	int headVelocity;
	unsigned long headStateStartTime;
	unsigned long headStateDuration;
	unsigned long headHitTime;
	unsigned long headPeakTime;
	unsigned long headZeroCrossingTime;
};
