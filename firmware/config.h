//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


#pragma once


//
//	Configuration
//

// version identification
#define VERSION_MAJOR 0
#define VERSION_MINOR 1
#define VERSION_PATCH 1

// number of sensor boards
#define NUMBER_OF_SENSOR_BOARDS 4
#define NUMBER_OF_SENSORS (NUMBER_OF_SENSOR_BOARDS * 8)

// sampling frequency (Fs)
#define SAMPLING_RATE 20000

// maximum number of pads in kit
#define PAD_COUNT 16

// maximum number of bytes stored per pad
#define MAX_BYTES_PER_PAD 32

// mux address pins
#define MUX_A1 10
#define MUX_A2 11
#define MUX_A3 12

// mux delay in microseconds
#define MUX_SWITCH_DELAY 1

// midi vendor ID
#define MIDI_VENDOR_ID 0x66

// midi channel
#define MIDI_CHANNEL 10

// midi commands
enum {
	MIDI_REQUEST_CONFIG = 1,
	MIDI_SEND_CONFIG,
	MIDI_SEND_TYPE,
	MIDI_SEND_CURVE,
	MIDI_SEND_PAD,
	MIDI_SEND_READY,
	MIDI_UPDATE_PAD,
	MIDI_MONITOR_REQUEST,
	MIDI_MONITOR_START,
	MIDI_MONITOR_DATA,
	MIDI_MONITOR_END,
	MIDI_OSCILLOSCOPE_REQUEST,
	MIDI_OSCILLOSCOPE_START,
	MIDI_OSCILLOSCOPE_DATA,
	MIDI_OSCILLOSCOPE_END
};
