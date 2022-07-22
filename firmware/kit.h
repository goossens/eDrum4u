//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


#pragma once


//
//	Include files
//

#include "config.h"
#include "context.h"
#include "curve.h"
#include "pad.h"
#include "scanner.h"
#include "type.h"


//
//	Kit class
//

class Kit {
public:
	// constructor
	Kit();

	// process entire kit
	void process(Context* context);

	// save/load settings to/from EEPROM
	void saveSettings();
	void loadSettings();

	// process midi events
	void midiEvent(uint8_t* data, unsigned int size);

	// send configuration
	void sendConfiguration();

	// send ready notification
	void sendReady();

private:
	// input scanner
	Scanner* scanner;

	// pads that make up the drum kit
	Pad* pads[PAD_COUNT];

	// list of type
	Type* types[TYPE_COUNT];

	// list of curves
	Curve* curves[CURVE_COUNT];
};
