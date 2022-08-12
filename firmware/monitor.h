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


//
//	Constants
//

#define MONITOR_BUFFER_SIZE (SAMPLING_RATE / 1000 * 100)


//
//	Monitor class
//

class Monitor {
public:
	// control sessions
	void start();
	void end();

	// probe
	void probe(int sample1, int sample2=0);

private:
	// buffers to store monitored values
	int buffer1[MONITOR_BUFFER_SIZE];
	int buffer2[MONITOR_BUFFER_SIZE];
	int p;
};
