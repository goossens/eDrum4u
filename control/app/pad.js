//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Constants
//

const SINGLE_ZONE_PAD = 0;
const DUAL_ZONE_PAD = 1;
const TRIPLE_ZONE_PAD = 2;
const HIHAT_PAD = 3;


//
//	Pad class
//

class Pad {
	constructor(properties) {
		// copy properties into object
		for (const [key, value] of Object.entries(properties)) {
			this[key] = value;
		}
	}

	// activate this pad
	activate() {
		// update pad fields
		setValue("pad-type", this.type);
		setValue("pad-name", this.name);
		setValue("pad-curve", this.curve);

		setValue("pad-scan-time", this.scanTime);
		setValue("pad-mask-time", this.maskTime);
		setValue("pad-retrigger-time", this.retriggerTime);
		setValue("pad-head-threshold", this.headThreshold);
		setValue("pad-head-sensitivity", this.headSensitivity);
		setValue("pad-rim-threshold", this.rimThreshold);
		setValue("pad-rim-sensitivity", this.rimSensitivity);

		// set field visibility based on pad type
	}
}
