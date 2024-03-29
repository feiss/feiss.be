
var DEBUG = false;
var MODE = DEBUG ? Phaser.CANVAS : Phaser.AUTO; //canvas or auto
var randomurl = DEBUG ? "?r=" + rand(999999) : "";

var TS = 32;
var TS2 = 16;
var TX = 10;
var TY = 15;

var game;
var bg;
var spr;
var player;
var key;

var health;

var leveldata;
var walls;
var platforms;
var cannons;
var items;
var enemies;
var shoots;
var cannongroup;

var sound;

var lastlevel = 1;
var level = 1;
var numlevels = 9;

var audios = ["song02", "expl0", "laser0", "laser1", "laser2", "sparks1", "sparks0", "poly0", "laser", "laser3", "life"];

var glowspr, blueglowspr, redglowspr;

var lifebar;

function rungame() {
	game = new Phaser.Game(320, 480, MODE, "game");


	game.state.add("start", { preload: preload1, create: create1, update: update1 });
	game.state.add("game", { preload: preload, create: create, update: update, render: render });
	game.state.add("end", { preload: preload2, create: create2, update: update2 });
	game.state.start("start");
}


function preload1() {
	health = 100;
	game.load.image("start", "assets/start.jpg" + randomurl);
	game.load.image("preloadbar", "assets/preloadbar.png" + randomurl);
	game.load.image("endscreen", "assets/end.jpg" + randomurl);
}
var xkey;
function create1() {
	game.world.setBounds(0, 0, game.width, game.height);
	var sp = game.add.sprite(0, 0, "start");
	sp.alpha = 0;
	game.add.tween(sp).to({ alpha: 1 }, 2000).start();
	xkey = game.input.keyboard.addKey(Phaser.Keyboard.X);
}

function update1() {
	if (xkey.isDown) {
		game.state.start("game");
	}
}


function preload2() {
	game.sound.stopAll();
}
function create2() {
	game.world.setBounds(0, 0, game.width, game.height);
	var ends = game.add.sprite(0, 0, "endscreen");
	ends.alpha = 0;
	game.add.tween(ends).to({ alpha: 1 }, 2000).start();
}
function update2() {
}


function preload() {
	game.load.atlas("sprites", "assets/sprites.png" + randomurl, "assets/sprites.json" + randomurl);
	game.load.spritesheet("player", "assets/player.png" + randomurl, 64, 64);
	game.load.image("redglow", "assets/redglow.png" + randomurl);

	preloadBar = this.add.sprite(0, Math.floor(game.height / 2), "preloadbar");
	game.load.setPreloadSprite(preloadBar);

	for (var i = 1; i <= numlevels; i++)
		game.load.text("level" + i + "json", "assets/level" + i + ".json" + randomurl);

	for (var i in audios) game.load.audio(audios[i], "assets/" + audios[i] + ".mp3");

	game.stage.backgroundColor = 0x333333;
}


function create() {
	preloadBar.destroy();
	var json = JSON.parse(game.cache.getText("level" + level + "json"));

	game.world.setBounds(0, 0, game.width - 1, json.height * TS);

	sound = {};
	for (var i in audios) sound[audios[i]] = game.add.audio(audios[i]);

	sound.song02.play("", 0, 0.7, true);

	bg = game.add.sprite(0, 0, "sprites", "bg.png");
	bg.body = null;
	bg.fixedToCamera = true;

	platforms = game.add.group();

	cannongroup = game.add.group();

	player = game.add.sprite(-100, -100, "player");
	player.animations.add("stop", [0], 10, false);
	player.animations.add("walk", [0, 1, 2, 3, 4, 5, 6, 7], 20, true);
	player.animations.add("jump", [8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9], 10, false);
	player.shooting = player.animations.add("shoot", [12, 13, 14, 0], 20, false);
	player.animations.add("damage", [15, 0, 15, 0, 15, 0, 15, 0, 15, 0], 20, false);
	player.animations.play("shoot");
	player.anchor.setTo(0.5, 1);
	player.body.collideWorldBounds = false;
	player.body.gravity.y = 20;
	player.body.maxVelocity.x = 250;
	player.body.maxVelocity.y = 700;
	player.body.setSize(18, 28, 0, -4);
	player.jumping = 0;

	player.canshoot = true;

	glowspr = game.add.sprite(-300, -300, "sprites", "glow1.png");
	glowspr.anchor.setTo(0.5, 0.5);
	glowspr.alpha = 0;

	blueglowspr = game.add.sprite(-300, -300, "sprites", "blueglow.png");
	blueglowspr.anchor.setTo(0.5, 0.5);
	blueglowspr.alpha = 0;

	redglowspr = game.add.sprite(-300, -300, "redglow");
	redglowspr.anchor.setTo(0.5, 0.5);
	redglowspr.alpha = 0;

	items = game.add.group();
	enemies = game.add.group();

	generateLevel(json);

	player.x = leveldata.player.x;
	player.y = leveldata.player.y;

	walls = game.add.group();
	var wall = walls.create(-32, -300);
	wall.width = 32;
	wall.height = game.world.height + 600;
	wall.body.immovable = true;
	wall = walls.create(game.world.width, -300);
	wall.width = 32;
	wall.height = game.world.height + 600;
	wall.body.immovable = true;

	shoots = game.add.group();


	lifebar = game.add.sprite(0, 0, "sprites", "lifebar.png");
	lifebar.body = null;
	lifebar.fixedToCamera = true;
	playerChangeHealth(0);

	var overlay = game.add.sprite(0, 0, "sprites", "overlay.png");
	overlay.body = null;
	overlay.fixedToCamera = true;

	game.camera.follow(player);

	key = game.input.keyboard.createCursorKeys();
	key.shoot = game.input.keyboard.addKey(Phaser.Keyboard.X);
	key.nextLevel = game.input.keyboard.addKey(Phaser.Keyboard.O);
}

