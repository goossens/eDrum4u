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
#define MONITOR_CHUNK_SIZE 50


//
//	Monitor class
//

class Monitor {
public:
	// process midi events
	void midiEvent(uint8_t* data, unsigned int size);

	// sampling sessions
	void start(int pad, int channels);
	void sample(int pad, int sample1, int sample2=0, int sample3=0);
	void end(int pad);

private:
	// send channel monitoring to control app
	void sendChannel(int channel);
	void sendData(int channel, int offset, int size);

	// flags
	int active = false;
	int capturing = false;

	// pad we are tracking and number of channels
	int pad = 0;
	int channels = 0;

	// buffers to store monitored values
	int buffer[3][MONITOR_BUFFER_SIZE];
	int p = 0;
};
