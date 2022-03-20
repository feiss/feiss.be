PURPLE = "#942268";
YELLOW = "#ffd0c0";
BLUE = "#0d90ab";
DARKBLUE = "#084363";

var app = new PLAYGROUND.Application({

	smoothing: false,
	width: 320,
	height: 200,
	scale: 2,
	preferedAudioFormat: "mp3",
	transitions: 3,
	//preventKeyboardDefault: true,
	playMusic: function (m, vol, loop) {
		if (this.ost) this.ost.stop(); this.ost = null;
		this.ost = this.music.play(m, loop === undefined ? false : loop);
		this.music.setPlaybackRate(this.ost, 1 + (round + 1) / 8);
		this.music.setVolume(this.ost, vol === undefined ? 1 : vol)
	},
	create: function () {
		this.ost = null;
		this.loadImage(
			"titlebg", "logo", "fontblue-e", "fontpurple-e", "monsteravatar",
			"academy", "over", "over2", "eye1", "eye2", "eye3", "mouth1",
			"mgintromonster", "mgintroback", "arm", "mgintroeyes",
			"mgintroball0", "mgintroball1", "mgintroball2", "mgintroball3",

			"finger1", "finger2", "bug0", "bug1", "bug2", "bug3", "splot0", "splot1", "splot2", "fingerhit",

			"bite1", "bite2", "bite3", "bite4", "bite5", "neck1", "neckblood",

			"eraser", "erasefoto", "steal",

			//		"singmouth","singeyes", "singbody", "singarm",

			"mshoot1", "aim", "expl1", "shootbg", "plane1", "plane2", "plane3"
		);


		this.loadSounds("chat-01", "chat-02", "chat-03", "chat-04", "chat-05", "chat-06",
			"click", "plof", "chof-01", "chof-02", "chof-00",
			"chupar",

			"bang1", "bang2", "bang3", "ok1",

			"intromusic", "mgintromusic", "playmusic", "outromusic");

	},
	ready: function () {
		this.setState(Intro);
	},
	render: function (dt) {
	}
});


Intro = {
	enter: function () {
		this.t = new Timer(this);
		this.layer = app.layer;

	},
	render: function (dt) {
		this.t.step(dt);
		var t = this.t.time;
		this.layer.clear("#ffd0c0");
		if (t > 1) this.layer.drawImage(app.images.monsteravatar, 10, 155 - app.ease(t - 1, "outElastic") * 100 - Math.sin(t * 20));
		if (t > 1 && t < 2) say(this.layer, "blue", "hello!!", 160, 70, t - 1);
		if (t > 2 && t < 5) say(this.layer, "blue", "me wants\n become\n  proper\n   monster!!", 130, 50, t - 2);
		if (t > 5) say(this.layer, "blue", "me goes to...", 130, 80, t - 5);
		if (t > 7) app.setState(Title);
		if (this.t.on([1, 2, 3, 4, 5])) app.sound.play("chat-0" + Math.floor(1 + Math.random() * 6));
	},
	pointerdown: function (ev) {
		//if (this.t.time>1) app.setState(Title);
	}
}

round = -1; //-1

Title = {
	enter: function () {
		this.t = 0;
		setPointer(true);
		round = -1;
		app.playMusic("intromusic");
		score = 0;
	},
	render: function (dt) {
		this.t += dt;
		var layer = this.app.layer;
		layer.drawImage(app.images.titlebg, 0, 0);
		if (this.t - 0.5) layer.drawImage(app.images.logo, 0, -100 + 130 * app.ease((this.t - 0.5), "outExpo") + Math.sin(10 + this.t * 4) * 4);
		if (this.t > 2) say(layer, "blue", "start", 166, 125, this.t - 2);
		//if (this.t>4) app.setState(GameIntro)
	},
	pointerdown: function (ev) {
		if (this.t < 2) return;
		app.sound.play("click");
		app.setState(GameIntro);
	}

};


