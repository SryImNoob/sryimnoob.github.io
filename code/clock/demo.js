var Engine = Matter.Engine,
Render = Matter.Render,
World = Matter.World,
Bodies = Matter.Bodies;
Body = Matter.Body;

var timeFormatOptions = {
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  hour12: false,
  timeZone: 'America/Los_Angeles'
};

var timeFormat = new Intl.DateTimeFormat('en-GB', timeFormatOptions);

/*
var words = ["Hello", "World"];

var word_i = 0;
*/

var WIDTH = 1280, HEIGHT = 720;

var engine = Engine.create();
var world = engine.world;

var render = Render.create({
element: document.getElementById("demo"),
engine: engine,
options: {
width: WIDTH,
height: HEIGHT,
wireframes: false
}});

var grounds = createGround();
World.add(world, grounds);

var RADIUS = 8;

var stack = [];
var objs = null;
var oldObjs = [];
//oldObjs = createTimeBodies(Date.now());
//oldObjs = createStringBodies("HELLOWORLD");
setColor(oldObjs, 'blue');
//setRFA(oldObjs, 0.9, 0.01, 0.01);
World.add(world, oldObjs);

Render.run(render);

INTERVAL = 20;

TIME_WINDOW = 5000;

WAIT_TIME = 2000;

setInterval(gameLoop, INTERVAL);


total = 0;
lastUpdated = null;
function getDelta() {
	if(lastUpdated == null) {
		lastUpdated = +new Date();
		total = 0;
		return 0;
	}
	current = +new Date();
	delta = current - lastUpdated;
	total += delta;
	lastUpdated = current;
	return delta;
}


function init_world() {
	engine = Engine.create();
	world = engine.world;
	render.engine = engine;
	World.add(world, grounds);
	if(oldObjs) {
		World.add(world, oldObjs);
	}
}

function createStringBodies(s, isFlatten = true) {
	var bbox = computeBbox(s, RADIUS);
	var ret = createString(s, (WIDTH - bbox[0]) / 2, (HEIGHT - bbox[1]) / 2, RADIUS, 'red');
	if(isFlatten) {
		return ret.flat();
	}
	return ret;
}

var orangeIsStatic = false;
function createTimeBodies(date) {
	var s = timeFormat.format(date);
	//s = words[word_i]; word_i = (word_i + 1) % words.length;
	var ret = createStringBodies(s, false);
	//console.log(s, ret.length);
	setColor(ret[2], 'orange');
	setColor(ret[5], 'orange');
	if(Math.random() > 0.5 && prev_display_time != null) {
		var ps = timeFormat.format(prev_display_time);
		if(ps[0] == s[0] && ps[1] == s[1]) {
			setStatic(ret[0], true);
			setStatic(ret[1], true);
		}
		if(ps[3] == s[3] && ps[4] == s[4]) {
			setStatic(ret[3], true);
			setStatic(ret[4], true);
		}
		if(ps[6] == s[6] && ps[7] == s[7]) {
			setStatic(ret[7], true);
			setStatic(ret[7], true);
		}
	}
	if(orangeIsStatic) {
		setStatic(ret[2], true);
		setStatic(ret[5], true);
	}
	if(Math.random() > 0.5) {
		orangeIsStatic ^= true;
	}
	
	ret = ret.flat();
	randVelocity(ret);
	return ret;
}

var prev_display_time = null;

var display_time = null;

var reverseTime = false;

var TIME_FREEZE = 0;

var time_freeze_count = 0;

var TIME_OFFSET = TIME_WINDOW * 3 + TIME_FREEZE + 500;

function init() {
	reverseTime = false;
	prev_display_time = display_time;
	var current = new Date();
	display_time = new Date(current.getTime() + TIME_OFFSET);
	objs = createTimeBodies(display_time);
	setDensity(objs, 0.005);
	resetPosition(oldObjs);
	resetVelocity(oldObjs);
	World.add(world, objs);
	return display_time;
}

