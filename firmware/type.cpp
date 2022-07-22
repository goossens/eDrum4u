//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Include files
//

#include <string.h>
#include <usb_midi.h>

#include "config.h"
#include "curve.h"
#include "type.h"


//
//	Type::Type
//

Type::Type(uint8_t i) : id(i) {
	switch (i) {
		case TYPE_GENERIC:
			p = Properties(i, SINGLE_ZONE, "Generic", 2, 10, 40, CURVE_LINEAR, 0, 80, 5, 48, 0, 80, 5, 48);
			break;

		case TYPE_KD120:
			p = Properties(i, SINGLE_ZONE, "KD120", 2, 10, 40, CURVE_LINEAR, 0, 80, 5, 48, 0, 80, 5, 48);
			break;

		case TYPE_PD100:
			p = Properties(i, SINGLE_ZONE, "PD100", 2, 10, 40, CURVE_LINEAR, 0, 80, 5, 48, 0, 80, 5, 48);
			break;

		case TYPE_PD120:
			p = Properties(i, DUAL_ZONE, "PD120", 2, 10, 40, CURVE_LINEAR, 0, 80, 5, 48, 0, 80, 5, 48);
			break;

		case TYPE_PD125X:
			p = Properties(i, DUAL_ZONE, "PD125X", 2, 10, 40, CURVE_LINEAR, 0, 80, 5, 48, 0, 80, 5, 48);
			break;

		case TYPE_VH12:
			p = Properties(i, HIHAT, "VH12", 2, 10, 40, CURVE_LINEAR, 0, 80, 5, 48, 0, 80, 5, 48);
			break;

		case TYPE_CY12H:
			p = Properties(i, DUAL_ZONE, "CY12H", 2, 10, 40, CURVE_LINEAR, 0, 80, 5, 48, 0, 80, 5, 48);
			break;

		case TYPE_CY12C:
			p = Properties(i, DUAL_ZONE, "CY12C", 2, 10, 40, CURVE_LINEAR, 0, 80, 5, 48, 0, 80, 5, 48);
			break;

		case TYPE_CY15R:
			p = Properties(i, TRIPLE_ZONE, "CY15R", 2, 10, 40, CURVE_LINEAR, 0, 80, 5, 48, 0, 80, 5, 48);
			break;
	}
}


//
//	Type::sendAsMidi
//

void Type::sendAsMidi() {
	p.sendAsMidi(MIDI_SEND_TYPE, id);
}