function nextLevel() {
	game.sound.stopAll();
	level++;
	if (level > numlevels) game.state.start("end");
	else game.state.start("game");
}

function restartLevel() {
	health = 100;
	game.sound.stopAll();
	game.state.start("game");
}


function update() {
	var i;
	game.physics.collide(player, platforms);
	game.physics.collide(player, walls);
	game.physics.overlap(player, items, playerItems, null, this);
	game.physics.overlap(player, enemies, playerEnemies, null, this);

	shoots.forEach(shootCheck);

	player.body.velocity.x *= 0.85;

	for (i in cannons) {
		if (cannons[i].spr.alive && game.time.time > cannons[i].ready) //shoot cannon
		{
			cannons[i].ready = game.time.time + cannons[i].loadtime;
			spawnFireFromCannon(i);
		}
	}

	anim = null;

	if (key.shoot.isDown && player.canshoot) {
		player.animations.play("shoot");
		player.canshoot = false;
		spawnPlayerShoot();
	}
	if (key.shoot.isUp) {
		player.canshoot = true;
	}

	if (key.down.isDown && player.body.touching.down) {
		if (player.y < game.world.height - TS)
			player.y += 8;
	}

	if (key.up.isDown && player.body.touching.down) {
		player.body.velocity.y = -400;
	}

	if (key.left.isDown) {
		player.body.velocity.x -= 50;
	}
	else if (key.right.isDown) {
		player.body.velocity.x += 50;
	}
	if (player.body.velocity.x < 0 && player.scale.x > 0) player.scale.x = -1;
	if (player.body.velocity.x > 0 && player.scale.x < 0) player.scale.x = 1;

	if (player.body.touching.down && anim != "jump") {
		if (Math.abs(player.body.velocity.x) < 5) anim = "stop";
		else anim = "walk";
	}
	else anim = "jump";

	if (player.shooting.isFinished) player.animations.play(anim);

	if (player.y > game.world.height) player.y = -player.height;

	if (key.nextLevel.isDown) nextLevel();
}


function playerItems(pl, item) {
	if (item.name == "exit") {
		nextLevel();
		sound.life.play();
		return;
	}
	item.animations.play("die", null, false, true);
	item.body = null;
	sound.life.play();
	playerChangeHealth(50);
	blueglow(item.x, item.y, 1);
}

function playerChangeHealth(h) {
	health += h;
	health = Math.min(100, Math.max(0, health))
	lifebar.scale.x = health / 100.0;
	if (health == 0) {
		game.sound.stopAll();
		restartLevel();
	}
}

function playerEnemies(pl, enemy) {
	switch (enemy.name) {
		case "fire":
			//enemy.animations.play("die", null, false, true);
			//enemy.body.immovable= true;
			explosion((enemy.x + pl.x) / 2, enemy.y, 10, true);
			enemy.destroy();
			sound.expl0.play();
			break;
		case "laser":
			explosion(pl.x, enemy.y, 4, true);
			break;
	}
	player.animations.play("damage", 20, true);
	playerChangeHealth(-enemy.health);
}

