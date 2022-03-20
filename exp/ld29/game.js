
var DEBUG = true;
var MODE = DEBUG ? Phaser.CANVAS : Phaser.AUTO; //canvas or auto
var randomurl = DEBUG ? "?r=" + rand(999999) : "";

var game;
var bg;
var spr;
var player;
var key;

var audios = [];
var floor, city;
var screennum = 1;
var MAX_SCREEN = 10;

var fromprevscreen = true;
var prevposy = 0;
var prevvelocity;

var caveglow, stars;

var noise;

var end = false;

function rungame() {
	game = new Phaser.Game(400, 150, MODE, "game");

	game.state.add("game", { preload: preload, create: create, update: update, render: render, destroy: destroy });
	game.state.add("screen1", { create: screen1, update: update, render: render });
	game.state.start("game");
}

function preload() {
	game.load.atlas("sprites", "sprites.png" + randomurl, "sprites.json" + randomurl);

	for (var i in audios) game.load.audio(audios[i], "assets/" + audios[i] + ".mp3");
	game.stage.backgroundColor = 0x000000;
	game.stage.smoothed = false;
}

function create() {
	game.world.setBounds(0, 0, game.width + 30, game.height);

	game.physics.startSystem(Phaser.Physics.ARCADE);
	game.physics.arcade.gravity.y = 2000;

	pixelCanvas = document.getElementById("pixel");
	pixelContext = pixelCanvas.getContext("2d");
	Phaser.Canvas.setSmoothingEnabled(pixelContext, false);



	sound = {};
	for (var i in audios) sound[audios[i]] = game.add.audio(audios[i]);

	//sound.song02.play("",0,0.7,true);
	key = game.input.keyboard.createCursorKeys();
	key.talk = game.input.keyboard.addKey(Phaser.Keyboard.X);


	game.state.start("screen1");
}


function destroy() {
	//sound.song02.stop();

}

var ttt = 0;
function update() {
	var i;
	player.body.velocity.x *= 0.5;
	anim = "stop";

	if (caveglow.visible) caveglow.alpha = 0.8 + Math.sin(ttt / 4.4) * 0.1 + Math.cos(ttt / 3) * 0.1;
	if (stars.visible) stars.alpha = 0.2 + Math.random() * 0.2;

	ttt++;

	if (!end) {
		if (key.left.isDown) {
			player.body.velocity.x -= 100;
			if (!key.up.isDown) {
				if (player.y >= game.height - 10) player.body.velocity.y = -100;
				anim = "walk";
			}
		}
		else if (key.right.isDown) {
			player.body.velocity.x += 100;
			if (!key.up.isDown) {
				if (player.y >= game.height - 10) player.body.velocity.y = -100;
				anim = "walk";
			}
		}
		if (key.up.isDown) {
			if (player.body.velocity.y > -100) player.body.velocity.y -= 40;
			anim = "fly";
		}
		if (anim == "stop") {
			if (key.talk.isDown) {
				if (talkstep == 1) talking += 0.4;
				anim = "talk";
			}
			else talking = Math.max(0, talking - 1);
		}
		if (talking > 0 && talkstep == 1) talk_bird();
	}

	if (talkstep == 0 && dialogbird.alpha < 1 && dialogbird.alpha > 0.1) {
		dialogbird.alpha *= 0.95;
		dialogbird.y -= 0.2;
	}
	if (dialogbird.alpha <= 0.1) dialogbird.visible = false;

	if (player.body.velocity.x < 0 && player.scale.x > 0) player.scale.x = -1;
	if (player.body.velocity.x > 0 && player.scale.x < 0) player.scale.x = 1;


	if (player.y < game.height - 40) anim = "fly";

	/*	if (player.body.touching.down && anim!="jump"){
			if (Math.abs(player.body.velocity.x)<5) anim="stop";
			else anim="walk";
		}
		else anim="jump";
	*/
	player.animations.play(anim);

	if (screennum == 9) {
		if (player.x > 130 && dialogturn == 0 && dialog_i == 0) {
			talk_bear();
		}
	}
	if (screennum == 1) titles.alpha = 1 - player.x / game.width;

	if (player.x > game.width && screennum < MAX_SCREEN) {
		screennum++;
		changeScreen(1);
	}
	if (player.x < 11 && screennum > 1 && screennum < 9) {
		screennum--;
		changeScreen(-1);
	}
}


