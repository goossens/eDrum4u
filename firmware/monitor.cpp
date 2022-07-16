//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Include files
//

#include <Arduino.h>

#include "monitor.h"


//
//	Monitor::start1
//

void Monitor::start1(uint8_t sample) {
	// reset pointer
	buffer1[0] = sample;
	p1 = 1;
}


//
//	Monitor::next1
//

void Monitor::next1(uint8_t sample) {
	// add sample to buffer (but avoid overflow)
	if (p1 < 256) {
		buffer1[p1++] = sample;
	}
}


//
//	Monitor::end1
//

void Monitor::end1() {
	for (auto i = 0; i < p1; i++) {
		Serial.println(buffer1[i]);
	}
}