function shootCheck(shoot) {
	if (shoot.x <= TS2 || shoot.x >= game.world.width - TS2) {
		shoot.animations.play("die", null, false, true);
		if (shoot.x <= TS) shoot.x = 0; else shoot.x = game.world.width;
		if (shoot.body.velocity.x != 0) if (rand(2) == 1) sound.sparks0.play(); else sound.sparks1.play();
		game.physics.overlap(shoot, cannongroup, shootCannon);
		shoot.body.velocity.x = 0;
	}
}

function shootCannon(shoot, cannon) {
	if (shoot.body.velocity.x == 0) return;
	cannon.health -= shoot.health;
	sound.poly0.play();
	redglow(shoot.x, shoot.y, 1);
	if (cannon.health <= 0) {
		explosion(cannon.x, cannon.y, 50);
		if (cannon.name == "laser") cannon.laser.destroy();
		cannon.destroy();
		sound.expl0.play();
	}

}

function spawnPlayerShoot() {

	var shoot = shoots.create(player.x + player.scale.x * 30, player.y - 21, "sprites", "shoot.png");
	shoot.anchor.setTo(0.5, 0.5);
	shoot.body.setSize(TS2, TS2, 0, 0);
	shoot.scale.x = player.scale.x;
	shoot.body.velocity.x = player.scale.x > 0 ? 500 : -500;
	shoot.health = 5;
	shoot.outOfBoundsKill = true;
	shoot.animations.add("die", ["spark1.png", "spark2.png", "spark3.png", "spark4.png"], 25, false, false);
	shoot.animations.add("fly", ["shoot.png"], 10, false, false);

	glow(shoot.x, shoot.y, 0.8);

	sound.laser3.play();
}

function glow(px, py, alpha) {
	glowspr.x = px;
	glowspr.y = py;
	glowspr.alpha = alpha;
	game.add.tween(glowspr).to({ alpha: 0 }, 100).start();
}

function blueglow(px, py, alpha) {
	blueglowspr.x = px;
	blueglowspr.y = py;
	blueglowspr.alpha = alpha;
	game.add.tween(blueglowspr).to({ alpha: 0 }, 100).start();
}

function redglow(px, py, alpha) {
	redglowspr.x = px;
	redglowspr.y = py;
	redglowspr.alpha = alpha;
	game.add.tween(redglowspr).to({ alpha: 0 }, 100).start();
}

function explosion(px, py, size, red) {
	red = (red == undefined) ? "" : "red";
	var emitter = game.add.emitter(px, py, size);
	var imgs = size < 8 ? ["part1" + red + ".png"] : ["part0" + red + ".png", "part1" + red + ".png"];
	emitter.makeParticles("sprites", imgs, 100, false, false);
	emitter.gravity = 4;
	emitter.start(true, 2000, null, size);

}


function spawnFireFromCannon(i) {
	var laser = cannons[i].laser;
	if (laser && cannons[i].laseractive) {
		cannons[i].laseractive.animations.play("die", null, false, true);
		cannons[i].laseractive.body = null;
		cannons[i].laseractive = null;
		sound.laser.stop();
		return;
	}
	if (!cannons[i].spr.inCamera) return;

	var fire = enemies.create(cannons[i].x, cannons[i].y, "sprites", laser ? "laser1.png" : "fire0.png");
	fire.name = laser ? "laser" : "fire";

	if (laser) {
		cannons[i].spr.laser = fire;
		cannons[i].laseractive = fire;
		fire.body.setSize(game.world.width, 4, 0, 0);
		fire.anchor.setTo(0, 0.5);
		fire.health = 1;
		fire.outOfBoundsKill = false;
		//fire.animations.add("start", ["fire1.png","fire0.png","fire1.png","fire0.png"], 20, false, false);
		fire.animations.add("fly", ["laser1.png", "laser2.png"], 25, true, false);
		fire.animations.add("die", ["laser1.png"], 25, true, false);
		fire.animations.play("fly");
		sound.laser.play("", 0, 0.7);
	}
	else {
		fire.body.setSize(16, 8, 0, 2);
		fire.x += cannons[i].dir * TS2;
		fire.anchor.setTo(0.5, 0.5);
		fire.health = 20;
		fire.outOfBoundsKill = true;
		fire.animations.add("start", ["fire0.png", "fire1.png", "fire2.png", "fire3.png"], 15, false, false);
		fire.animations.add("fly", ["fire4.png", "fire3.png"], 15, true, false);
		fire.animations.add("die", ["fire0.png", "fire1.png"], 25, false, false);
		fire.body.velocity.x = cannons[i].dir * 100;
		fire.animations.play("start");
		fire.events.onAnimationComplete.add(function () { fire.animations.play("fly"); }, this);
		sound.laser1.play("", 0, 0.3);
	}
}


