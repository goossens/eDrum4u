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
//	Type names
//

static const char* names[] {
	"Generic",
	"KD120",
	"PD100",
	"PD120",
	"PD125X",
	"VH12",
	"CY14C",
	"CY15R"
};


//
//	Type::Type
//

Type::Type(uint8_t i) : id(i) {
	switch (i) {
		case TYPE_GENERIC:
			p = Properties(i, "Generic", 2, 10, 40, CURVE_LINEAR, 0, 80, 5, 48, 0, 80, 5, 48);
			break;

		case TYPE_KD120:
			p = Properties(i, "KD120", 2, 10, 40, CURVE_LINEAR, 0, 80, 5, 48, 0, 80, 5, 48);
			break;

		case TYPE_PD100:
			p = Properties(i, "PD100", 2, 10, 40, CURVE_LINEAR, 0, 80, 5, 48, 0, 80, 5, 48);
			break;

		case TYPE_PD120:
			p = Properties(i, "PD120", 2, 10, 40, CURVE_LINEAR, 0, 80, 5, 48, 0, 80, 5, 48);
			break;

		case TYPE_PD125X:
			p = Properties(i, "PD125X", 2, 10, 40, CURVE_LINEAR, 0, 80, 5, 48, 0, 80, 5, 48);
			break;

		case TYPE_VH12:
			p = Properties(i, "VH12", 2, 10, 40, CURVE_LINEAR, 0, 80, 5, 48, 0, 80, 5, 48);
			break;

		case TYPE_CY12C:
			p = Properties(i, "CY14C", 2, 10, 40, CURVE_LINEAR, 0, 80, 5, 48, 0, 80, 5, 48);
			break;

		case TYPE_CY15R:
			p = Properties(i, "CY15R", 2, 10, 40, CURVE_LINEAR, 0, 80, 5, 48, 0, 80, 5, 48);
			break;
	}
}


//
//	Type::send
//

void Type::send() {
	const char* name = names[id];

	struct MidiPadTypeMsg {
		uint8_t start;
		uint8_t id;
		uint8_t command;
		uint8_t seqno;
		uint8_t length;
		uint8_t name[8];
		uint8_t end;
	} msg = {
		0xf0,
		MIDI_VENDOR_ID,
		MIDI_SEND_TYPE,
		id,
		(uint8_t) strlen(name),
		{ 0 },
		0xf7
	};

	memcpy(msg.name, name, strlen(name));
	usbMIDI.sendSysEx(sizeof(msg), (uint8_t*) &msg, true);
}
