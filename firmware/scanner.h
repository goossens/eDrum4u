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

	// determine DC offset
	void calibrate();

	// read all inputs
	void read();

	// get current value
	inline int getValue(int slot) {
		return values[slot];
	}

	// get previous value
	inline int getPrevious(int slot) {
		return previous[slot];
	}

private:
	// analog/digital convertor
	ADC adc;

	// DC offsets
	int offsets[NUMBER_OF_SENSORS];

	// current values
	int values[NUMBER_OF_SENSORS];

	// previous values
	int previous[NUMBER_OF_SENSORS];
};
