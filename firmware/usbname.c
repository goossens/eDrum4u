//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Include files
//

#include <usb_names.h>


//
//	Define the name of the Teensy USB MIDI device showing up in the operating system
//

struct usb_string_descriptor_struct usb_string_manufacturer_name = {
	10,
	3,
	{ 'J', 'o', 'G', 'o' }
};

struct usb_string_descriptor_struct usb_string_product_name = {
	16,
	3,
	{ 'e', 'D', 'r', 'u', 'm', '4', 'u' }
};