/////

function generateLevel(json) {
	var floor = json.layers[0];
	var objects = json.layers[1];
	leveldata = {};
	cannons = [];
	var plat = null;
	var t = 0;
	for (var y = 0; y < floor.height; y++)
		for (var x = 0; x < floor.width; x++, t++) {
			var idx = floor.data[t];
			if (idx > 10 && idx < 31) {
				idx -= 10;
				plat = platforms.create(x * TS, y * TS, "sprites", "platform" + idx + ".png");
				plat.type = idx;
				var sz = [0, 3, 4, 5, 10, 10];
				plat.body.setSize(plat.width - 8, plat.height - sz[idx], 4, sz[idx]);
				plat.body.allowCollision = { none: false, any: false, up: true, down: false, left: false, right: false };
				plat.body.immovable = true;
			}
			if (idx > 40 && idx <= 46 && plat) //platform movement
			{
				idx -= 40;
				switch (idx) {
					case 1: case 2: case 3:
						game.add.tween(plat).to({ y: plat.y - TS * idx }, 1000 * idx, Phaser.Easing.Linear.None, true, rand(1000), 9999, true);
						break;
					case 4: case 5: case 6:
						game.add.tween(plat).to({ x: plat.x + TS * (idx - 3) }, 1000 * (idx - 3), Phaser.Easing.Linear.None, true, rand(1000), 9999, true);
						break;
				}
			}
			if (objects.data[t]) {
				switch (objects.data[t]) {
					case 3: leveldata.player = { x: x * TS, y: y * TS - TS }; break; //player position
					//life
					case 4: var item = items.create(x * TS, y * TS + TS2, "sprites", "life00.png");
						item.startx = x * TS;
						item.starty = y * TS + TS2;
						item.body.immovable = true;
						item.anchor.setTo(0.5, 0.5);
						item.body.setSize(10, item.height, 0, 0);
						item.animations.add("still", ["life00.png"], 1, false, false);
						item.animations.add("die", ["life01.png", "life02.png", "life03.png"], 10, false, false);
						item.animations.play("still");
						game.add.tween(item).to({ y: item.y - 5 }, 500, Phaser.Easing.Sinusoidal.InOut, true, 0, 9999, true);
						break;
					case 5:
						var item = items.create(x * TS, y * TS + 2, "sprites", "exit.png");
						item.body.immovable = true;
						item.name = "exit";
						break;
					//canyons
					case 31:
					case 32:
						var rightcannon = objects.data[t] == 32;
						var can = cannongroup.create(x * TS + (rightcannon ? TS - 12 : 0), y * TS + 2, "sprites", !rightcannon ? "leftcannon1.png" : "rightcannon1.png");
						can.animations.add("alive", rightcannon ? ["rightcannon1.png", "rightcannon2.png"] : ["leftcannon1.png", "leftcannon2.png"], 10, true, false);
						can.animations.play("alive");
						can.body.setSize(can.width, 30, 0, -8);
						can.health = 15;
						//can.body= null;
						can.name = "cannon";
						can.body.immovable = true;
						cannons.push({ spr: can, x: can.x, y: can.y + can.height / 2, dir: rightcannon ? -1 : 1, laseractive: null, laser: false, ready: game.time.time + 5000 * 0 + rand(1000), loadtime: 3000 + rand(5000) });
						break;
					case 33: //laser
						var can = cannongroup.create(x * TS - 4, y * TS + 2, "sprites", "rightcannon1.png");
						can.animations.add("alive", ["rightcannon1.png", "rightcannon2.png"], 20, true, false);
						can.animations.play("alive");
						can.body.setSize(can.width, 30, 0, -8);
						can.body.immovable = true;
						can.health = 25;
						can.name = "laser";
						//can.body= null;
						cannons.push({ spr: can, x: 0, y: can.y + can.height / 2, dir: 1, laser: true, laseractive: null, ready: game.time.time + 5000 * 0 + rand(1000), loadtime: 1500 + rand(1000) });
						break;

				}

			}
		}
}

function debugItem(i) {
	if (i.body) game.debug.renderSpriteBody(i);
}

function render() {
	//	game.debug.renderText(anim, 10,10);
	//	game.debug.renderText(player.shooting.isFinished, 10,30);
	//   game.debug.renderSpriteBody(player);
	//	cannongroup.forEach(debugItem);
}


function rand(n) {
	return Math.floor(Math.random() * n);
}