GameIntro = {
	enter: function () {
		this.t = new Timer(this);
		setPointer(false);
		nextminigame = Smash;
		round++;
		this.msg = [
			[
				{ start: 2, end: 3, text: "me excited!", x: 140, y: 60 },
				{ start: 3, end: 5, text: "me wants be\n  *good*\n    monster!", x: 135, y: 38 },
				{ start: 5, end: 6, text: "ha, ha!", x: 160, y: 60 },
				{ start: 6, end: 10, text: "prepare *mouse*\n for lessons!", x: 132, y: 50 }
			],
			[
				{ start: 2, end: 3, text: "that was rad!", x: 140, y: 60 },
				{ start: 3, end: 4.5, text: "me wants\n continue!", x: 145, y: 70 },
				{ start: 4.5, end: 6.5, text: "prepared?\n now faster!", x: 150, y: 65 }

			],
			[
				{ start: 2, end: 3, text: "wow, intense!", x: 140, y: 60 },
				{ start: 3, end: 5, text: "each time\n faster!", x: 145, y: 65 },
				{ start: 5, end: 7, text: "*faster,\n  faster!\n    ha ha!*", x: 140, y: 50 }
			],
			[
				{ start: 2, end: 3, text: "oh man!\n  ha,ha", x: 140, y: 60 },
				{ start: 3, end: 5, text: "me no stop,\nyou stop?", x: 145, y: 65 },
				{ start: 5, end: 7, text: "of course\n  you *not*!", x: 140, y: 60 },
			],
			[
				{ start: 2, end: 3, text: "ha ha!", x: 150, y: 60 },
				{ start: 3, end: 5, text: "it was funny,\n me happy!", x: 145, y: 65 },
				{ start: 6, end: 7.5, text: "me want more!", x: 135, y: 63 },
				{ start: 7.5, end: 9, text: "...", x: 160, y: 70 },
				{ start: 9, end: 11, text: "but this is\n  the end...", x: 135, y: 60 },
				{ start: 11, end: 30, text: "*thanks for\n  playing!*\n\nyour\n score\n    *" + score, x: 140, y: 50 }
			]
		];
		if (round >= this.msg.length - 1) nextminigame = null;
		this.starts = [];
		for (var i = 0; i < this.msg[round].length; i++)
			this.starts.push(this.msg[round][i].start);
	},
	render: function (dt) {
		this.t.step(dt);
		var t = this.t.time;
		app.layer.drawImage(app.images.academy, 0, 0)

		app.layer.drawImage(app.images.monsteravatar, -130 + app.ease(t, "inOutExpo") * 150, 50);
		if (t > 1 && Math.random() < 0.07) app.layer.drawImage(app.images.mouth1, 20, 50);
		if (t > 1 && Math.random() < 0.01) app.layer.drawImage(app.images.eye2, 20, 50);
		app.layer.drawImage(app.images.over, 0, 0)

		for (var i = 0; i < this.msg[round].length; i++) {
			var m = this.msg[round][i];
			if (t > m.start && t < m.end) say(app.layer, "blue", m.text, m.x, m.y, t - m.start);
		}
		if (this.t.on(this.starts)) app.sound.play("chat-0" + Math.floor(1 + Math.random() * 6));

		if (t > this.msg[round][this.msg[round].length - 1].end) {
			if (nextminigame) app.setState(MiniGameIntro);
			else app.setState(Title);
		}
	},
	pointerdown: function (ev) {
		//if (this.t.time>2) app.setState(nextminigame?MiniGameIntro: Title);
	},
	keydown: function (ev) {
		if (ev.key == "escape") app.setState(Title);
	}
}



Particle = function (x, y, vx, vy) {
	this.ox = x;
	this.oy = y;
	this.x = x;
	this.y = y;
	this.vx = vx;
	this.vy = vy;
	this.reposition = true;
}
Particle.prototype = {
	step: function (dt) {
		this.x += dt * this.vx;
		this.y += dt * this.vy;
		if (this.reposition && (this.x < -100 || this.x > app.width || this.y < -100 || this.y > app.height)) {
			this.x = this.ox;
			this.y = this.oy;
		}
	}
}


intromsgindex = -1;
MGI_DURATION = 2;
MGO_DURATION = 3.5;

miniscore = 0, score = 0;

MiniGameIntro = {
	enter: function () {
		this.messages = [
			"let\"s do it!!!",
			"go, go, go!!!",
			"rock n roll!!",
			"here we go!!",
			"weeeeeee!!",
			"let\"s do this!!!"
		];
		setPointer(false);
		intromsgindex = (intromsgindex + 1) % this.messages.length;
		this.t = 0;
		this.sspp = [];
		this.NP = 50;
		var vel = 250;
		var p, a;
		for (var i = 0; i < this.NP; i++) {
			a = Math.random() * Math.PI * 2;
			p = (new Particle(app.center.x, app.center.y + 30, Math.floor(Math.cos(a) * vel), Math.floor(Math.sin(a) * vel)));
			p.size = rand(4);
			p.step(Math.random());
			this.sspp.push(p);
		}
		app.playMusic("mgintromusic");
	},
	step: function (dt) {
		for (var i = 0; i < this.NP; i++) this.sspp[i].step(dt);
	},
	render: function (dt) {
		this.t += dt;
		app.layer.clear(PURPLE);
		for (var i = 0; i < this.NP; i++)
			app.layer.drawImage(app.images["mgintroball" + this.sspp[i].size], this.sspp[i].x, this.sspp[i].y);

		app.layer
			.drawImage(app.images.mgintroback, 43, 8 + Math.cos(3 + this.t * 10) * 4)
			.stars(0, 5 + Math.sin(this.t * 30) * 5, 0, 0)
			.drawImage(app.images.mgintromonster, 105, 89)
			.restore()
			.stars(0, 5 + Math.sin(this.t * 30 - 0.5) * 7, 0, 0)
			.drawImage(app.images.mgintroeyes, 132, 94)
			.restore()
			.stars(200, 175, 0, 0.5, this.t * 10, 1)
			.drawImage(app.images.arm, 0, 0)
			.restore()
			.stars(115, 170, 0, 0.5, this.t * 9, 1)
			.drawImage(app.images.arm, 0, 0)
			.restore()
			.drawImage(app.images.over, 0, 0);

		app.layer.stars(app.center.x, 43 + Math.sin(this.t * 40) * 3, 0.5, 0.5, Math.sin(this.t * 10) * 0.2, 1.4);
		say(app.layer, "blue", this.messages[intromsgindex], -70, 0)
		app.layer.restore();

		if (this.t > MGI_DURATION - round * .2) app.setState(nextminigame)
	},
	leave: function () {
		app.playMusic("playmusic", 0.8, true);
	},
	pointerdown: function (ev) {
		//app.setState(nextminigame)
	},
	keydown: function (ev) {
		if (ev.key == "escape") app.setState(Title);
	}
}





