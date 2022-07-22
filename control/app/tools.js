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

function pack(scheme, object) {

}


//
//	Unpack buffer into object
//

function unpack(scheme, buffer) {
	var result = {};
	var offset = 0;

	// process all fields defined in scheme
	for (field in scheme) {
		var type = scheme[field];

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

		} else {
			alert("Invalid type in unpack");
		}
	}

	// return result
	return result;
}
