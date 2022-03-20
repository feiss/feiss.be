
/** by Diego F. Goberna for Ludum Dare 31 **/
/** go to http://feiss.be/games **/

GREEN = "#2FD704";
BLUE = "#346BF4";
RED = "#F00";


STATE_OFF = 0;
STATE_ON = 1;
STATE_COMPLETED = 2;
STATE_ALERT = 3;

MAX_SPEED = 27650;
MAX_STARS = 200;
MAX_Z = 100;
STARCOLORS = ["#fff", "#fff", "#eef", "#fff", "#fff", "#fff"];
MAX_X = 100000;
MAX_ALTITUDE = 5000;

function start(cont) {

	playground({

		create: function () {
			this.loadImages(
				"cockpit1", "screens", "sky1", "sky2", "gameover", "win", "cockpit2",
				"cloud1", "cloud2", "moon",
				"font1", "font1blue", "font1red", "font2", "font2blue", "font2red", "panel", "alert", "travel",
				"switch1on", "switch1off", "gauge", "gaugegoal",
				"buttona", "buttonb", "buttonc", "buttond");
			this.loadSounds(
				"bglow", "click1", "beep1", "beep2", "beep3", "beep0", "radio", "preignition", "ignition", "postignition",
				"countdown", "nope", "good", "click0", "alarm", "ost"
			);
		},

		ready: function () {
			this.fb = cq(320, 200).clear("#497cad");
			this.led = cq(320, 200).lineWidth(1);
			this.lfo1offset = Math.random();
			this.lfo2offset = Math.random();
			this.lfo3offset = Math.random();
			this.lfo1 = this.lfo2 = this.lfo3 = 0;
			this.t = 0;

			this.state = 0;
			this.statetime = 0;

			this.msgqueue = [];

			this.addsay(" ");
			this.addsay("HI CAPTAIN! GLAD YOU CAME :)");
			this.addsay("I THOUGHT WE WOULD TAKE OFF WITHOUT YOU, ha ha");
			this.addsay("OK, LETS GO!");
			this.addsay(" ");
			this.addsay(" ");
			this.addsay("...       ");
			this.addsay(" ");
			this.addsay(">> YOU MAY TURN THE POWER ON NOW, SIR");
			this.addsay(" ");
			this.addsay(" ");
			this.addsay(">> SWITCH THE POWER ON..");
			this.addsay(" ");
			this.addsay(" ");
			this.addsay(" ");
			this.addsay(">> CLICK ON THE DAMN -POWER- BUTTON!!");

			this.gameover = false;

			this.progress = 0;
			this.speed = 0;
			this.angspeed = 0;
			this.altitude = 0.2;
			this.pitch = 0;
			this.dpitch = 0;
			this.alert = false;
			this.sound_alarm = null;
			this.engineon = false;
			this.tasksfinished = false;

			this.moonscale = 0.01;

			this.ost = null;

			this.message = null;
			this.panel = null;
			this.activebutton = null;
			this.dragging = null;

			this.cloud1 = { x: 160 + Math.random() * 160, y: Math.random() * 100 };
			this.cloud2 = { x: 160 + Math.random() * 160, y: Math.random() * 100 };

			this.turbulence = 0;
			this.starfield = [];
			this.starlayer = cq(320, 200).clear("#000").globalAlpha(0.3);
			this.space = 0;

			this.startflightseq = false;

			var ba_off = cq(this.images.buttona).blend("#000", "luminosity", 0.5).canvas;
			var ba_on = this.images.buttona;
			var ba_completed = cq(this.images.buttona).blend(GREEN, "hue", 1).canvas;
			var ba_alert = cq(this.images.buttona).blend(RED, "hue", 1).canvas;
			var imgs = [ba_off, ba_on, ba_completed, ba_alert];

			var sw1on = this.images.switch1on;
			var sw1off = this.images.switch1off;

			this.buttons = [
				{ id: 0, title: "POWER", type: "switch", img: imgs, x: 144, y: 172, state: STATE_OFF, func: this.poweron.bind(this), enabled: true },
				{
					id: 1, title: "SYSTEMS CHECK", type: "multiswitch", img: imgs, x: 159, y: 172, state: STATE_OFF, func: this.systemschecked.bind(this),
					value: 0,
					switches: [
						{ name: "sys1", value: 0, x: 100, y: 85, img: [sw1off, sw1on] },
						{ name: "sys3", value: 0, x: 167, y: 85, img: [sw1off, sw1on] },
						{ name: "sys4", value: 0, x: 195, y: 85, img: [sw1off, sw1on] },
						{ name: "GEN", value: 0, x: 195, y: 137, img: [sw1off, sw1on] }]
				},

				{
					id: 2, title: "SERVICE STRUCTURE", type: "gauge", img: imgs, x: 150, y: 38, state: STATE_OFF, func: this.servicestructure.bind(this),
					value: 0,
					switches: [
						{ name: "rotation", value: 6, goal: 40, x: 145, y: 75, img: [this.images.gauge] }
					]
				},

				{
					id: 3, title: "INERTIAL MSR UNITS", type: "multiswitch", img: imgs, x: 83 + 36, y: 9, state: STATE_OFF, func: this.inertialmeasurement.bind(this),
					value: 0,
					switches: [
						{ name: "UNIT X", value: 0, x: 110, y: 100, img: [sw1off, sw1on] },
						{ name: "UNIT Y", value: 0, x: 150, y: 100, img: [sw1off, sw1on] },
						{ name: "UNIT Z", value: 0, x: 195, y: 100, img: [sw1off, sw1on] }]
				},

				{ id: 4, type: "switch", img: imgs, x: 83 + 12, y: 9, state: STATE_OFF, title: "COMM", func: this.commsystem.bind(this) },
				{ id: 5, type: "switch", img: imgs, x: 172, y: 146, state: STATE_OFF, title: "RADIO", func: this.radiook.bind(this) },

				{
					id: 6, title: "PROPELLANTS", type: "gauge", img: imgs, x: 235, y: 9, state: STATE_OFF, func: this.propellants.bind(this),
					value: 0,
					switches: [
						{ name: "H2 LOAD", value: 20, goal: 90, x: 117, y: 75, img: [this.images.gauge] },
						{ name: "O2 LOAD", value: 13, goal: 90, x: 185, y: 75, img: [this.images.gauge] }
					]
				},

				{ id: 7, type: "switch", img: imgs, x: 164, y: 9, state: STATE_OFF, title: "VENT VALVES", func: this.ventvalves.bind(this) },
				{ id: 8, type: "switch", img: imgs, x: 175, y: 172, state: STATE_OFF, title: "MAIN ENGINE", func: this.enginestart.bind(this) },


				{
					id: 9, type: "multiswitch", img: imgs, x: 142, y: 148, state: STATE_OFF, title: "1st stage separation", func: this.spacesequence.bind(this),
					value: 0,
					switches: [
						{ name: "eng 1", value: 0, x: 116, y: 83, img: [sw1off, sw1on] },
						{ name: "eng 2", value: 0, x: 176, y: 83, img: [sw1off, sw1on] },
						{ name: "eng 3", value: 0, x: 116, y: 135, img: [sw1off, sw1on] },
						{ name: "eng root", value: 0, x: 176, y: 135, img: [sw1off, sw1on] }]
				},
				{ id: 10, type: "switch", img: imgs, x: 120, y: 38, state: STATE_OFF, timeout: 5, title: "fairing jet", func: this.spacesequence.bind(this) },

				{
					id: 11, type: "gauge", img: imgs, x: 199, y: 9, state: STATE_OFF, title: "orbit seq", func: this.spacesequence.bind(this),
					value: 0,
					switches: [
						{ name: "jet 1", value: 8, goal: 94, x: 98, y: 77, img: [this.images.gauge] },
						{ name: "jet 2", value: 23, goal: 85, x: 132, y: 77, img: [this.images.gauge] },
						{ name: "jaw", value: 50, goal: 16, x: 167, y: 77, img: [this.images.gauge] },
						{ name: "roll", value: 12, goal: 58, x: 199, y: 77, img: [this.images.gauge] }
					]
				},

				{
					id: 12, type: "multiswitch", img: imgs, x: 142, y: 158, state: STATE_OFF, title: "2nd stage separation", func: this.spacesequence.bind(this),
					value: 0,
					switches: [
						{ name: "sku", value: 0, x: 110, y: 85, img: [sw1off, sw1on] },
						{ name: "lb1", value: 0, x: 151, y: 85, img: [sw1off, sw1on] },
						{ name: "dfg", value: 0, x: 190, y: 85, img: [sw1off, sw1on] },
						{ name: "release", value: 0, x: 151, y: 135, img: [sw1off, sw1on] }]
				},
				{ id: 13, type: "switch", img: imgs, x: 135, y: 38, state: STATE_OFF, timeout: 3, title: "skirt jet", func: this.spacesequence.bind(this) },


				{ id: 40, type: "switch", img: imgs, x: 83, y: 9, state: STATE_OFF, title: "FAV LOAD", func: null },
				{ id: 40, type: "switch", img: imgs, x: 83 + 24, y: 9, state: STATE_OFF, title: "4TH CUT OFF", func: null },
				{ id: 40, type: "switch", img: imgs, x: 140, y: 9, state: STATE_OFF, title: "TIME CAPSULE", func: null },
				{ id: 40, type: "switch", img: imgs, x: 140 + 12, y: 9, state: STATE_OFF, title: "ABS SYSTEMS", func: null },
				{ id: 40, type: "switch", img: imgs, x: 164 + 12, y: 9, state: STATE_OFF, title: "CABIN AIR COND", func: null },
				{ id: 40, type: "switch", img: imgs, x: 199 + 12, y: 9, state: STATE_OFF, title: "ORBIT RADIO", func: null },
				{ id: 40, type: "switch", img: imgs, x: 199 + 24, y: 9, state: STATE_OFF, title: "H2 LEVELS", func: null },

				{ id: 40, type: "switch", img: imgs, x: 181, y: 30, state: STATE_OFF, title: "GAS GAUGE", func: null },
				{ id: 40, type: "switch", img: imgs, x: 181 + 15, y: 30, state: STATE_OFF, title: "RANDOM BUTTON", func: null },
				{ id: 40, type: "switch", img: imgs, x: 181 + 30, y: 30, state: STATE_OFF, title: "KEYB 24", func: null },


			];
			for (var i = 1; i < this.buttons.length; i++) this.buttons[i].enabled = false;


			this.music = this.playSound("bglow", true);
		},

		font1: [{ id: 34, x: 309, w: 3, yo: 1, xo: 4 }, { id: 33, x: 278, w: 1, yo: 1, xo: 2 }, { id: 35, x: 27, w: 5, yo: 1, xo: 6 }, { id: 36, x: 33, w: 5, yo: 1, xo: 6 }, { id: 37, x: 39, w: 5, yo: 1, xo: 6 }, { id: 38, x: 8, w: 6, yo: 1, xo: 7 }, { id: 40, x: 252, w: 3, yo: 1, xo: 4 }, { id: 41, x: 264, w: 3, yo: 1, xo: 4 }, { id: 42, x: 305, w: 3, yo: 1, xo: 4 }, { id: 43, x: 285, w: 5, yo: 2, xo: 6 }, { id: 44, x: 313, w: 2, yo: 6, xo: 3 }, { id: 45, x: 322, w: 5, yo: 4, xo: 6 }, { id: 46, x: 316, w: 2, yo: 6, xo: 3 }, { id: 47, x: 256, w: 3, yo: 1, xo: 4 }, { id: 48, x: 15, w: 5, yo: 1, xo: 6 }, { id: 49, x: 260, w: 3, yo: 1, xo: 4 }, { id: 50, x: 105, w: 5, yo: 1, xo: 6 }, { id: 51, x: 111, w: 5, yo: 1, xo: 6 }, { id: 52, x: 117, w: 5, yo: 1, xo: 6 }, { id: 53, x: 123, w: 5, yo: 1, xo: 6 }, { id: 54, x: 129, w: 5, yo: 1, xo: 6 }, { id: 55, x: 135, w: 5, yo: 1, xo: 6 }, { id: 56, x: 141, w: 5, yo: 1, xo: 6 }, { id: 57, x: 147, w: 5, yo: 1, xo: 6 }, { id: 58, x: 291, w: 1, yo: 2, xo: 2 }, { id: 59, x: 282, w: 2, yo: 2, xo: 3 }, { id: 60, x: 237, w: 4, yo: 1, xo: 5 }, { id: 61, x: 293, w: 5, yo: 3, xo: 6 }, { id: 62, x: 242, w: 4, yo: 1, xo: 5 }, { id: 63, x: 247, w: 4, yo: 1, xo: 5 }, { id: 64, x: 0, w: 7, yo: 1, xo: 8 }, { id: 65, x: 153, w: 5, yo: 1, xo: 6 }, { id: 66, x: 195, w: 5, yo: 1, xo: 6 }, { id: 67, x: 201, w: 5, yo: 1, xo: 6 }, { id: 68, x: 207, w: 5, yo: 1, xo: 6 }, { id: 69, x: 213, w: 5, yo: 1, xo: 6 }, { id: 70, x: 219, w: 5, yo: 1, xo: 6 }, { id: 71, x: 225, w: 5, yo: 1, xo: 6 }, { id: 72, x: 51, w: 5, yo: 1, xo: 6 }, { id: 73, x: 268, w: 3, yo: 1, xo: 4 }, { id: 74, x: 231, w: 5, yo: 1, xo: 6 }, { id: 75, x: 21, w: 5, yo: 1, xo: 6 }, { id: 76, x: 45, w: 5, yo: 1, xo: 6 }, { id: 77, x: 57, w: 5, yo: 1, xo: 6 }, { id: 78, x: 63, w: 5, yo: 1, xo: 6 }, { id: 79, x: 69, w: 5, yo: 1, xo: 6 }, { id: 80, x: 75, w: 5, yo: 1, xo: 6 }, { id: 81, x: 81, w: 5, yo: 1, xo: 6 }, { id: 82, x: 87, w: 5, yo: 1, xo: 6 }, { id: 83, x: 93, w: 5, yo: 1, xo: 6 }, { id: 84, x: 99, w: 5, yo: 1, xo: 6 }, { id: 85, x: 159, w: 5, yo: 1, xo: 6 }, { id: 86, x: 165, w: 5, yo: 1, xo: 6 }, { id: 87, x: 171, w: 5, yo: 1, xo: 6 }, { id: 88, x: 177, w: 5, yo: 1, xo: 6 }, { id: 89, x: 189, w: 5, yo: 1, xo: 6 }, { id: 90, x: 183, w: 5, yo: 1, xo: 6 }, { id: 91, x: 272, w: 2, yo: 1, xo: 3 }, { id: 93, x: 275, w: 2, yo: 1, xo: 3 }, { id: 94, x: 299, w: 5, yo: 1, xo: 6 }, { id: 95, x: 328, w: 4, yo: 7, xo: 5 }, { id: 96, x: 319, w: 2, yo: 1, xo: 3 }, { id: 124, x: 280, w: 1, yo: 1, xo: 2 }],
		font2: [{ id: 33, x: 239, w: 1, yo: 1, xo: 2 }, { id: 34, x: 267, w: 3, yo: 1, xo: 4 }, { id: 35, x: 23, w: 4, yo: 1, xo: 5 }, { id: 36, x: 28, w: 4, yo: 1, xo: 5 }, { id: 37, x: 33, w: 4, yo: 1, xo: 5 }, { id: 38, x: 7, w: 5, yo: 1, xo: 6 }, { id: 40, x: 213, w: 3, yo: 1, xo: 4 }, { id: 41, x: 225, w: 3, yo: 1, xo: 4 }, { id: 42, x: 258, w: 3, yo: 1, xo: 4 }, { id: 43, x: 246, w: 4, yo: 2, xo: 5 }, { id: 44, x: 271, w: 2, yo: 5, xo: 3 }, { id: 45, x: 280, w: 4, yo: 3, xo: 5 }, { id: 46, x: 274, w: 2, yo: 5, xo: 3 }, { id: 47, x: 217, w: 3, yo: 1, xo: 4 }, { id: 48, x: 13, w: 4, yo: 1, xo: 5 }, { id: 49, x: 221, w: 3, yo: 1, xo: 4 }, { id: 50, x: 88, w: 4, yo: 1, xo: 5 }, { id: 51, x: 93, w: 4, yo: 1, xo: 5 }, { id: 52, x: 98, w: 4, yo: 1, xo: 5 }, { id: 53, x: 103, w: 4, yo: 1, xo: 5 }, { id: 54, x: 108, w: 4, yo: 1, xo: 5 }, { id: 55, x: 113, w: 4, yo: 1, xo: 5 }, { id: 56, x: 118, w: 4, yo: 1, xo: 5 }, { id: 57, x: 123, w: 4, yo: 1, xo: 5 }, { id: 58, x: 251, w: 1, yo: 2, xo: 2 }, { id: 59, x: 243, w: 2, yo: 2, xo: 3 }, { id: 60, x: 138, w: 4, yo: 1, xo: 4 }, { id: 61, x: 262, w: 4, yo: 3, xo: 5 }, { id: 62, x: 148, w: 4, yo: 1, xo: 4 }, { id: 63, x: 153, w: 4, yo: 1, xo: 4 }, { id: 64, x: 0, w: 6, yo: 1, xo: 7 }, { id: 65, x: 128, w: 4, yo: 1, xo: 5 }, { id: 66, x: 163, w: 4, yo: 1, xo: 5 }, { id: 67, x: 168, w: 4, yo: 1, xo: 5 }, { id: 68, x: 173, w: 4, yo: 1, xo: 5 }, { id: 69, x: 178, w: 4, yo: 1, xo: 5 }, { id: 70, x: 183, w: 4, yo: 1, xo: 5 }, { id: 71, x: 188, w: 4, yo: 1, xo: 5 }, { id: 72, x: 43, w: 4, yo: 1, xo: 5 }, { id: 73, x: 229, w: 3, yo: 1, xo: 4 }, { id: 74, x: 193, w: 4, yo: 1, xo: 5 }, { id: 75, x: 198, w: 4, yo: 1, xo: 5 }, { id: 76, x: 203, w: 4, yo: 1, xo: 5 }, { id: 77, x: 208, w: 4, yo: 1, xo: 5 }, { id: 78, x: 18, w: 4, yo: 1, xo: 5 }, { id: 79, x: 38, w: 4, yo: 1, xo: 5 }, { id: 80, x: 48, w: 4, yo: 1, xo: 5 }, { id: 81, x: 53, w: 4, yo: 1, xo: 5 }, { id: 82, x: 58, w: 4, yo: 1, xo: 5 }, { id: 83, x: 63, w: 4, yo: 1, xo: 5 }, { id: 84, x: 68, w: 3, yo: 1, xo: 5 }, { id: 85, x: 73, w: 4, yo: 1, xo: 5 }, { id: 86, x: 78, w: 4, yo: 1, xo: 5 }, { id: 87, x: 83, w: 4, yo: 1, xo: 5 }, { id: 88, x: 133, w: 4, yo: 1, xo: 5 }, { id: 89, x: 158, w: 4, yo: 1, xo: 5 }, { id: 90, x: 143, w: 4, yo: 1, xo: 5 }, { id: 91, x: 233, w: 2, yo: 1, xo: 3 }, { id: 93, x: 236, w: 2, yo: 1, xo: 3 }, { id: 94, x: 253, w: 4, yo: 1, xo: 5 }, { id: 95, x: 285, w: 4, yo: 6, xo: 4 }, { id: 96, x: 277, w: 2, yo: 1, xo: 3 }, { id: 124, x: 241, w: 1, yo: 1, xo: 2 }],

		text: function (fb, text, x, y, font, color) {
			var xx = x;
			var img = null;
			if (font == undefined) font = this.font1;
			if (font == this.font1) {
				if (color === "blue") img = this.images.font1blue;
				else if (color === "red") img = this.images.font1red;
				else img = this.images.font1;
			}
			else if (font == this.font2) {
				if (color === "blue") img = this.images.font2blue;
				else if (color === "red") img = this.images.font2red;
				else img = this.images.font2;
			}
			text = text.toUpperCase();
			for (i in text) {
				var c = text.charCodeAt(i), ch;
				if (c == 32) { xx += 3; continue; }
				for (j in font) if (font[j].id == c) { ch = font[j]; break; }
				if (!ch) continue;
				fb.drawRegion(img, [ch.x, 0, ch.w, 7], xx, y + ch.yo, 1);
				xx += ch.w + 1;
			}
			if (y > 187)
				fb.globalAlpha(this.lfo2 > 0.5 ? 1 : 0).fillStyle(color == "blue" ? BLUE : GREEN).fillRect(xx + 4, y + 1, 5, 7).globalAlpha(1);
		},
		centertext: function (fb, text, x, y, font, color) {
			var len = this.textLength(text, font);
			this.text(fb, text, x - Math.floor(len / 2), y, font, color);
		},
		righttext: function (fb, text, x, y, font, color) {
			var len = this.textLength(text, font);
			this.text(fb, text, x - len, y, font, color);
		},
		textLength: function (text, font) {
			if (font == undefined) font = this.font1;
			var xx = 0;
			text = text.toUpperCase();
			for (i in text) {
				var c = text.charCodeAt(i), ch;
				if (c == 32) { xx += 3; continue; }
				for (j in font) if (font[j].id == c) { ch = font[j]; break; }
				if (!ch) continue;
				xx += ch.w + 1;
			}
			return xx;
		},
		shutup: function () {
			this.msgqueue = [];
			this.message = null;
		},

		say: function (fb, text) {
			if (this.message || !text) return;
			this.message = {
				text: text.toUpperCase(),
				fb: fb,
				starttime: this.t,
				endtime: text == " " ? this.t + 1 : this.t + Math.min(3, 2 * text.length * 0.1),
				idx: 0
			};
			if (text.charAt(0) == ">") this.message.endtime = this.t + 999;
		},

		addsay: function (text) {
			this.msgqueue.push(text);
		},

		step: function (delta) {
			if (this.gameover) return;

			this.t += delta;

			if (this.state == 3 && this.statetime > 10) this.setState(4);

			this.statetime = this.t - this.statestart;

			if (this.state == 4) {
				if (!this.engineon && this.statetime >= 1) return this.gameOver("you did not start the engine!");

				if (this.engineon) {
					if (this.statetime < 10) this.turbulence = Math.min(this.turbulence + 1, 7);
					//this.sound.setPlaybackRate(this.sound_postignition, Math.min(1, Math.max(0.1, this.turbulence / 10.0)));
					this.speed += 1;
					if (this.speed > MAX_SPEED) this.speed = MAX_SPEED;
					this.angspeed += Math.random() * 0.1 - 0.05;
					this.altitude += 0.3561;
					this.progress = this.altitude / MAX_ALTITUDE;
				}

				if (this.progress >= 1 && this.tasksfinished) return this.winGame();

				if (this.statetime > 35 && !this.startflightseq) {
					this.startflightseq = true;
					this.addsay(">> 1st stage separation");
					this.buttons[9].enabled = true;
				}

				if (this.starfield.length < MAX_STARS)
					this.starfield.push({
						x: Math.random() * MAX_X,
						y: Math.random() * MAX_X,
						z: MAX_Z,
						color: STARCOLORS[Math.floor(Math.random() * STARCOLORS.length)]
					});
				if (this.altitude > 600) {
					this.space = 1;
				}
				else if (this.altitude > 300) {
					if (this.space == 0) this.ost = this.playSound("ost");
					this.space = (this.altitude - 300) / 300;
					this.sound.setVolume(this.sound_postignition, Math.min(1, 1.1 - this.space));
				}
				if (this.space > 0) this.moonscale += 0.1;
			}
			if (this.state == 3) {
				this.sound.setPlaybackRate(this.sound_preignition, Math.min(1, this.statetime / 12));
			}



			//	this.alert= false;

			if (this.state > 3) {
				this.pitch += .5 * (Math.sin(this.t / 100) * .5 + Math.sin(this.t / 100 * .3) + Math.sin(this.t / 100 * .1) + Math.sin(this.t / 100 * 5) * .05 + Math.sin(this.t / 100 * 2) * 0.1);

				if (this.keyboard.keys["up"]) {
					this.dpitch += delta;
					if (this.dpitch > 5) this.dpitch = 5;
				}
				else if (this.keyboard.keys["down"]) {
					this.dpitch -= delta;
					if (this.dpitch < -5) this.dpitch = -5;
				}
			}

			this.pitch += this.dpitch;
			this.dpitch *= 1 - delta;

			var abspitch = Math.abs(this.pitch);
			if (abspitch > 200) this.alarm(true); else this.alarm(false);
			if (abspitch > 350) this.gameOver("you were out of trajectory");

			if (abspitch < 50) this.turbulence *= 0.95;
			else this.turbulence += Math.abs(this.pitch / 1000);


			this.turbulence = Math.min(this.turbulence, 20);


			this.lfo1 = 0.5 + Math.sin(this.lfo1offset + this.t * 50) * 0.5;
			this.lfo2 = 0.5 + Math.sin(this.lfo2offset + this.t * 10) * 0.5;
			this.lfo3 = 0.5 + Math.sin(this.lfo31offset + this.t * 100) * 0.5;

			this.cloud1.x -= .1; this.cloud1.y -= .01;
			this.cloud2.x -= .3; this.cloud2.y -= .1;
			if (this.cloud1.x < -this.images.cloud1.width) { this.cloud1.x = 320; this.cloud1.y = Math.random() * 100; }
			if (this.cloud2.x < -this.images.cloud2.width) { this.cloud2.x = 320; this.cloud2.y = Math.random() * 100; }


			if (this.message) {
				this.message.idx = Math.min(this.message.text.length, Math.floor((this.t - this.message.starttime) * 30));
				if (this.t > this.message.endtime) this.message = null;
			}
			else if (this.msgqueue.length > 0) this.say(this.fb, this.msgqueue.shift());


			if (this.state > 0) {
				if (Math.random() < 0.005) this.playSound("beep" + Math.floor(Math.random() * 4));
			}
		},

		render: function () {
			var i;

			if (this.gameover) return;

			this.led.clear("#000");

			this.fb.globalAlpha(0.5);
			if (this.space < 1) this.fb.drawRegion(this.images.sky1, [0, this.images.sky1.height / 2 - 100 + this.pitch, 320, 200], 0, 0, 1);

			if (this.space > 0) {
				if (this.space < 1) this.fb.globalAlpha(this.space);
				this.fb.drawRegion(this.images.sky2, [0, this.images.sky2.height / 2 - 100 + this.pitch, 320, 200], 0, 0, 1);
				//		this.fb.save().scale(this.moonscale, this.moonscale).drawImage(this.images.moon, 120, 100+this.pitch).restore();
				if (this.space < 1) this.fb.globalAlpha(0.5);
			}


			this.drawStarfield();
			if (this.speed < 300) {
				this.fb.save().scale(1 + this.speed / 4000, 1 + this.speed / 4000);
				this.fb.drawImage(this.images.cloud1, this.cloud1.x, this.cloud1.y - this.pitch * 2);
				this.fb.drawImage(this.images.cloud2, this.cloud2.x, this.cloud2.y - this.pitch * 2);
				this.fb.restore();
			}
			this.fb.globalAlpha(1);

			if (this.space < 1) this.fb.drawImage(this.images.cockpit1, 0, 0);
			if (this.space > 0) {
				if (this.space < 1) this.fb.globalAlpha(this.space);
				this.fb.drawImage(this.images.cockpit2, 0, 0);
				if (this.space < 1) this.fb.globalAlpha(1);
			}

			if (this.state == 0) {
				if (this.t > 9) this.fb.fillStyle(this.lfo2 > 0.5 ? "#000" : BLUE).fillRect(this.buttons[0].x + this.buttons[0].img[0].width + 2, this.buttons[0].y, 2, 2);

			}
			else if (this.state == 1) {
				this.fb.blend(this.images.screens, "screen", this.lfo2 * this.statetime * Math.random());
				this.led.drawImage(this.buttons[0].img[0], this.buttons[0].x, this.buttons[0].y);
				if (this.statetime > 1) {
					this.setState(2);
					this.buttons[1].enabled = true;
				}
			}
			else {
				this.fb.blend(this.images.screens, "screen", 1 - this.lfo1 * .05);
				//this.text(this.fb, ""+Math.floor(this.starfield.length), 10, 8, this.font2);

				// led layer
				this.drawClock();
				this.righttext(this.led, "" + Math.floor(this.pitch / 5), 180, 133, this.font2, this.alert ? "red" : "blue");
				this.text(this.led, "" + Math.floor(this.state), 104, 85);

				//pitch
				var linepitch = Math.min(138, Math.max(105, Math.floor(120 - this.pitch / 450 * 16)));
				this.led.fillStyle(this.alert ? RED : GREEN).fillRect(153, linepitch, 15, 1);

				//numbers screen
				this.righttext(this.led, "" + (Math.floor(this.angspeed * 10) / 10), 229, 89, this.font2, "blue");
				this.righttext(this.led, "" + Math.floor(this.speed), 229, 99, this.font2, "blue");
				this.righttext(this.led, "" + (Math.floor(this.altitude * 10) / 10), 229, 109, this.font2, "blue");

				//travel
				this.led.drawRegion(this.images.travel, [0, 0, Math.max(1, Math.floor(this.progress * this.images.travel.width)), this.images.travel.height], 194, 138, 1);


				for (i in this.buttons) {
					var but = this.buttons[i], col;
					switch (but.state) {
						case STATE_OFF: col = "#041211"; break;
						case STATE_ON:
						case STATE_COMPLETED: col = GREEN; break;
						case STATE_ALERT: col = this.lfo1 > 0.5 ? "#000" : RED; break;
					}

					var layer = (but.state == STATE_OFF) ? this.fb : this.led;
					layer.drawImage(but.img[but.state], but.x, but.y);
					layer.fillStyle(col).fillRect(but.x + but.img[0].width + 2, but.y, 2, 2);
				}
			}

			if (this.message && this.message.text != " ") {
				this.fb.globalAlpha(0.3).fillStyle("#000").fillRect(0, 188, 320, 12).globalAlpha(1);
				this.text(this.led, this.message.text.substr(0, this.message.idx + 1), 10, 190, this.font1, this.message.text.charAt(0) === ">" ? "blue" : "");
			}

			this.fb.blend(this.led, "screen", 1 - this.lfo1 * 0.1);
			cq.smoothing = true;
			this.fb.blend(this.led.resize(.5).resize(2), "screen", 1 - this.lfo1 * 0.2);
			cq.smoothing = false;

			// tooltips
			if (this.activebutton) {
				this.fb.drawImage(this.activebutton.fb.canvas, this.activebutton.x, this.activebutton.y);
			}


			// panel layer
			this.led.clear("#000");
			if (this.panel) this.drawPanel();
			//panel led
			this.fb.blend(this.led, "screen", 1 - this.lfo1 * 0.1);
			cq.smoothing = true;
			this.fb.blend(this.led.resize(.5).resize(2), "screen", 1 - this.lfo1 * 0.2);
			cq.smoothing = false;

			if (this.alert) this.fb.blend(this.images.alert, "screen", this.lfo2);

			this.layer.save();
			if (this.turbulence > 0) {
				this.layer.globalAlpha(0.5);
				this.layer.translate(Math.random() * this.turbulence, Math.random() * this.turbulence);
			}

			this.layer.scale(3, 3).drawImage(this.fb.canvas, 0, 0);
			this.layer.restore();

		},

		drawClock: function () {
			var m, s;

			if (this.state < 3) {
				m = 0;
				s = 0;
			}
			else if (this.state == 3) {
				m = 0;
				s = 10 - Math.floor(this.statetime);
			}
			else {
				m = Math.floor(this.t / 60);
				s = Math.floor(this.t % 60);
			}
			if (m < 10) m = "0" + m;
			if (s < 10) s = "0" + s;

			//	this.centertext(this.led, ""+m+":"+s, 99, 34, this.font2, "blue");
			this.centertext(this.led, "" + m + ":" + s, 161, 86);
		},

		drawStarfield: function () {
			var xx, yy, star, m2 = MAX_X / 2, gray;
			var speed;
			if (this.altitude < 500) speed = this.speed / MAX_SPEED * 30;
			else speed = this.speed / MAX_SPEED * 4;

			this.starlayer.clear("#000");

			for (var i = 0; i < this.starfield.length; i++) {
				star = this.starfield[i];
				star.z -= speed;

				xx = Math.floor((star.x - m2) / star.z) + 160;
				yy = Math.floor((star.y - m2) / star.z) + 85;
				if (star.z < 1 || xx < 0 || xx > 320 || yy < 0 || yy > 200) {
					star.z = MAX_Z;
					star.x = Math.random() * MAX_X;
					star.y = Math.random() * MAX_X;
					continue;
				}
				gray = Math.floor((MAX_Z - star.z) / MAX_Z * 255);
				this.starlayer.fillStyle("rgb(" + gray + "," + gray + "," + gray + ")").fillRect(xx, yy, 1, 1).globalAlpha(1);;
			}
			this.fb.blend(this.starlayer, "screen", 1);
		},

		drawPanel: function () {
			this.fb.drawImage(this.images.panel, 79, 35);
			this.centertext(this.fb, this.panel.title, 158, 51);

			switch (this.panel.type) {
				case "multiswitch":
					for (var i in this.panel.switches) {
						var sw = this.panel.switches[i];
						this.centertext(this.fb, sw.name, sw.x + Math.floor(sw.img[0].width / 2), sw.y - 10, this.font2);
						this.fb.drawImage(sw.img[sw.value], sw.x, sw.y);
					}
					break;
				case "gauge":
					for (var i in this.panel.switches) {
						var sw = this.panel.switches[i];
						this.centertext(this.fb, sw.name, sw.x + Math.floor(this.images.gauge.width / 2), sw.y - 10, this.font2);
						this.fb.fillStyle("#030f23").fillRect(sw.x, sw.y, this.images.gauge.width, 100);
						this.fb.fillStyle(BLUE).fillRect(sw.x - 2, sw.y, 1, 100);
						this.fb.drawRegion(this.images.gauge, [0, 100 - sw.value, this.images.gauge.width, sw.value], sw.x, sw.y + 100 - sw.value);
						this.led.drawImage(this.images.gaugegoal, sw.x + this.images.gauge.width + 1, sw.y + 100 - sw.goal - 2);
						this.centertext(this.fb, "" + sw.value, sw.x + Math.floor(this.images.gauge.width / 2), sw.y + 90, this.font2);

					}
					break;
			}
		},

		panelDone: function () {
			this.panel.state = STATE_COMPLETED;
			this.panel.enabled = false;
			if (this.panel.func) this.panel.func(this.panel);
			this.playSound("good");
			this.panel = null;
		},

		mousedown: function (ev) {
			if (this.gameover) return;

			var mx = Math.floor(ev.x / 3), my = Math.floor(ev.y / 3);
			if (this.panel && mouseHit(90, 46, 143, 137, ev.x / 3, ev.y / 3)) {
				for (var i in this.panel.switches) {
					var sw = this.panel.switches[i];
					if (mouseHit(sw.x, sw.y, sw.img[0].width, sw.img[0].height, mx, my)) {
						switch (this.panel.type) {
							case "multiswitch":
								this.playSound("click1");
								sw.value = sw.value == 1 ? 0 : 1;
								this.panel.value += sw.value ? 1 : -1;
								if (this.panel.value == this.panel.switches.length) {
									//panel completed
									this.panelDone();
									return;
								}
								break;
							case "gauge":
								this.dragging = sw;
								break;
						}
					}
				}
				return;
			}
			if (this.activebutton && this.activebutton.button.enabled) {
				var but = this.activebutton.button;
				this.playSound("click0");
				switch (but.type) {
					case "switch": but.state = STATE_ON; but.enabled = false; if (but.func) but.func(but); break;
					case "multiswitch":
					case "gauge": but.state = but.state == STATE_OFF ? STATE_ON : STATE_OFF; this.panel = but; break;
				}
			}
			else if (this.activebutton && !this.activebutton.button.enabled) {
				this.playSound("nope");
			}
			else if (this.panel) {
				this.panel.state = STATE_OFF;
				this.panel = null;
			}
		},

		mouseup: function (ev) {
			var mx = Math.floor(ev.x / 3), my = Math.floor(ev.y / 3);

			if (this.panel && this.panel.type == "gauge" && this.dragging) {
				this.panel.value = 0;
				for (var i in this.panel.switches) if (Math.abs(this.panel.switches[i].value - this.panel.switches[i].goal) < 2) this.panel.value++;
				if (this.panel.value == this.panel.switches.length) {
					this.panelDone();
					return;
				}

			}

			this.dragging = null;

			//	console.log(Math.floor(ev.x/3)+", "+Math.floor(ev.y/3));

		},

		mousemove: function (ev) {
			var mx = Math.floor(ev.x / 3), my = Math.floor(ev.y / 3);
			if (this.panel && mouseHit(90, 46, 143, 137, mx, my)) {

				if (this.panel.type == "gauge" && this.dragging) {
					this.dragging.value = Math.min(100, Math.max(0, (this.dragging.y + 100) - my));
				}

				return;
			}
			for (var i in this.buttons) {
				var but = this.buttons[i];
				if (mouseHit(but.x, but.y, but.img[0].width, but.img[0].height, mx, my)) {
					//create tooltip
					var width = this.textLength(but.title, this.font2) + 3;
					this.activebutton = {
						button: but,
						x: but.x,
						y: but.y + 10,
						fb: cq(width, 10).clear("#000")
					};
					this.text(this.activebutton.fb, but.title, 2, 1, this.font2);
					this.container.style.cursor = "pointer";
					return;
				}
			}
			this.container.style.cursor = "auto";
			this.activebutton = null;
		},
		/*
		keydown: function(ev) {
		//	console.log("key ",ev);
		//	this.keyboard["a"]
		
		
			switch(ev.key){
		//		case "down": this.dpitch+= 0.1; if (this.dpitch>10) this.dpitch=10;  break;
		//		case "up": this.dpitch+= -0.1; if (this.dpitch<-10) this.dpitch=-10; break;
				case "s": this.say(this.led, "HOLA!"); this.playSound("radio"); break;
				case "1": this.setState(1); break;
				case "2": this.setState(2); break;
				case "3": this.setState(3); break;
				case "4": this.setState(4); break;
				case "0": this.buttons[8].enabled= true; break;
			}
		},
		
		keyup: function(ev) {
		
		},
		*/
		setState: function (s) {
			this.state = s;
			if (s > 2 && s < 5) this.t = 0;
			this.statestart = this.t;
			this.statetime = 0;
			if (this.state > 3) this.shutup();
		},



		//button functions
		poweron: function (b) {
			this.setState(1);
			this.shutup();
			this.addsay("main power switched on!");
			this.addsay(">> check systems");

		},

		systemschecked: function (b) {
			this.shutup();
			this.addsay("systems checked!");
			this.addsay(">> rotate service structure");
			this.buttons[2].enabled = true;
		},

		servicestructure: function (b) {
			this.shutup();
			this.addsay("service structure in position!");
			this.addsay(">> activate inertial measurement units");
			this.buttons[3].enabled = true;
		},

		inertialmeasurement: function (b) {
			this.shutup();
			this.addsay("inertial measurement units ready!");
			this.addsay(">> activate communications system");
			this.buttons[4].enabled = true;
		},


		commsystem: function (b) {
			this.shutup();
			this.addsay("communications system connected!");
			//sonidos
			this.addsay(" ");
			this.addsay(">> captain, lets voice check with launch control");
			this.buttons[5].enabled = true;
		},

		radiook: function (b) {
			if (this.state == 4) {
				this.shutup();
				this.playSound("radio");
				this.addsay(" ");
				this.addsay("oh man, lets relax and enjoy the view..");
				this.tasksfinished = true;
			}
			else {
				this.shutup();
				this.playSound("radio");
				this.addsay(" ");
				this.addsay("ok launch control, we are almost ready :)");
				this.addsay(" ");
				this.addsay(" ");
				this.addsay(" ");
				this.addsay(">> load cryogenic propellants");
				this.buttons[6].enabled = true;
			}
		},


		propellants: function (b) {
			this.shutup();
			this.addsay("O2 and H2 tanks loaded!");
			this.addsay(" ");
			this.addsay(" ");
			this.addsay(" ");
			this.addsay(">> close cabin vent valves");
			this.buttons[7].enabled = true;
		},
		ventvalves: function (b) {
			this.shutup();
			this.addsay("done. ok, it is time, captain!!  and remember:");
			this.addsay("use up and down keys to keep pitch at 0 while flying");
			this.addsay(" ");
			this.addsay(" ");
			this.addsay(">> start main engine when countdown reaches 0");
			setTimeout(function () {
				this.sound_preignition = this.playSound("preignition", true);
				this.sound.setPlaybackRate(this.sound_preignition, 0.1);
			}.bind(this), 10000);

			setTimeout(this.countdown.bind(this), 15000);
		},

		countdown: function () {
			this.setState(3);
			this.playSound("countdown");
			this.buttons[8].enabled = true;
		},

		enginestart: function () {
			if (this.state == 3 && this.statetime < 9)
				return this.gameOver("you started the engine too soon!");

			this.engineon = true;
			this.buttons[8].enabled = false;

			this.turbulence = 3;

			this.playSound("ignition");
			setTimeout(function () {
				this.sound_postignition = this.playSound("postignition", true);
			}.bind(this), 7000);

			this.stopSound(this.sound_preignition);

			this.addsay("yii-haa!");
		},

		spacesequence: function (b) {
			this.shutup();
			var msg1, msg2;
			switch (b.id) {
				case 9: msg1 = "separation of 1st stage confirmed!"; msg2 = ">> perform fairing jettison!"; break;
				case 10: msg1 = "fairing jettisoned!"; msg2 = ">> set orbit sequence parameters"; break;
				case 11: msg1 = "starting orbit sequence!"; msg2 = ">> 2nd stage separation"; break;
				case 12: msg1 = "separation of 2nd stage confirmed!"; msg2 = ">> perform skirt jettison!"; break;
				case 13: msg1 = "skirt jettisoned!"; msg2 = ">> well, lets chat with mission control"; break;
			}
			this.addsay(msg1);
			this.addsay(" ");
			this.addsay(" ");
			this.addsay(" ");
			this.addsay(msg2);
			if (b.id == 13) this.buttons[5].enabled = true;
			else this.buttons[b.id + 1].enabled = true;
		},





		alarm: function (setalarm) {
			if (setalarm === undefined) setalarm = true;
			if (setalarm && this.alert) return;
			if (!setalarm && this.alert) this.stopSound(this.sound_alarm);
			else if (setalarm && !this.alert) this.sound_alarm = this.playSound("alarm");

			this.alert = setalarm;
		},



		winGame: function (msg) {
			this.fb.drawImage(this.images.win, 0, 0);
			this.gameover = true;
			this.righttext(this.fb, "REFRESH BROWSER TO PLAY AGAIN", 310, 165, this.fonT2, "green");
			this.layer.scale(3, 3).drawImage(this.fb.canvas, 0, 0);
			this.stopSound(this.sound_alarm);
			this.stopSound(this.music);
			this.stopSound(this.sound_postignition);
			this.stopSound(this.sound_preignition);
		},

		gameOver: function (msg) {
			this.fb.drawImage(this.images.gameover, 0, 0);
			if (msg) this.centertext(this.fb, msg, 160, 116, this.font1, "red");
			this.righttext(this.fb, "REFRESH BROWSER TO RESTART", 310, 165, this.fonT2, "green");
			this.gameover = true;
			this.layer.scale(3, 3).drawImage(this.fb.canvas, 0, 0);
			this.stopSound(this.sound_alarm);
			this.stopSound(this.music);
			this.stopSound(this.sound_postignition);
			this.stopSound(this.sound_preignition);
		},

		scale: 3,
		width: 960,
		height: 600,
		smoothing: false,
		scaleToFit: true,
		preventKeyboardDefault: true,
		container: document.getElementById(cont)
	});
}

function mouseHit(x, y, w, h, mx, my) {
	if (x > mx) return false;
	if (y > my) return false;
	if (x + w < mx) return false;
	if (y + h < my) return false;
	return true;
}


