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

	// configure ADC
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
}


//
//	Scanner::readOnePort
//

void Scanner::readOnePort(int port) {
	// read port values from each of the four cards
	adc.startSynchronizedSingleRead(A0, A1);
	while (adc.adc0->isConverting() || adc.adc1->isConverting());
	values[0 + port] = adc.adc0->readSingle();
	values[8 + port] = adc.adc1->readSingle();

	adc.startSynchronizedSingleRead(A2, A3);
	while (adc.adc0->isConverting() || adc.adc1->isConverting());
	values[16 + port] = adc.adc0->readSingle();
	values[24 + port] = adc.adc1->readSingle();
}


//
//	Scanner::read
//

void Scanner::read() {
	// unroll mux loop to minimize address changes
	// {0, 1, 3, 2, 6, 7, 5, 4}
	digitalWriteFast(MUX_A1, LOW);
	delayMicroseconds(MUX_SWITCH_DELAY);
	readOnePort(0);

	digitalWriteFast(MUX_A3, HIGH);
	delayMicroseconds(MUX_SWITCH_DELAY);
	readOnePort(1);

	digitalWriteFast(MUX_A2, HIGH);
	delayMicroseconds(MUX_SWITCH_DELAY);
	readOnePort(3);

	digitalWriteFast(MUX_A3, LOW);
	delayMicroseconds(MUX_SWITCH_DELAY);
	readOnePort(2);

	digitalWriteFast(MUX_A1, HIGH);
	delayMicroseconds(MUX_SWITCH_DELAY);
	readOnePort(6);

	digitalWriteFast(MUX_A3, HIGH);
	delayMicroseconds(MUX_SWITCH_DELAY);
	readOnePort(7);

	digitalWriteFast(MUX_A2, LOW);
	delayMicroseconds(MUX_SWITCH_DELAY);
	readOnePort(5);

	digitalWriteFast(MUX_A3, LOW);
	delayMicroseconds(MUX_SWITCH_DELAY);
	readOnePort(4);
}