var waiting = 0;

var skip = false;

function gameLoop() {
	delta = getDelta();
	if(objs == null) {
		init();
		setStatic(objs, true);
		reverseTime = true;
		waiting = WAIT_TIME - 500;
	}
	if(reverseTime == false) {
		var copyObjs = _.cloneDeep(objs);
		stack.push(copyObjs);
		if(stack.length > TIME_WINDOW / INTERVAL) {
			reverseTime = true;
			time_freeze_count = 0;
		}
	} else {
		if(time_freeze_count < TIME_FREEZE) {
			setStatic(objs, true);
			setColor(objs, 'grey');
			time_freeze_count += delta;
			Engine.update(engine, delta);
			return;
		}
		if(stack.length > 0) {
			if(skip == false) {
				removeObjs(world, objs);
				objs = stack.pop();
				setStatic(objs, true);
				World.add(world, objs);
			}
			skip ^= true;
		} else {
			if(waiting > WAIT_TIME) {
				waiting = delta;
			} else {
				waiting += delta;
				/*
				if(Date.now() > display_time) {
					waiting += WAIT_TIME;
				}
				*/
				if(waiting > WAIT_TIME) {
					/*
					if(oldObjs != null) {
						removeObjs(world, oldObjs);
					}
					oldObjs = objs;
					setColor(oldObjs, 'blue');
					setStatic(oldObjs, false);
					*/
					//setRFA(oldObjs, 1.0, 0, 0);
					init_world();
					init();
					stack = [];
					var copyObjs = _.cloneDeep(objs);
					stack.push(copyObjs);
				}
			}
		}
	}
	Engine.update(engine, delta);
}

function randVelocity(objs) {
	var w = 20;
	for(let i = 0; i < objs.length; ++i) {
		Body.setVelocity(objs[i], {x: (Math.random() - 0.5) * w, y: (Math.random() - 0.5) * w});
	}
}

function createGround() {
	var K = 100;
	var ret = [
		Bodies.rectangle(WIDTH / 2    , HEIGHT + K / 2, WIDTH, K     ),
		Bodies.rectangle(WIDTH / 2    , - K / 2       , WIDTH, K     ),
		Bodies.rectangle(WIDTH + K / 2, HEIGHT / 2    , K,     HEIGHT),
		Bodies.rectangle(- K / 2      , HEIGHT / 2    , K,     HEIGHT)
		];
	for(var i = 0; i < ret.length; ++i) {
		ret[i].render.fillStyle = 'white';
		ret[i].restitution = 1.0;
		ret[i].friction = 0.0;
		ret[i].isStatic = true;
	}
	return ret;
}

function setStatic(objs, isStatic) {
	for (let i = 0; i < objs.length; ++i) {
		objs[i].isStatic = isStatic;
	}
}

function setColor(objs, color) {
	for (let i = 0; i < objs.length; ++i) {
		objs[i].render.fillStyle = color;
	}
}

function removeObjs(world, objs) {
	for (let i = 0; i < objs.length; ++i) {
		World.remove(world, objs[i]);
	}
}

function setRFA(objs, r, f, fa) {
	for(var i = 0; i < objs.length; ++i) {
		objs[i].restitution = r;
		objs[i].friction = f;
		objs[i].frictionAir = fa;
	}
}

function setDensity(objs, density) {
	for(var i = 0; i < objs.length; ++i) {
		Body.setDensity(objs[i], density);
	}
}

function resetPosition(objs) {
	for(var i = 0; i < objs.length; ++i) {
		Body.setPosition(objs[i], { 
			x: (objs[i].position.x % WIDTH + WIDTH) % WIDTH, 
			y: (objs[i].position.y % HEIGHT + HEIGHT) % HEIGHT });
	}
}

function resetVelocity(objs) {
	for(let i = 0; i < objs.length; ++i) {
		Body.setVelocity(objs[i], {x: 0, y: 0});
	}
}