MiniGameOutro = {
	enter: function () {

		score += miniscore;
		this.messages = [
			"me is disaster..",
			"me really bad...",
			"terrible!",
			"booohhh..",
			"me can do better!",
			"not bad!",
			"great!",
			"very good!",
			"awesome!!",
			"excellent!!",
			"perfect!!!!"
		];
		this.t = 0;
		this.sspp = [];
		this.NP = 50;
		var vel = 250;
		var p, a;
		for (var i = 0; i < this.NP; i++) {
			a = Math.random() * Math.PI * 2;
			p = (new Particle(app.center.x, app.center.y + 30, Math.floor(Math.cos(a) * vel), Math.floor(Math.sin(a) * vel)));
			p.size = rand(4);
			p.step(Math.random());
			this.sspp.push(p);
		}
		app.playMusic("outromusic");
		setPointer(false);
	},
	step: function (dt) {
		//		for (var i= 0; i< this.NP; i++) this.sspp[i].step(dt);
	},
	render: function (dt) {
		this.t += dt;
		app.layer.clear(DARKBLUE)

		app.layer
			.drawImage(app.images.mgintroback, 43, 5 + Math.cos(3 + this.t * 10) * 4)
			.drawImage(app.images.monsteravatar, app.width - 120 * app.ease(this.t * 0.5, "outExpo"), 94)
			.drawImage(app.images.over, 0, 0);

		sayc(app.layer, "purple", this.messages[miniscore], app.center.x, -20 + 60 * app.ease(this.t * 0.2, "outElastic"));
		if (this.t > .5) say(app.layer, "blue", "this lesson  " + miniscore + "\ntotal         " + score, 10, 120 + 100 * Math.max(0, app.ease((1 - (this.t - .5)), "inBounce")));

		if (this.t > MGO_DURATION - round * .5) {
			if (!nextminigame) app.setState(GameIntro);
			else app.setState(MiniGameIntro)
		}
	},
	pointerdown: function (ev) {
	},
	keydown: function (ev) {
		if (ev.key == "escape") app.setState(Title);
	}
}




Smash = {
	enter: function () {
		this.t = 0;
		nextminigame = Bite;
		this.smashing = 0;
		this.fingerx = this.fingery = 0;
		this.bugs = [];
		this.nbugs = 10 + round * 3;
		this.BUGVEL = 50;

		miniscore = 0;

		for (var i = 0; i < this.nbugs; i++) {
			var bug = new Particle(app.center.x + randc(app.width * .5), app.center.y + randc(app.height * .5), 0, 0);
			bug.alive = true;
			bug.reposition = false;
			bug.spr = rand(4);
			bug.w2 = Math.floor(app.images["bug" + bug.spr].width / 2);
			bug.h2 = Math.floor(app.images["bug" + bug.spr].height / 2);
			this.bugs.push(bug);
		}
	},
	step: function (dt) {
		if (this.smashing > 0) {
			this.smashing -= dt;
			if (this.smashing < 0) this.smashing = 0;
		}
		for (var i = 0; i < this.nbugs; i++) {
			if (!this.bugs[i].alive) continue;
			this.bugs[i].vx += randc(10 * (round * 3 + 1)) + 0.5;
			this.bugs[i].vy += randc(10 * (round * 3 + 1)) + 0.5;
			this.bugs[i].vx = saturate(this.bugs[i].vx, -this.BUGVEL, this.BUGVEL);
			this.bugs[i].vy = saturate(this.bugs[i].vy, -this.BUGVEL, this.BUGVEL);
			this.bugs[i].step(dt);
		}
	},
	render: function (dt) {
		this.t += dt;
		app.layer.clear(YELLOW);

		app.layer.stars(randc(this.smashing * 100), randc(this.smashing * 100));

		for (var i = 0; i < this.nbugs; i++) {
			if (this.bugs[i].alive)
				app.layer.drawImage(app.images["bug" + this.bugs[i].spr], this.bugs[i].x, this.bugs[i].y);
			else app.layer.drawImage(app.images["splot" + this.bugs[i].spr], this.bugs[i].x, this.bugs[i].y);
		}


		if (this.smashing) {
			app.layer.stars(this.fingerx, this.fingery, 0.5, 0.5, 0, 0.7 + this.smashing * 1.8).drawImage(app.images.fingerhit, 0, 0).restore();
			app.layer.drawImage(app.images.finger2, this.fingerx + 90, this.fingery - 140);
		}
		else app.layer.drawImage(app.images.finger1, this.fingerx + 90 + Math.sin(this.t * 25) * 5, this.fingery - 165 + Math.sin(5 + this.t * 20) * 5);


		app.layer.restore();


		if (this.t < 2) {
			app.layer.stars(app.center.x, app.center.y, 0.5, 0.5, 0, 1 + app.ease(this.t * 0.5, "outElastic"));
			sayc(app.layer, "purple", "smash!", 0, 0);
			app.layer.restore();
		}

		app.layer.stars(0, 0, 0, 0)
		app.layer.a(0.7).drawImage(app.images.over2, 0, 0).ra();
		say(app.layer, "purple", "" + miniscore + " smashed!", 5, 5 + Math.sin(this.t * 13) * 2)

		if (this.t > 5 - round) {
			miniscore = Math.floor(miniscore / this.nbugs * 10);
			app.setState(MiniGameOutro);
		}
	},
	pointermove: function (ev) {
		if (this.smashing) return;
		this.fingerx = ev.x;
		this.fingery = ev.y;
	},
	pointerdown: function (ev) {
		if (this.smashing > 0) return;
		this.smashing = .2;
		var smashed = false;
		for (var i = 0; i < this.nbugs; i++) {
			var b = this.bugs[i];
			if (!b.alive) continue;
			if (dist(ev.x, ev.y, b.x, b.y) < 10) {
				smashed = true;
				b.alive = false;
				b.spr = rand(3);
				miniscore++;
			}
		}
		app.sound.play(smashed ? "chof-0" + rand(3) : "click");
	},
	pointerup: function (ev) {
	},
	keydown: function (ev) {
		if (ev.key == "escape") app.setState(Title);
	}
};


