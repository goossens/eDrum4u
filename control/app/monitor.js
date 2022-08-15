//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Constants
//

const MONITOR_HSCALE = 50;
const MONITOR_VSCALE = 128;


//
//	Monitor class
//

class Monitor {
	constructor() {
		// set initial state
		this.visible = false;
		this.values = [[], [], []];
		this.colors = ["#00f", "#0f0", "#f00"];
		this.hscale = new Scale(0, MONITOR_HSCALE);

		// track element and graphical context
		this.element = document.getElementById("monitor");
		this.ctx = this.element.getContext("2d");

		// setup resize event handler
		window.addEventListener("resize", function(event) {
			if (this.visible) {
				this.resize();
			}
		}.bind(this), true);

		// handle monitor toggle
		document.getElementById("monitor-flag").addEventListener("change", function(event) {
			if (event.target.checked) {
				document.getElementById("pad-inputs").classList.add("d-none");
				document.getElementById("pad-notes").classList.add("d-none");
				document.getElementById("pad-monitor").classList.remove("d-none");
				this.show();

			} else {
				document.getElementById("pad-inputs").classList.remove("d-none");
				document.getElementById("pad-notes").classList.remove("d-none");
				document.getElementById("pad-monitor").classList.add("d-none");
				this.hide();
			}
		}.bind(this));
	}

	// show/hide monitor
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
		this.values = [[], [], []];
		delete this.pad;

		// refresh screen
		this.render();
	}

	// called when monitor becomes visible or window changes size
	resize() {
		// adjust vertical size
		this.margin = 10;
		var bounds = this.element.getBoundingClientRect();
		var width = bounds.right - bounds.left;
		var height = window.innerHeight - bounds.top - 20;

		this.element.width = width;
		this.element.height = height;

		// get logical size
		this.width = width - this.margin * 2;
		this.height = height - this.margin * 2;

		// rerender image
		this.render();
	}

	// send monitor request to module
	requestData() {
		this.midi.sendSysex(
			MIDI_VENDOR_ID, [
				MIDI_REQUEST_MONITOR,
				this.visible ? 1 : 0,
				this.pad.id]);
	}

	// track midi object
	setMidi(midi) {
		this.midi = midi;
	}

	// specify sampling rate
	setSamplingRate(samplingRate) {
		this.samplingRate = samplingRate;
	}

	// switch to specified path
	setPad(pad) {
		// clear graph
		this.clear();

		// remember pad to track
		this.pad = pad;

		// re(request) monitoring data
		this.requestData();

		// refresh screen (if required)
		if (this.visible) {
			this.render();
		}
	}

	// accept a new set of channel values
	setChannel(channel, values) {
		// set the correct channel
		this.values[channel - 1] = values;

		// refresh screen
		this.render();
	}

	// convert coordinates to screen space
	convert(x, y) {
		return [
			this.margin + this.hscale.convert(x) * this.width,
			this.margin + this.height - y * this.height / MONITOR_VSCALE
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

	// render a triangle
	triangle(x1, y1, x2, y2, x3, y3, color) {
		[x1, y1] = this.convert(x1, y1);
		[x2, y2] = this.convert(x2, y2);
		[x3, y3] = this.convert(x3, y3);

		this.ctx.fillStyle = color;

		this.ctx.beginPath();
		this.ctx.moveTo(x1, y1);
		this.ctx.lineTo(x2, y2);
		this.ctx.lineTo(x3, y3);
		this.ctx.lineTo(x1, y1);
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

		// render grid
		for (var i = 0; i <= MONITOR_VSCALE; i += MONITOR_VSCALE / 8) {
			this.line(0, i, MONITOR_HSCALE, i, "#888", 0.5, [5]);
		}

		for (var i = 1; i <= 9; i++) {
			this.line(i, 0, i, MONITOR_VSCALE, "#888", 0.5, [5]);
		}

		for (var i = 10; i <= 50; i += 10) {
			this.line(i, 0, i, MONITOR_VSCALE, "#888", 0.5, [5]);
		}

		this.line(0, 0, 0, MONITOR_VSCALE, "#222", 1);
		this.line(0, 0, MONITOR_HSCALE, 0, "#222", 1);

		this.text("0 ms", 0.13, MONITOR_VSCALE - 5, 12, "#080");

		for (var label of [1, 2, 3, 5, 7, 10, 20, 30, 50]) {
			this.text(label, label, MONITOR_VSCALE - 5, 12, "#080");
		}

		// render details (if required)
		if (this.pad !== undefined) {
			// get timing information
			var t1 = this.pad.scanTime;
			var t2 = t1 + this.pad.maskTime;
			var t3 = t2 + this.pad.retriggerTime;

			// render scan time
			this.rectangle(0, 0, t1, this.pad.headSensitivity, "rgba(0, 255, 0, 0.3)");

			// render mask time
			this.rectangle(t1, 0, t2, this.pad.headSensitivity, "rgba(255, 0, 0, 0.3)");

			// render retrigger time
			this.triangle(t2, 0, t2, this.pad.headSensitivity, t3, 0, "rgba(255, 128, 0, 0.3)");

			// render threshold and sensitivity
			this.line(0, this.pad.headThreshold, MONITOR_HSCALE, this.pad.headThreshold, "#444", 1);
			this.line(0, this.pad.headSensitivity, MONITOR_HSCALE, this.pad.headSensitivity, "#444", 1);
			this.text("Threshold", 40, this.pad.headThreshold + 2, 12, "#444");
			this.text("Sensitivty", 40, this.pad.headSensitivity - 4, 12, "#444");

			// render channels (if required)
			for (var i = 0; i < 3; i++) {
				if (this.values[i] && this.values[i].length) {
					this.probe(this.values[i], this.colors[i]);
				}
			}
		}
	}
}
