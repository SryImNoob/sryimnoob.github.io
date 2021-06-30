var Engine = Matter.Engine,
Events = Matter.Events,
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

var RADIUS = 10;

var stack = [];
var objs = null;
var oldObjs = [];
var prevObjs = [];
//oldObjs = createTimeBodies(Date.now());
//oldObjs = createStringBodies("HELLOWORLD");
setColor(oldObjs, 'blue');
//setRFA(oldObjs, 0.9, 0.01, 0.01);
World.add(world, oldObjs);

Render.run(render);

INTERVAL = 10;

TIME_WINDOW = 1000;

WAIT_TIME = 1000;

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
	var allStatic = true;
	if(Math.random() > 0.5 && prev_display_time != null) {
		var ps = timeFormat.format(prev_display_time);
		if(ps[0] == s[0] && ps[1] == s[1]) {
			setStatic(ret[0], true);
			setStatic(ret[1], true);
		} else {
			allStatic = false;
		}
		if(ps[3] == s[3] && ps[4] == s[4]) {
			setStatic(ret[3], true);
			setStatic(ret[4], true);
		} else {
			allStatic = false;
		}
		if(ps[6] == s[6] && ps[7] == s[7]) {
			setStatic(ret[6], true);
			setStatic(ret[7], true);
		} else {
			allStatic = false;
		}
	} else {
		allStatic = false;
	}
	if(orangeIsStatic && allStatic == false) {
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

var mode = 0;

var mode_0_time_window = TIME_WINDOW;

var mode_1_time_window = TIME_WINDOW * 3;

function init() {
	mode = Math.random() < 0.7 ? 0 : 1;
	if(mode == 1) {
		TIME_WINDOW = mode_1_time_window;
	} else {
		TIME_WINDOW = mode_0_time_window;
	}
	TIME_OFFSET = TIME_WINDOW * 3 + TIME_FREEZE + 500;
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
		/*
		for(var i = 0; i < objs.length; ++i) {
			if(objs[i].isStatic == false) {
				if(Math.random() > 0.9) {
					objs[i].isStatic = true;
				}
				break;
			}
		}
		*/
		if(mode == 1 && stack.length % 5 == 0) {
			var leftToRight = hashCode(timeFormat.format(display_time)) % 2;
			if(leftToRight) {
				for(var i = 0; i < objs.length; ++i) {
					if(objs[i].isStatic == false) continue;
					for(var j = i; j < objs.length; ++j) {
						if(objs[j].position.x != objs[i].position.x) break;
						objs[j].isStatic = false;
						objs[j].render.visible = true;
					}
					for(var j = 0; j < prevObjs.length; ++j) {
						if(prevObjs[j].position.x > objs[i].position.x && objs[objs.length - 1].render.visible == false) break;
						prevObjs[j].render.visible = false;
					}
					break;
				}
			} else {
				for(var i = objs.length - 1; i >= 0; --i) {
					if(objs[i].isStatic == false) continue;
					for(var j = i; j >= 0; --j) {
						if(objs[j].position.x != objs[i].position.x) break;
						objs[j].isStatic = false;
						objs[j].render.visible = true;
					}
					for(var j = prevObjs.length - 1; j >= 0; --j) {
						if(prevObjs[j].position.x < objs[i].position.x && objs[0].render.visible == false) break;
						prevObjs[j].render.visible = false;
					}
					break;
				}
			}
		}
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
		/*
		if(stack.length < 500 / INTERVAL) {
			prevObjs = [];
		}
		*/
		if(stack.length > 0) {
			if(skip == false) {
				removeObjs(world, objs);
				objs = stack.pop();
				setStatic(objs, true);
				setVisible(objs, true);
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
					prevObjs = objs;
					init_world();
					init();
					if(mode == 1) {
						setStatic(objs, true);
						setVisible(objs, false);
						setVisible(prevObjs, true);
					} else {
						setVisible(prevObjs, false);
					}
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

function setVisible(objs, visible) {
	for (let i = 0; i < objs.length; ++i) {
		objs[i].render.visible = visible;
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

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}


var statePlay = createString("PLAY", 10, 10, 5, 'green').flat();
var stateStop = createString("STOP", 10, 10, 5, 'red').flat();
var stateBack = createString("BACK TO FUTURE", 10, 10, 5, 'white').flat();

Events.on(render, "afterRender", function() {
    var ctx = render.context;
	var alpha = 0.2;
	
	if(reverseTime == false) {
		displayObjsWithVisable(ctx, prevObjs, RADIUS, alpha);
		displayObjs(ctx, statePlay, 5, alpha);
		displayTrack(ctx, stack, 'orange', 2, alpha);
	} else {
		if(stack.length > 0) {
			displayObjs(ctx, prevObjs, RADIUS, alpha * ((stack.length + (skip ? 0.5 : 0)) * INTERVAL / TIME_WINDOW));
			displayObjs(ctx, stateBack, 5, alpha);
			displayTrack(ctx, stack, 'orange', 2, alpha);
		} else {
			displayObjs(ctx, stateStop, 5, alpha);
		}
	}
});

function displayObjs(ctx, objs, radius, alpha) {
	ctx.globalAlpha = alpha;
	for(var i = 0; i < objs.length; ++i) {
		var point = objs[i].position;
        var color = objs[i].render.fillStyle;
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(point.x, point.y, radius, 0, Math.PI * 2, true);
        ctx.fill();
	}
	ctx.globalAlpha = 1;
}

function displayObjsWithVisable(ctx, objs, radius, alpha) {
	for(var i = 0; i < objs.length; ++i) {
		if(objs[i].render.visible) {
			ctx.globalAlpha = 1;
		}else {
			ctx.globalAlpha = alpha;
		}
		var point = objs[i].position;
        var color = objs[i].render.fillStyle;
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(point.x, point.y, radius, 0, Math.PI * 2, true);
        ctx.fill();
	}
	ctx.globalAlpha = 1;
}

function hashCode(str) {
    var hash = 0, i = 0, len = str.length;
    while ( i < len ) {
        hash  = ((hash << 5) - hash + str.charCodeAt(i++)) << 0;
    }
    return hash;
}

function displayTrack(ctx, stack, color, radius, alpha) {
	ctx.globalAlpha = alpha;
	var t = hashCode(timeFormat.format(display_time)) % 20;
	if(t >= 16) return;
	for(var i = 0; i < stack.length; ++i) {
		var k = 0;
		for(var j = 0; j < stack[i].length; ++j) {
			var c = stack[i][j].render.fillStyle;
			if(c != color) continue;
			if(k++ % 16 != t) { continue; }
			if(stack[i][j].isStatic) continue;
			var point = stack[i][j].position;
			ctx.fillStyle = c;
			ctx.beginPath();
			ctx.arc(point.x, point.y, radius, 0, Math.PI * 2, true);
			ctx.fill();
		}
	}
	ctx.globalAlpha = 1;
}

function range(n, reverse) {
	var ret = [];
	if(reverse) {
		for(var i = n - 1; i >= 0; --i) ret.push(i);
	} else {
		for(var i = 0; i < n; ++i) ret.push(i);
	}
	return ret;
}