Bite = {
	enter: function () {
		this.t = 0;
		nextminigame = Shoot;
		var w = app.width, h = app.height;
		this.necks = [
			[app.images.neck1, cq(w, h).scale(-1, 1).translate(-w, 0).drawImage(app.images.neck1, 0, 0).canvas],
			[app.images.neckblood, cq(w, h).scale(-1, 1).translate(-w, 0).drawImage(app.images.neckblood, 0, 0).canvas]
		];
		this.neck1 = app.images.neck1;
		this.neck2 = cq(w, h).scale(-1, 1).translate(-w, 0).drawImage(this.neck1, 0, 0).canvas;
		this.bites = [
			[app.images.bite1, app.images.bite2, app.images.bite3, app.images.bite4, app.images.bite5],
			[]
		];
		for (var i = 0; i < this.bites[0].length; i++)
			this.bites[1].push(cq(w, h).scale(-1, 1).translate(-w, 0).drawImage(this.bites[0][i], 0, 0).canvas);

		this.blood = [
			app.images.neckblood,
			cq(w, h).scale(-1, 1).translate(-w, 0).drawImage(app.images.neckblood, 0, 0).canvas
		];

		this.neck = rand(2);
		this.biteanim = [0, 1, 2, 3, 4, 4, 3, 2, 1, 0];
		this.failanim = [0, 1, 2, 2, 1, 0];
		this.anim = 0;
		this.animt = 0;

		this.looking = 0;
		this.neckt = 0;
		this.neckte = 0;
		this.neckcount = 0;

		miniscore = 0;
		setPointer(true);
	},
	step: function (dt) {
		this.t += dt;
		if (this.biting) {
			this.animt += dt;
			if (this.animt > 0.05) {
				this.animt = 0;
				this.anim++;
				var len = this.wellbite ? this.biteanim.length : this.failanim.length;
				if (this.anim == len) {
					this.biting = false;
					this.anim = 0;
				}
			}
		}
		var ani = this.wellbite ? this.biteanim[this.anim] : this.failanim[this.anim];
		if (ani < 3) this.neckt += dt * 0.5;
		if (this.neckt > 0.8) {
			this.neckt = 0.2;
			this.neck = rand(2);
			this.wellbite = false;
			this.neckcount++;
			if (this.neckcount >= 5 - round) {
				miniscore = Math.floor(miniscore / this.neckcount * 10);
				app.setState(MiniGameOutro);
			}
		}
		this.neckte = app.ease(this.neckt, "inOutQuad");


	},
	render: function (dt) {
		app.layer.clear(PURPLE);
		var ani = this.wellbite ? this.biteanim[this.anim] : this.failanim[this.anim];
		var neckpos = this.neck == 1 ?
			-app.width + Math.sin(this.neckte * Math.PI) * app.width :
			(1 - Math.sin(this.neckte * Math.PI)) * app.width;

		if (ani < 3) {
			var n = this.neckt > 0.55 && this.wellbite ? 1 : 0;
			app.layer.drawImage(this.bites[this.looking][ani], 0, 0);
			app.layer.drawImage(this.necks[n][this.neck], neckpos, 0);
		}
		else {
			app.layer.drawImage(this.necks[1][this.neck], neckpos * 0.5, 0)
				.drawImage(this.bites[this.neck][ani], 0, 0);
		}

		if (this.t < 2) {
			app.layer.stars(app.center.x + 40, app.center.y + 30, 0.5, 0.5, 0, 1 + app.ease(this.t * 0.5, "outElastic"));
			sayc(app.layer, "purple", "bi te!", 0, 0);
			app.layer.restore();
		}

		say(app.layer, "blue", "" + miniscore + " bites!", 5, 5 + Math.sin(this.t * 13) * 2)
	},
	pointermove: function (ev) {
		this.looking = ev.x < app.center.x ? 1 : 0;
	},
	pointerdown: function (ev) {
		if (this.biting) return;
		this.biting = true;
		this.wellbite = false;
		var nope = false;
		if (this.neck == 1 && ev.x > app.center.x) nope = true;
		else if (this.neck == 0 && ev.x <= app.center.x) nope = true;

		if (!nope && Math.abs(this.neckt - 0.5) < .08) {
			this.wellbite = true;
			miniscore++;
			app.sound.play("chupar");
		}
		else app.sound.play("chat-06")
	},
	keydown: function (ev) {
		if (ev.key == "escape") app.setState(Title);
	}
};


