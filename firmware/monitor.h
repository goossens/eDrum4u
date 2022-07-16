//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


#pragma once


//
//	Monitor class
//

class Monitor {
public:
	// probe 1
	void start1(uint8_t sample);
	void next1(uint8_t sample);
	void end1();

	// probe 2
	void start2(uint8_t sample);
	void next2(uint8_t sample);
	void end2();

private:
	// buffers to store monitored values
	uint8_t buffer1[256];
	uint8_t buffer2[256];
	int p1;
	int p2;
};
