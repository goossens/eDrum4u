//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


#pragma once


//
//	Include files
//

#include <ADC.h>

#include "config.h"


//
//	Scanner class to read sensor inputs
//

class Scanner {
public:
	// constructor
	Scanner();

	// read values for one port from all boards
	void readOnePort(int port);

	// read all inputs
	void read();

	// read one sample
	inline uint16_t getValue(size_t slot) {
		return values[slot] >> 3;
	}

private:
	// analog/Digital convertor
	ADC adc;

	// current values
	uint16_t values[NUMBER_OF_SENSORS];
};