Shoot = {
	enter: function () {
		this.t = 0;
		nextminigame = Erase;
		this.px = this.handx = app.center.x;
		this.py = this.handy = app.center.y;
		this.handy = app.height;
		this.bugs = [], this.bullets = [];
		this.nbugs = 10;
		this.bugsappeared = 0;
		miniscore = 0;
		this.speed = round + 1;
		for (var i = 0; i < this.nbugs; i++) {
			var vx = (30 * this.speed + rand(30 * this.speed)) * (rand(2) ? -1 : 1);
			var bug = new Particle(vx > 0 ? -10 - rand(100) : app.width + 10 + rand(100), 20 + rand(app.height * .5), vx, randc(30));
			bug.alive = true;
			bug.reposition = false;
			bug.spr = app.images["plane" + (rand(3) + 1)];
			bug.w2 = Math.floor(app.images["bug3"].width / 2);
			bug.h2 = Math.floor(app.images["bug3"].height / 2);
			this.bugs.push(bug);
			this.bugsappeared++;
		}
		this.shake = 0;
		setPointer("none");
	},
	step: function (dt) {
		this.t += dt;
		for (var i = 0; i < this.nbugs; i++) {
			var bug = this.bugs[i];
			bug.step(dt);
			if ((bug.vx < 0 && bug.x < -bug.w2 * 2) || (bug.vx > 0 && bug.x > app.width) || bug.y < -50) {
				bug.vx = (30 * this.speed + rand(30 * this.speed)) * (rand(2) ? -1 : 1);
				bug.vy = randc(30);
				bug.alive = true;
				bug.ox = bug.vx > 0 ? -10 - rand(100) : app.width + 10 + rand(100);
				bug.oy = 20 + rand(app.height * .5);
				bug.x = bug.ox;
				bug.y = bug.oy;
				this.bugsappeared++;
			}
		}
		for (i = 0; i < this.bullets.length; i++) {
			var bullet = this.bullets[i];
			if (bullet.alive < 0) continue;
			if (bullet.alive < 1) {
				bullet.alive -= dt;
				continue;
			}
			bullet.step(dt);
			if (bullet.y < -10) bullet.alive = false;
			else if (bullet.y < 100) bullet.spr = app.images.mgintroball3;

			for (var j = 0; j < this.nbugs; j++) {
				var bug = this.bugs[j];
				if (!bug.alive) continue;
				if (dist(bullet.x, bullet.y, bug.x, bug.y) < 15) {
					bug.alive = false;
					miniscore++;
					bullet.alive = .1;
					bug.vx = bullet.vx * 0.4;
					bug.vy = bullet.vy * 2;
					bullet.vx = bullet.vy = 0;
					bullet.spr = app.images.expl1;
					app.sound.play("bang" + (rand(3) + 1));
					break;
				}
			}
		}
		this.shake = Math.max(0, this.shake - dt);

		if (this.bugsappeared >= 30) {
			miniscore = saturate(Math.floor(miniscore / (this.bugsappeared * 0.7) * 10), 0, 10);
			app.setState(MiniGameOutro);
		}
	},
	render: function (dt) {
		app.layer.clear(BLUE);
		app.layer.drawImage(app.images.shootbg, 0, 0)
		app.layer.stars(0, 0);
		for (var i = 0; i < this.nbugs; i++) {
			app.layer.drawImage(this.bugs[i].spr, this.bugs[i].x, this.bugs[i].y);
		}
		app.layer.stars(this.handx + rand(50) * this.shake, this.handy + rand(50) * this.shake, 0.5, 0.5, -Math.cos(this.px / app.width * Math.PI)).drawImage(app.images.mshoot1, 0, 0).restore();
		for (i = 0; i < this.bullets.length; i++) {
			if (this.bullets[i].alive < 0) continue;
			app.layer.drawImage(this.bullets[i].spr, this.bullets[i].x, this.bullets[i].y);
		}
		app.layer.drawImage(app.images.aim, this.px + rand(50) * this.shake + Math.sin(this.t * 10) * 10, this.py + rand(50) * this.shake + Math.cos(3 + this.t * 10) * 10);
		app.layer.restore().stars(0, 0, 0, 0);

		if (this.t < 2) {
			app.layer.stars(app.center.x, app.center.y, 0.5, 0.5, 0, 1 + app.ease(this.t * 0.5, "outElastic"));
			sayc(app.layer, "purple", "shoot!", 0, 0);
			app.layer.restore();
		}
		say(app.layer, "purple", "" + miniscore + " down!", 5, 5 + Math.sin(this.t * 13) * 2)
	},
	pointermove: function (ev) {
		this.px = ev.x;
		this.py = ev.y;
		this.handx = app.width - this.px;
		this.handy = app.height + Math.sin(this.px / app.width * Math.PI) * 20 - 10;
	},
	pointerdown: function (ev) {
		this.shake = .2;
		var ang = Math.atan2(this.handy - ev.y, ev.x - this.handx);
		var bullet = new Particle(this.handx, this.handy, Math.cos(ang) * 400, -Math.sin(ang) * 400)
		bullet.spr = app.images.mgintroball2;
		bullet.reposition = false;
		bullet.alive = 1;
		this.bullets.push(bullet);
		app.sound.play("click");
	},
	keydown: function (ev) {
		if (ev.key == "escape") app.setState(Title);
	}


};



