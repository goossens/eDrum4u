//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Constants
//

const SCOPE_HSCALE = 100;
const SCOPE_VSCALE = 512;


//
//	Oscilloscope class
//

class Oscilloscope {
	constructor() {
		// set initial state
		this.visible = false;
		this.probes = [0, 0, 0, 0];
		this.values = [[], [], [], []];
		this.colors = ["#00f", "#0f0", "#f00", "#000"];
		this.scale = new Scale(0, SCOPE_HSCALE);

		// track element and graphical context
		this.element = document.getElementById("oscilloscope");
		this.ctx = this.element.getContext("2d");

		// setup resize event handler
		window.addEventListener("resize", function(event) {
			if (this.visible) {
				this.resize();
			}
		}.bind(this), true);

		// capture probe selection events
		for (var selector of ["probe1-select", "probe2-select", "probe3-select", "probe4-select"]) {
			document.getElementById(selector).addEventListener("change", function(event) {
				const probe = parseInt(event.target.getAttribute("data-probe"));
				this.probes[probe] = parseInt(event.target.value);
				this.values[probe] = [];
				this.requestData();
				this.render();
			}.bind(this), true);
		}
	}

	// show/hide oscilloscope
	show() {
		this.visible = true;
		this.resize();
		this.requestData();
	}

	hide() {
		this.visible = false;
		this.requestData();
	}

	// clear monitor
	clear() {
		// delete information
		this.probes = [0, 0, 0, 0];
		this.values = [[], [], [], []];
		this.render();

		// clear the UI
		for (var selector of ["probe1-select", "probe2-select", "probe3-select", "probe4-select"]) {
			removeAllChildren(selector);
		}
	}

	// called when monitor becomes vissible or window size changes
	resize() {
		// adjust vertical size
		this.margin = 10;
		var bounds = this.element.getBoundingClientRect();
		var width = bounds.right - bounds.left;
		var height = window.innerHeight - bounds.top - this.margin;

		this.element.width = width;
		this.element.height = height;

		// get logical size
		this.width = width - this.margin * 2;
		this.height = height / 2 - this.margin;

		// (re)render image
		this.render();
	}

	// send oscilloscope request to module
	requestData() {
		this.midi.sendSysex(
			MIDI_VENDOR_ID, [
				MIDI_REQUEST_OSCILLOSCOPE,
				this.visible ? 1 : 0,
				this.probes[0],
				this.probes[1],
				this.probes[2],
				this.probes[3]]);
	}

	// track midi object
	setMidi(midi) {
		this.midi = midi;
	}

	// specify sampling rate
	setSamplingRate(samplingRate) {
		this.samplingRate = samplingRate;
	}

	// specify sensor count
	setSensorCount(sensors) {
		// generate the selectors
		for (var selector of ["probe1-select", "probe2-select", "probe3-select", "probe4-select"]) {
			// add default option
			addSelectorOption(selector, 0, "Off");

			// add each sensor
			for (var i = 1; i <= sensors; i++) {
				addSelectorOption(selector, i, "Sensor " + i);
			}
		}
	}

	// accept a new set of probe values
	setProbe(probe, values) {
		// set the correct probe
		this.values[probe - 1] = values;

		// refresh screen
		this.render();
	}

	// convert coordinates to screen space
	convert(x, y) {
		return [
			this.margin + this.scale.convert(x) * this.width,
			this.margin + this.height - y * this.height / SCOPE_VSCALE
		];
	}

	// render a line
	line(x1, y1, x2, y2, color, width=1, pattern=[]) {
		[x1, y1] = this.convert(x1, y1);
		[x2, y2] = this.convert(x2, y2);

		this.ctx.lineWidth = width;
		this.ctx.strokeStyle = color;
		this.ctx.setLineDash(pattern);

		this.ctx.beginPath();
		this.ctx.moveTo(x1, y1);
		this.ctx.lineTo(x2, y2);
		this.ctx.stroke();
	}

	// render a rectangle
	rectangle(x1, y1, x2, y2, color) {
		[x1, y1] = this.convert(x1, y1);
		[x2, y2] = this.convert(x2, y2);

		this.ctx.fillStyle = color;

		this.ctx.beginPath();
		this.ctx.moveTo(x1, y1);
		this.ctx.lineTo(x1, y2);
		this.ctx.lineTo(x2, y2);
		this.ctx.lineTo(x2, y1);
		this.ctx.moveTo(x1, y1);
		this.ctx.fill();
	}

	// render text
	text(text, x, y, size, color) {
		[x, y] = this.convert(x, y);

		this.ctx.textAlign = "center";
		this.ctx.font = size + "px sans-serif";
		this.ctx.fillStyle = color;

		this.ctx.fillText(text, x, y);
	}

	// render a probe line
	probe(values, color) {
		this.ctx.lineWidth = 2;
		this.ctx.strokeStyle = color;
		this.ctx.setLineDash([]);

		this.ctx.beginPath();
		var [x, y] = this.convert(0, values[0]);
		this.ctx.moveTo(x, y);

		for (var i = 1; i < values.length; i++) {
			[x, y] = this.convert(i / this.samplingRate, values[i]);
			this.ctx.lineTo(x, y);
		}

		this.ctx.stroke();
	}

	// (re)render entire monitor
	render() {
		// clear canvas
		this.ctx.clearRect(0, 0, this.element.width, this.element.height);

		// render background
		this.rectangle(0, SCOPE_VSCALE, SCOPE_HSCALE, -SCOPE_VSCALE, "#eee");

		// render grid
		for (var i = -SCOPE_VSCALE; i <= SCOPE_VSCALE; i += SCOPE_VSCALE / 8) {
			this.line(0, i, SCOPE_HSCALE, i, "#888", 0.5, [5]);
		}

		for (var i = 1; i <= 9; i++) {
			if (i <= SCOPE_HSCALE) {
				this.line(i, -SCOPE_VSCALE, i, SCOPE_VSCALE, "#888", 0.5, [5]);
			}

			if (i * 10 <= SCOPE_HSCALE) {
				this.line(i * 10, -SCOPE_VSCALE, i * 10, SCOPE_VSCALE, "#888", 0.5, [5]);
			}

			if (i * 100 <= SCOPE_HSCALE) {
				this.line(i * 100, -SCOPE_VSCALE, i * 100, SCOPE_VSCALE, "#888", 0.5, [5]);
			}
		}

		this.line(0, -SCOPE_VSCALE, 0, SCOPE_VSCALE, "#222", 1);
		this.line(0, 0, SCOPE_HSCALE, 0, "#222", 1);

		this.text("0 ms", 0.1, -SCOPE_VSCALE + 10, 12, "#080");

		for (var label of [1, 2, 3, 5, 7, 10, 20, 30, 50, 70, 100]) {
			if (i <= SCOPE_HSCALE) {
				this.text(label, label, -SCOPE_VSCALE + 10, 12, "#080");
			}
		}

		// render probes (if required)
		for (var i = 0; i < 4; i++) {
			if (this.probes[i] && this.values[i].length) {
				this.probe(this.values[i], this.colors[i]);
			}
		}
	}
}
