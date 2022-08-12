//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Set timer to wait for specified number of milliseconds
//

function sleep(ms) {
	return new Promise(function(resolve) {
		return setTimeout(resolve, ms);
	});
}


//
//	remove all children of element
//

function removeAllChildren(element) {
	const node = document.getElementById(element);

	while (node.firstChild) {
		node.removeChild(node.lastChild);
	}
}


//
//	Show/hide elements
//

function showElement(element) {
	document.getElementById(element).style.display = "block";
}

function hideElement(element) {
	document.getElementById(element).style.display = "none";
}


//
//	Enable/disable element
//

function enableElement(element) {
	document.getElementById(element).disabled = false;
}

function disableElement(element) {
	document.getElementById(element).disabled = true;
}


//
//	Set/get element values
//

function setValue(element, value) {
	document.getElementById(element).value = value;
}

function getValue(element) {
	return document.getElementById(element).value;
}


//
//	Add an option to a selector
//

function addSelectorOption(element, value, name) {
	var selector = document.getElementById(element);
	const opt = document.createElement("option");
	opt.value = value;
	opt.innerHTML = name;
	selector.appendChild(opt);
}


//
//	Show/hide modal dialog
//

function showModal(element) {
	bootstrap.Modal.getOrCreateInstance(document.getElementById(element)).show();
}

function hideModal(element) {
	bootstrap.Modal.getOrCreateInstance(document.getElementById(element)).hide();
}


//
//	Pack object attributes into buffer
//

function pack(layout, object) {

}


//
//	Unpack buffer into object
//

function unpack(layout, buffer) {
	var result = {};
	var offset = 0;

	// process all fields defined in layout
	for (field in layout) {
		var type = layout[field];

		// handle byte fields
		if (type == "b") {
			result[field] = buffer[offset++];

		// handle string fields
		} else if (type[0] == "s") {
			var size = parseInt(type.substr(1));
			var string = "";

			for (var i = 0; i < size; i++) {
				var byte = buffer[offset++];

				if (byte) {
					string += String.fromCharCode(byte);
				}
			}

			result[field] = string;

		// handle variable length array of 14 bit integers
		} else if (type[0] == "v") {
			var sizeMsb = buffer[offset++];
			var sizelsb = buffer[offset++];
			var size = (sizeMsb << 7) | sizelsb;

			var values = [];

			for (var i = 0; i < size; i++) {
				var valueMsb = buffer[offset++];
				var valuelsb = buffer[offset++];
				var value = (valueMsb << 7) | valuelsb;
				values.push(value - 1024);
			}

			result[field] = values;

		} else {
			alert("Invalid type in unpack");
		}
	}

	// return result
	return result;
}


//
//	Scale class
//

class Scale {
	constructor(min, max) {
		this.min = min;
		this.max = max;
		this.range = Math.log(max - min + 1);
	}

	convert(v) {
		if (v <= this.min) {
			return 0;

		} else if (v >= this.max) {
			return 1;

		} else {
			return Math.log(v - this.min + 1) / this.range;
		}
	}
}