Erase = {
	enter: function () {
		this.t = 0;
		nextminigame = Steal;
		this.px = app.width - app.images.eraser.width - 3;
		this.py = app.height - app.images.eraser.height - 3;
		this.lastx = this.lasty = undefined;
		miniscore = 0;
		this.drawing = false;
		setPointer("none");

		this.foto = cq(app.images.erasefoto.width, app.images.erasefoto.height).drawImage(app.images.erasefoto, 0, 0);
		this.foto.strokeStyle("#000").lineWidth(10 - round * 2).lineCap("round");
	},
	render: function (dt) {
		this.t += dt;
		app.layer.clear(YELLOW);
		app.layer.drawImage(this.foto.canvas, 54, 45)
		app.layer.stars(this.px, this.py, .1, .95).drawImage(app.images.eraser, 0, 0).restore().stars(0, 0, 0, 0);
		app.layer.drawImage(app.images.over, 0, 0);
		if (this.t < 2) {
			app.layer.stars(app.center.x, app.center.y, 0.5, 0.5, 0, 1 + app.ease(this.t * 0.5, "outElastic"));
			sayc(app.layer, "purple", "erase!", 0, 0);
			app.layer.restore();
		}
		//say(app.layer, "purple", ""+miniscore+" erase!", 5, 5+Math.sin(this.t*13)*2)

		if (this.t > 8 - round) {
			this.foto.resize(.5);
			var p, count = 0;
			for (var y = 0; y < this.foto.height; y++)
				for (var x = 0; x < this.foto.width; x++) {
					p = this.foto.getPixel(x, y);
					if (p[0] == 0 && p[1] == 0 && p[2] == 0) count++;
				}
			miniscore = saturate(Math.floor(count / (this.foto.height * this.foto.width) * 10), 0, 10);
			app.setState(MiniGameOutro);
		}
	},
	pointermove: function (ev) {
		this.lastx = this.px;
		this.lasty = this.py;
		this.px = ev.x;
		this.py = ev.y;
		if (this.drawing) {
			for (var i = 0; i < 20; i++)
				this.foto.strokeLine(this.lastx - 54, this.lasty - 45, this.px - 54, this.py - 45);
		}
	},
	pointerdown: function (ev) {
		this.drawing = true;
		this.lastx = ev.x;
		this.lasty = ev.y;
		app.sound.play("chat-0" + Math.floor(1 + Math.random() * 6));
	},
	pointerup: function (ev) {
		this.drawing = false;
		this.lastx = this.lasty = undefined;
	},
	keydown: function (ev) {
		if (ev.key == "escape") app.setState(Title);
	}


};



Steal = {
	enter: function () {
		this.t = 0;
		nextminigame = null;
		this.px = this.py = undefined;
		miniscore = 0;
		this.dragging = false;
		this.dragstartx = this.dragstarty = undefined;

		this.puzzlex = 54;
		this.puzzley = 45;

		var foto = app.images.steal;
		this.rows = round + 1;
		this.cols = round + 1;
		this.pieces = [];
		this.nosounds = ["chof-00", "chof-01", "chof-02"];
		this.pw = Math.floor(foto.width / this.cols);
		this.ph = Math.floor(foto.height / this.rows);
		var pw = this.pw;
		var ph = this.ph;
		for (var y = 0; y < this.rows; y++)
			for (var x = 0; x < this.cols; x++) {
				var piece = {
					spr: cq(pw, ph).drawRegion(foto, [pw * x, ph * y, pw, ph], 0, 0),
					x: rand(app.width - pw),
					y: rand(app.height - ph),
					goalx: this.puzzlex + x * pw,
					goaly: this.puzzley + y * ph,
					ok: false
				};
				this.pieces.push(piece);
			}
	},
	draw: function (p, t, i) {
		var x = p.x;
		var y = p.y;
		if (!p.ok) x = Math.floor(x + Math.sin(3 * i + t * 3 + round));
		if (!p.ok) y = Math.floor(y - Math.sin(2 * i + 2 + t * 15.5 + round * 2));
		var b = p == this.dragging ? 2 : 1;
		if (!p.ok) app.layer.fillStyle(p == this.dragging ? PURPLE : YELLOW).fillRect(x - b, y - b, this.pw + b * 2, this.ph + b * 2);
		app.layer.drawImage(p.spr.canvas, x, y);
	},
	render: function (dt) {
		this.t += dt;
		app.layer.clear(YELLOW);

		for (var i = 0; i < this.pieces.length; i++) {
			var p = this.pieces[i];
			if (p.ok) continue;
			app.layer.strokeStyle(BLUE).strokeRect(p.goalx + .5, p.goaly + .5, this.pw, this.ph);
		}

		for (var i = 0; i < this.pieces.length; i++) {
			if (this.pieces[i] != this.dragging) this.draw(this.pieces[i], this.t, i)
		}
		if (this.dragging) this.draw(this.dragging, this.t, i);


		if (this.t < 2) {
			app.layer.stars(app.center.x, app.center.y, 0.5, 0.5, 0, 1 + app.ease(this.t * 0.5, "outElastic"));
			sayc(app.layer, "purple", "justice!", 0, 0);
			app.layer.restore();
		}
		app.layer.drawImage(app.images.over, 0, 0);

		say(app.layer, "purple", "" + miniscore + " in position!", 5, 5 + Math.sin(this.t * 13) * 2)

		if (this.t > 10 - round || miniscore == this.pieces.length) {
			miniscore = saturate(Math.floor(miniscore / this.pieces.length * 10), 0, 10);
			app.setState(MiniGameOutro);
		}
	},
	pointermove: function (ev) {
		if (this.dragging) {
			this.dragging.x = ev.x - this.dragstartx;
			this.dragging.y = ev.y - this.dragstarty;
		}

		setPointer(false);

		for (var i = 0; i < this.pieces.length; i++) {
			var p = this.pieces[i];
			if (p.ok) continue;
			if (ev.x > p.x && ev.x < p.x + this.pw && ev.y > p.y && ev.y < p.y + this.ph) {
				setPointer(true);
				break;
			}
		}

	},
	pointerdown: function (ev) {
		for (var i = 0; i < this.pieces.length; i++) {
			var p = this.pieces[i];
			if (p.ok) continue;
			if (ev.x > p.x && ev.x < p.x + this.pw && ev.y > p.y && ev.y < p.y + this.ph) {
				this.dragging = p;
				this.dragstartx = ev.x - p.x;
				this.dragstarty = ev.y - p.y;
				app.sound.play("click");
				return;
			}
		}

	},
	pointerup: function (ev) {
		if (dist(this.dragging.x, this.dragging.y, this.dragging.goalx, this.dragging.goaly) < 15) {
			miniscore++;
			this.dragging.ok = true;
			this.dragging.x = this.dragging.goalx;
			this.dragging.y = this.dragging.goaly;
			app.sound.play("ok1");
		}
		else app.sound.play(this.nosounds[rand(this.nosounds.length)]);
		this.dragging = false;
	},
	keydown: function (ev) {
		if (ev.key == "escape") app.setState(Title);
	}


};



