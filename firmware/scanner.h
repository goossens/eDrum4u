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
	inline int getValue(int sensor) {
		return current[sensor - 1];
	}

	// get previous value
	inline int getPrevious(int sensor) {
		return previous[sensor - 1];
	}

private:
	// analog/digital convertor
	ADC adc;

	// DC offsets
	int offsets[NUMBER_OF_SENSORS];

	// values over three scanning periods
	int previous[NUMBER_OF_SENSORS];
	int current[NUMBER_OF_SENSORS];
	int next[NUMBER_OF_SENSORS];
};
