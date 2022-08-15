//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


#pragma once


//
//	Include files
//

#include <stdint.h>

#include "config.h"
#include "context.h"


//
//	Constants
//

#define OSCILLOSCOPE_BUFFER_SIZE (SAMPLING_RATE / 1000 * 100)


//
//	Oscilloscope class
//

class Oscilloscope {
public:
	// process midi events
	void midiEvent(uint8_t* data, unsigned int size);

	// process cycle
	void process(Context* context);

private:
	// send probe data to control app
	void sendData(int probe);

	// flags
	int active = false;
	int capturing = false;

	// probe targets
	int probes[4] = {0};

	// probe values
	int buffer[4][OSCILLOSCOPE_BUFFER_SIZE];

	// buffer pointer
	int p = 0;
};
