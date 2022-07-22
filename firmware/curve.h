//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


#pragma once


//
//	Curve types
//

enum {
	CURVE_LINEAR,
	CURVE_EXP1,
	CURVE_EXP2,
	CURVE_LOG1,
	CURVE_LOG2,
	CURVE_LOUD1,
	CURVE_LOUD2,
	CURVE_SPLINE,
	CURVE_COUNT
};


//
//	Curve class
//

class Curve {
public:
	// constructors
	Curve();
	Curve(uint8_t vendor);

	// send curve specification over midi
	void sendAsMidi();

	// apply curve
	inline uint8_t apply(uint8_t value) {
		return translator[value];
	}

private:
	// curve identifier
	uint8_t id;

	// curve tranlation table
	const uint8_t* translator;
};
