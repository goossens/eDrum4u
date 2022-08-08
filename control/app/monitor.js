//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Constants
//

const HORIZONTAL_SCALE = 100;
const VERTICAL_SCALE = 128;


//
//	Monitor class
//

class Monitor {
	constructor() {
		// set initial state
		this.visible = false;
		this.scale = new Scale(0, HORIZONTAL_SCALE);

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
				this.visible = true;
				document.getElementById("pad-inputs").classList.add("d-none");
				document.getElementById("pad-notes").classList.add("d-none");
				document.getElementById("pad-monitor").classList.remove("d-none");
				this.resize();

			} else {
				this.visible = false;
				document.getElementById("pad-inputs").classList.remove("d-none");
				document.getElementById("pad-notes").classList.remove("d-none");
				document.getElementById("pad-monitor").classList.add("d-none");
			}
		}.bind(this));
	}

	// clear monitor
	clear() {
		// delete information
		delete this.probe1;
		delete this.probe2;
		delete this.pad;

		// refresh screen
		this.render();
	}

	// called when monitor becomes vissible or window size changes
	resize() {
		// adjust vertical size
		var bounds = this.element.getBoundingClientRect();
		var width = bounds.right - bounds.left;
		var height = window.innerHeight - bounds.top - 25;

		this.element.width = width;
		this.element.height = height;

		// get logical size
		this.margin = 10;
		this.width = width - this.margin * 2;
		this.height = height / 2 - this.margin;

		// rerender image
		this.render();
	}

	// convert coordinates to screen space
	convert(x, y) {
		if (y === undefined) {
			return this.margin + this.height - x * this.height / VERTICAL_SCALE;

		} else {
			return [
				this.margin + this.scale.convert(x) * this.width,
				this.margin + this.height - y * this.height / VERTICAL_SCALE
			];
		}
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
		var [x, y] = this.convert(0, values[0] / 4.0);
		this.ctx.moveTo(x, y);

		for (var i = 1; i <= values.length; i++) {
			[x, y] = this.convert(i / this.samplingRate, values[i] / 4.0);
			this.ctx.lineTo(x, y);
		}

		this.ctx.stroke();
	}

	// (re)render entire monitor
	render() {
		// clear canvas
		this.ctx.clearRect(0, 0, this.element.width, this.element.height);

		// render grid
		for (var i = -VERTICAL_SCALE; i <= VERTICAL_SCALE; i += VERTICAL_SCALE / 8) {
			this.line(0, i, HORIZONTAL_SCALE, i, "#888", 0.5, [5]);
		}

		for (var i = 1; i <= 9; i++) {
			if (i <= HORIZONTAL_SCALE) {
				this.line(i, -128, i, 128, "#888", 0.5, [5]);
			}

			if (i * 10 <= HORIZONTAL_SCALE) {
				this.line(i * 10, -128, i * 10, 128, "#888", 0.5, [5]);
			}

			if (i * 100 <= HORIZONTAL_SCALE) {
				this.line(i * 100, -128, i * 100, 128, "#888", 0.5, [5]);
			}
		}

		this.line(0, -VERTICAL_SCALE, 0, VERTICAL_SCALE, "#222", 1);
		this.line(0, 0, HORIZONTAL_SCALE, 0, "#222", 1);

		this.text("1 ms", 1, -126, 12, "#000");

		for (var label of [2, 3, 5, 7, 10, 20, 30, 50, 70, 100]) {
			if (i <= HORIZONTAL_SCALE) {
				this.text(label, label, -126, 12, "#o00");
			}
		}

		// render pad details (if required)
		if (this.pad !== undefined) {
			// get timing information
			var t1 = this.pad.scanTime;
			var t2 = t1 + this.pad.maskTime;
			var t3 = t2 + this.pad.retriggerTime;

			// render scan time
			this.rectangle(0, this.pad.headThreshold, t1, this.pad.headSensitivity, "rgba(0, 255, 0, 0.3)");
			this.rectangle(0, -this.pad.headThreshold, t1, -this.pad.headSensitivity, "rgba(0, 255, 0, 0.3)");

			// render mask time
			this.rectangle(t1, -this.pad.headSensitivity, t2, this.pad.headSensitivity, "rgba(255, 0, 0, 0.3)");

			// render retrigger time
			this.triangle(t2, this.pad.headThreshold, t2, this.pad.headSensitivity, t3, this.pad.headThreshold, "rgba(255, 128, 0, 0.3)");
			this.triangle(t2, -this.pad.headThreshold, t2, -this.pad.headSensitivity, t3, -this.pad.headThreshold, "rgba(255, 128, 0, 0.3)");

			// render probe 1 (if required)
			if (this.probe1 && this.probe1.length) {
				this.probe(this.probe1, "#00F");
			}
		}
	}

	// specify sampling rate
	setSamplingRate(samplingRate) {
		this.samplingRate = samplingRate;
	}

	// switch to specified path
	setPad(pad) {
		// remember pad to track
		this.pad = pad;

		// refresh screen (if required)
		if (this.visible) {
			this.render();
		}
	}

	// accept a new set of probe values
	setProbe(probe, values) {
		// set the correct probe
		if (probe == 1) {
			this.probe1 = values;

		} else {
			this.probe2 = values;
		}

		// refresh screen
		this.render();
	}
}