Sing = {
	enter: function () {
		this.t = 0;
		nextminigame = null;
		miniscore = 0;
		this.tickdone = 0;
		this.ticks = [];
		this.bars = [180, 180 + 40, 180 + 80];
		this.bw = 25;
		this.bpm = 220;

		this.goal = Math.floor(app.height - this.bw * 2.5);
		for (var x = 0; x < 50; x++) {
			this.ticks.push({ x: x % 2, y: this.goal - x * this.bpm, col: BLUE, vel: this.bpm });
			this.ticks.push({ x: 2, y: this.goal - x * this.bpm, col: YELLOW, vel: this.bpm * .5 });
		}

		app.music.play("playmusic", 1, true)

	},
	render: function (dt) {
		this.t += dt;
		app.layer.clear(PURPLE);

		var dance = Math.sin(this.t * 3) * 5;

		app.layer.drawImage(app.images.singbody, 30, 80 + dance)
			.stars(90, 125 + dance, 0.5, 0, 0, 1, 0.2 + Math.sin(this.t * 5) * 0.01)
			.drawImage(app.images.singmouth, 0, 0)
			.restore()
			.stars(131, 170 + dance, 0, 0.5, 1.7 + Math.sin(this.t * 4) * 0.1)
			.drawImage(app.images.singarm, 0, 0)
			.restore()
			.stars(55, 170 + dance, 0, 0.5, 1.7 - Math.sin(this.t * 4.2) * 0.1)
			.drawImage(app.images.singarm, 0, 0)
			.restore()
			.stars(0, 0, 0, 0).restore();

		app.layer.drawImage(app.images.singeyes, 58, 90 + Math.sin(this.t * 3 - 0.4) * 5);

		for (var i = 0; i < 3; i++) {
			app.layer.fillStyle(DARKBLUE).fillRect(this.bars[i], 0, this.bw, app.height);
		}

		for (i = 0; i < this.ticks.length; i++) {
			var p = this.ticks[i];
			if (p.y > -20) app.layer.fillStyle(p.col).fillRect(this.bars[p.x] + 1, p.y, this.bw - 2, this.bw);
			p.y += p.vel * dt;
		}

		app.layer.strokeStyle(YELLOW).strokeRect(this.bars[0] - 5.5, this.goal - .5, this.bw * 3 + 10 * 3 + 1 + 10, this.bw + 10)

		if (this.t < 2) {
			app.layer.stars(app.center.x, app.center.y, 0.5, 0.5, 0, 1 + app.ease(this.t * 0.5, "outElastic"));
			sayc(app.layer, "blue", "and si ng!", 0, 0);
			app.layer.restore();
		}

		say(app.layer, "blue", "" + miniscore + " notes!", 5, 5 + Math.sin(this.t * 13) * 2)

		if (this.t > 100 - round) {
			miniscore = saturate(Math.floor(miniscore / this.tickdone * 10), 0, 10);
			app.setState(MiniGameOutro);
		}
	},
	pointermove: function (ev) {
		setPointer(false);
		this.onbar = undefined;
		for (var i = 0; i < 3; i++)
			if (ev.x >= this.bars[i] && ev.x <= this.bars[i] + this.bw) {
				setPointer(true);
				this.onbar = i;
			}
	},
	pointerdown: function (ev) {
		if (this.onbar === undefined) return;
		app.sound.play("click")
	},
	keydown: function (ev) {
		if (ev.key == "escape") app.setState(Title);
	}


};




nextminigame = Smash;



