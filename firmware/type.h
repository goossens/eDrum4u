//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


#pragma once


//
//	Include files
//

#include "properties.h"


//
//	Pad types
//

enum {
	TYPE_GENERIC,
	TYPE_KD120,
	TYPE_PD100,
	TYPE_PD120,
	TYPE_PD125X,
	TYPE_VH12,
	TYPE_CY12C,
	TYPE_CY15R,
	TYPE_COUNT
};


//
//	Type class
//

class Type {
public:
	// constructor
	Type(uint8_t i);

	// send type configuration over midi
	void send();

private:
	// type ID
	uint8_t id;

	// type defaults
	Properties p;
};
