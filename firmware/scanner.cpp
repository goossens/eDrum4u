//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Include files
//

#include "scanner.h"


//
//	Scanner::Scanner
//

Scanner::Scanner() {
	// disable KEEPER on analog pins
	int mask = ~(1 << 12);
	CORE_PIN14_PADCONFIG &= mask; // A0
	CORE_PIN15_PADCONFIG &= mask; // A1
	CORE_PIN16_PADCONFIG &= mask; // A2
	CORE_PIN17_PADCONFIG &= mask; // A3
	CORE_PIN18_PADCONFIG &= mask; // A4
	CORE_PIN19_PADCONFIG &= mask; // A5

	// configure ADCs
	adc.adc0->setResolution(10);
	adc.adc0->setAveraging(1);
	adc.adc0->setConversionSpeed(ADC_CONVERSION_SPEED::VERY_HIGH_SPEED);
	adc.adc0->setSamplingSpeed(ADC_SAMPLING_SPEED::VERY_HIGH_SPEED);

	adc.adc1->setResolution(10);
	adc.adc1->setAveraging(1);
	adc.adc1->setConversionSpeed(ADC_CONVERSION_SPEED::VERY_HIGH_SPEED);
	adc.adc1->setSamplingSpeed(ADC_SAMPLING_SPEED::VERY_HIGH_SPEED);

	// configure mux addressing
	pinMode(MUX_A1, OUTPUT); digitalWriteFast(MUX_A1, LOW);
	pinMode(MUX_A2, OUTPUT); digitalWriteFast(MUX_A2, LOW);
	pinMode(MUX_A3, OUTPUT); digitalWriteFast(MUX_A3, LOW);

	// calibrate scanner by determining DC offsets
	calibrate();
}


//
//	Helper macros for optimize readability and performance
//

#define READ_PORT(pin1, pin2, addr1, addr2, port)							\
	adc.startSynchronizedSingleRead(pin1, pin2);							\
	while (adc.adc0->isConverting() || adc.adc1->isConverting());			\
																			\
	next[addr1 + port] = adc.adc0->readSingle() - offsets[addr1 + port];	\
	next[addr2 + port] = adc.adc1->readSingle() - offsets[addr2 + port];

#define READ_PORTS(mux, level, port)										\
	digitalWriteFast(mux, level);											\
	delayMicroseconds(MUX_SWITCH_DELAY);									\
	READ_PORT(A0, A1,  0,  8, port)											\
	READ_PORT(A2, A3, 16, 24, port)


//
//	Scanner::read
//

void Scanner::read() {
	// start next scanning cycle
	memcpy(previous, current, sizeof(current));
	memcpy(current, next, sizeof(current));

	// unroll mux loop to minimize address changes
	// {0, 1, 3, 2, 6, 7, 5, 4}
	READ_PORTS(MUX_A1, LOW, 0);
	READ_PORTS(MUX_A3, HIGH, 1);
	READ_PORTS(MUX_A2, HIGH, 3);
	READ_PORTS(MUX_A3, LOW, 2);
	READ_PORTS(MUX_A1, HIGH, 6);
	READ_PORTS(MUX_A3, HIGH, 7);
	READ_PORTS(MUX_A2, LOW, 5);
	READ_PORTS(MUX_A3, LOW, 4);
}


//
//	Scanner::calibrate
//

void Scanner::calibrate() {
	// sum of readings to calculate DC offset
	int sum[NUMBER_OF_SENSORS] = {0};

	// get enough readings to determine offsets
	for (auto i = 0; i < 1000; i++) {
		// read values and update sums
		read();

		for (auto s = 0; s < NUMBER_OF_SENSORS; s++) {
			sum[s] += next[s];
		}
	}

	// determine offsets by calculating avarage
	for (auto s = 0; s < NUMBER_OF_SENSORS; s++) {
		offsets[s] = sum[s] / 1000;
	}
}
