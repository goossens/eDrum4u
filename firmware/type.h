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
	TYPE_CY12H,
	TYPE_CY12C,
	TYPE_CY15R,
	TYPE_COUNT
};


//
//	Trigger type
//

enum {
	SINGLE_ZONE,
	DUAL_ZONE,
	TRIPLE_ZONE,
	HIHAT
};


//
//	Type class
//

class Type {
public:
	// constructor
	Type(int id);

	// send type specification over midi
	void sendAsMidi();

private:
	// type ID
	int id;

	// type defaults
	Properties p;
};