function rand(n) {
	return Math.floor(Math.random() * n);
}


function debugItem(i) {
	if (i.body) game.debug.body(i);
}

function render() {
	//game.debug.text(screennum, 10,20);
	//	game.debug.renderText(player.shooting.isFinished, 10,30);
	//   game.debug.renderSpriteBody(player);
	//	debugItem(player);

	pixelContext.drawImage(game.canvas, 0, 0, game.width, game.height, 0, 0, pixelCanvas.width, pixelCanvas.height);
}


var fire = null, bear;

function changeScreen(dir) {
	var cit = (Math.floor(screennum / 2) + 1);
	if (cit < 5) city.loadTexture("sprites", "city" + cit + ".png");
	city.visible = cit < 5;
	floor.loadTexture("sprites", "s" + Math.floor(screennum % 4 + 1) + ".png");
	player.x = dir > 0 ? 30 : game.width - 30;
	noise.alpha = (5 - screennum) / 5 * 0.3;
	if (screennum > 5) noise.visible = false;

	caveglow.visible = screennum >= 8;
	stars.visible = screennum < 9;
	//fire.visible= screennum==9;
	bear.visible = screennum == 9;
	titles.visible = screennum == 1;

	switch (screennum) {
		case 8:
			if (dir < 0) bg.loadTexture("sprites", "sky.png");
			floor.loadTexture("sprites", "cave_entry.png");
			caveglow.loadTexture("sprites", "cave_entry_glow.png");
			break;
		case 9: bg.loadTexture("sprites", "cave1.png");
			//fire.start(false, 5000, 20);
			bear.animations.play("stop");
			player.body.velocity.x = 0;
			caveglow.loadTexture("sprites", "glowfire.png");
			break;
		case 10:
			break;
	}
}


var beartext = new Array(
	"Hi, my friend. I was waiting for you.",
	"I knew you were coming, the frog told me.",
	"The frog you talked with ten minutes ago.",
	"Oh, I see. I think the programmer did not have time to add the frog.",
	"Never mind. Here, have a nice cup of tea.",
	"Are you coming from the West?",
	"Oh, I see. So It is in the West too..",
	"It"s the noise humans do, in every frecuency and every possible sense.",
"You can stay here with me, if you want.",
	"Magdalene. Yours?",
	"Knitting. It relaxes me."
	);
var birdtext = new Array(
	"???????",
	"...Which frog?",
	"Sorry, I don"t remember any frog..",
	"Programmer?",
	"Thank you, I"m really tired...I was traveling for eight days and nights without rest",
"Yes. At home, The Noise is too strong..",
	"The Noise? Yes, very intense.. What the *** is it??",
	"That makes sense. It"s terrible, so strong and savage..",
"Thank you very much, bear. What is your name?",
	"Lucius, nice to meet you. What are you doing?",
	"  Oh."
	);

var dialog, dialogbird;
var dialog_pos = 0;
var dialog_interval = 0;

var talking = 0;
var dialog_i = 0;

var talkstep = 0;
var dialogturn = 0;

function talk_bear() {
	if (dialog_interval || dialogturn !== 0) return;
	dialog_pos = 0;
	dialog_interval = setInterval(talk_bear_i, 60);
	bear.animations.play("talk");
	dialog.text = "";
	dialog.visible = true;
	console.log(dialog_i)
}

function talk_bear_i() {
	dialog.text = beartext[dialog_i].substr(0, dialog_pos);
	dialog_pos++;
	if (dialog_pos > beartext[dialog_i].length) {
		clearInterval(dialog_interval);
		bear.animations.play("stop");
		talkstep = 1;
		dialogbird.text = "";
		dialogbird.alpha = 1;
		dialogbird.visible = true;
		dialog_interval = 0;
		dialogturn = 1;
		dialogbird.y = 110;
	}
}

