//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


//
//	Render/refresh monitor
//

function renderMonitor(ctx, w, h) {
	// calculate offsets
	const ymargin = 20;
	const xmargin = ymargin * w / h;
	const l = xmargin;
	const r = w - xmargin;
	const t = ymargin;
	const b = h - ymargin;

	// render grid
	ctx.beginPath();
	ctx.moveTo(l, t);
    ctx.lineTo(l, b);
	ctx.moveTo(l, b);
    ctx.lineTo(r, b);
    ctx.stroke();

	ctx.lineWidth = 1;
	ctx.strokeStyle = "#888";
	ctx.setLineDash([5]);
	ctx.beginPath();

	for (var i = 0; i < 10; i ++) {
		const y = ymargin + i * (b - t) / 10;
		ctx.moveTo(l, y);
	    ctx.lineTo(r, y);
	}

	for (var i = 0; i < 10; i ++) {
		const x = xmargin + (i + 1) * (r - l) / 10;
		ctx.moveTo(x, t);
	    ctx.lineTo(x, b);
	}

	ctx.stroke();

	// Scaled rectangle
	ctx.scale(15, 8);
	ctx.fillStyle = "red";
	ctx.fillRect(10, 10, 8, 20);

	// Reset current transformation matrix to the identity matrix
	ctx.setTransform(1, 0, 0, 1, 0, 0);

	// Non-scaled rectangle
	ctx.fillStyle = "gray";
	ctx.font = "32px sans-serif";
  	ctx.fillText("Hello world", 400, 400);

}


//
//	Initialize monitor
//

function setupMonitor() {
	// create monitor
	var monitor = document.getElementById("monitor");
	var ctx = monitor.getContext("2d");
	var visible = false;

	// (re)size monitor
	function resizeMonitor() {
		var bounds = monitor.getBoundingClientRect();
		var height = window.innerHeight - bounds.top - 25;
		var width = 1000 * (bounds.right - bounds.left) / height;
		monitor.style.height = height + "px";
		monitor.width = width;
		monitor.height = 1000;
		renderMonitor(ctx, width, 1000);
	}

	// resize/redraw when window size is changed
	window.addEventListener("resize", function(event) {
		if (visible) {
			resizeMonitor();
		}
	}, true);

	// handle monitor toggle
	document.getElementById("monitor-flag").addEventListener("change", function() {
		if (this.checked) {
			visible = true;
			document.getElementById("pad-inputs").classList.add("d-none");
			document.getElementById("pad-notes").classList.add("d-none");
			document.getElementById("pad-monitor").classList.remove("d-none");
			resizeMonitor();

		} else {
			visible = false;
			document.getElementById("pad-inputs").classList.remove("d-none");
			document.getElementById("pad-notes").classList.remove("d-none");
			document.getElementById("pad-monitor").classList.add("d-none");
		}
	});
}
