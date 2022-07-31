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
	// control sessions
	void start();
	void end();

	// probe
	void probe(int sample1, int sample2=0);

private:
	// buffers to store monitored values
	int buffer1[256];
	int buffer2[256];
	int p;
};