Timer = function (st) {
	this.time = 0;
	this.state = st;
	this.table = {};
}
Timer.prototype = {
	step: function (dt) {
		this.time += dt;
	},
	on: function (t) {
		if (typeof (t) != "object") t = [t];
		for (var i = 0; i < t.length; i++) {
			if (this.time >= t[i])
				if (this.table[t[i]] === undefined) {
					this.table[t[i]] = true;
					return true;
				}
		}
		return false;
	}
};

fontsettings = [{ id: 97, x: 30, y: 63, width: 14, height: 16 }, { id: 98, x: 0, y: 62, width: 15, height: 14 }, { id: 99, x: 32, y: 30, width: 13, height: 13 }, { id: 100, x: 16, y: 63, width: 13, height: 13 }, { id: 101, x: 45, y: 77, width: 13, height: 14 }, { id: 102, x: 73, y: 45, width: 12, height: 14 }, { id: 103, x: 46, y: 46, width: 13, height: 14 }, { id: 104, x: 46, y: 15, width: 13, height: 14 }, { id: 105, x: 85, y: 60, width: 5, height: 14 }, { id: 106, x: 0, y: 77, width: 14, height: 14 }, { id: 107, x: 16, y: 47, width: 14, height: 15 }, { id: 108, x: 60, y: 0, width: 13, height: 14 }, { id: 109, x: 0, y: 31, width: 16, height: 15 }, { id: 110, x: 59, y: 78, width: 13, height: 15 }, { id: 111, x: 0, y: 16, width: 16, height: 14 }, { id: 112, x: 60, y: 15, width: 12, height: 15 }, { id: 113, x: 17, y: 16, width: 14, height: 15 }, { id: 114, x: 0, y: 47, width: 15, height: 14 }, { id: 115, x: 46, y: 30, width: 13, height: 15 }, { id: 116, x: 18, y: 0, width: 14, height: 13 }, { id: 117, x: 73, y: 30, width: 12, height: 14 }, { id: 118, x: 30, y: 80, width: 14, height: 13 }, { id: 119, x: 0, y: 0, width: 17, height: 15 }, { id: 120, x: 31, y: 47, width: 14, height: 13 }, { id: 121, x: 59, y: 61, width: 13, height: 16 }, { id: 122, x: 17, y: 32, width: 14, height: 14 }, { id: 48, x: 33, y: 0, width: 12, height: 12 }, { id: 49, x: 86, y: 15, width: 4, height: 13 }, { id: 50, x: 60, y: 31, width: 12, height: 12 }, { id: 51, x: 74, y: 0, width: 12, height: 14 }, { id: 52, x: 73, y: 60, width: 11, height: 14 }, { id: 53, x: 46, y: 0, width: 13, height: 14 }, { id: 54, x: 60, y: 44, width: 12, height: 14 }, { id: 55, x: 32, y: 14, width: 13, height: 15 }, { id: 56, x: 45, y: 61, width: 13, height: 15 }, { id: 57, x: 73, y: 15, width: 12, height: 14 }, { id: 46, x: 81, y: 84, width: 5, height: 5 }, { id: 44, x: 81, y: 75, width: 6, height: 8 }, { id: 63, x: 15, y: 77, width: 14, height: 19 }, { id: 33, x: 73, y: 75, width: 7, height: 19 }];

TEXTSPEED = 30;


function sayc(layer, font, t, x, y, time) {
	say(layer, font, t, x - Math.floor(t.length * 12.5 / 2), y, time);
}


function say(layer, font, t, x, y, time) {
	t = t.toLowerCase();
	var px = x;
	var py = y;

	if (time === undefined) time = 99999;

	for (var i = 0; i < Math.min(t.length, Math.floor(time * TEXTSPEED)); i++) {
		var offx = 0; offy = 0;
		var c = t.charAt(i);
		if (c == " ") { px += 10; continue; }
		if (c == "\n") {
			px = x; py += 20; continue;
		}
		if (c == "." || c == ",") { offx = 4; offy = 10; }
		if ("0123456789".indexOf(c) != -1) { offx = 2; }
		if (c == "*") { font = font == "blue" ? "purple" : "blue"; continue; }
		var l = null;
		for (var j = 0; j < fontsettings.length; j++) {
			if (fontsettings[j].id == t.charCodeAt(i)) l = fontsettings[j];
		}
		if (l) {
			if (time === 99999)
				layer.drawRegion(app.images["font" + font + "-e"], [l.x, l.y, l.width, l.height], px + offx, py + offy);
			else layer.drawRegion(app.images["font" + font + "-e"], [l.x, l.y, l.width, l.height], px + offx + Math.sin(i + time * 20), py + offy + Math.sin(1 + i + time * 20));
			px += l.width + offx;
		}

	}
}

function saturate(n, min, max) {
	return Math.min(max, Math.max(min, n));
}
function rand(n) {
	return Math.floor(Math.random() * n);
}
function randc(n) {
	return Math.floor((Math.random() - 0.5) * n);
}
function dist(x, y, xx, yy) {
	var dx = x - xx, dy = y - yy;
	return Math.sqrt(dx * dx + dy * dy);
}

function setPointer(h) {
	if (typeof (h) == "string") app.layer.canvas.style.cursor = h;
	else app.layer.canvas.style.cursor = h ? "pointer" : "auto";
}