function talk_bird() {
	dialog.visible = false;
	dialogbird.text = birdtext[dialog_i].substr(0, Math.floor(talking));
	if (talking > birdtext[dialog_i].length) {
		dialog_i++;
		talking = -1;
		talkstep = 0;
		dialogbird.alpha = 0.99;
		dialogturn = 0;
		if (dialog_i >= birdtext.length) {
			end = true;
			dialogbird.alpha = 1;
			dialog.visible = false;
			game.add.text(150, 60, "THE END", { font: "bold 16pt arial", fill: "#0d0a07" });
		}
		else talk_bear();
	}
}

var titles;


function screen1() {
	bg = game.add.sprite(0, 0, "sprites", "sky.png");
	city = game.add.sprite(0, 0, "sprites", "city1.png");
	stars = game.add.sprite(0, 0, "sprites", "stars.png");
	noise = game.add.sprite(0, 0, "sprites", "noise1.png");
	noise.animations.add("still", ["noise1.png", "noise2.png", "noise3.png", "noise4.png"], 30, true);
	noise.animations.play("still");
	noise.alpha = 0.3;
	/*
		fire = game.add.emitter(213, 137-40, 20);
		fire.makeParticles("sprites", ["fire1.png","fire2.png","fire3.png","fire4.png",]);
		fire.minParticleSpeed.setTo(-400, -400);
		fire.maxParticleSpeed.setTo(400, -100);
		fire.gravity= -100;
		fire.visible= false;
	*/
	bear = game.add.sprite(0, 0, "sprites", "bear1.png");
	bear.animations.add("stop", ["bear1.png", "bear2.png"], 2, true);
	bear.animations.add("talk", ["bear_talk1.png", "bear_talk1.png", "bear_talk1.png", "bear_talk1.png", "bear_talk1.png", "bear_talk1.png", "bear_talk2.png", "bear_talk1.png", "bear_talk2.png", "bear_talk1.png", "bear_talk2.png", "bear_talk1.png", "bear_talk2.png", "bear_talk1.png", "bear_talk2.png"], 10, true);
	bear.visible = false;

	floor = game.add.sprite(0, 0, "sprites", "s1.png");



	var x = 30;
	var y = game.height - 20;

	player = game.add.sprite(x, y, "sprites", "bird.png");
	game.physics.enable(player, Phaser.Physics.ARCADE);
	player.anchor.setTo(0.5, 1);
	player.body.setSize(20, 50, 0, 6);
	player.body.velocity.x = 400;

	player.body.collideWorldBounds = true;
	//player.body.maxVelocity.x= 250;
	//player.body.maxVelocity.y= 400;
	player.animations.add("stop", ["bird.png"], 10, false);
	player.animations.add("walk", ["bird_walk2.png", "bird_walk1.png"], 30, false);
	player.animations.add("talk", ["bird_talk1.png", "bird_talk2.png", "bird_talk3.png", "bird_talk2.png", "bird_talk3.png", "bird_talk2.png", "bird_talk3.png", "bird_talk2.png", "bird_talk3.png", "bird_talk2.png", "bird_talk2.png", "bird_talk1.png"], 10, true);
	player.animations.add("fly", ["bird_fly1.png", "bird_fly2.png", "bird_fly3.png", "bird_fly4.png", "bird_fly5.png", "bird_fly6.png", "bird_fly7.png"], 60, true);

	caveglow = game.add.sprite(0, 0, "sprites", "cave_entry_glow.png");
	caveglow.visible = false;

	dialog = game.add.text(20, 16, "", {
		font: "bold 10pt arial",
		fill: "#a68838",
		wordWrap: true,
		wordWrapWidth: 360
	});
	dialogbird = game.add.text(20, 110, "", {
		font: "8pt arial",
		fill: "#c59f44",
		wordWrap: true,
		wordWrapWidth: 360
	});

	titles = game.add.text(85, 60, "BENEATH THE CAVE", { font: "18pt arial", fill: "#0d0a07" });
}
