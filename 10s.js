var stage = new createjs.Stage("canvas");
stage.addEventListener("stagemousedown", handleMouseDown);

var CELL = 19.75;

var spriteData = {
    images: ["sprite.png"],
    frames: [
        [0, 0, 3 * CELL, 3 * CELL, 0, 0, 0],
        [0, 3 * CELL, 3 * CELL, 3 * CELL, 0, 0, 0],
        [0, 6 * CELL, 3 * CELL, 3 * CELL, 0, 0, 0],
        [0, 9 * CELL, 3 * CELL, 3 * CELL, 0, 0, 0],
        [0, 12 * CELL, 3 * CELL, 3 * CELL, 0, 0, 0],
        [0, 15 * CELL, 3 * CELL, 3 * CELL, 0, 0, 0],
        [0, 18 * CELL, 3 * CELL, 3 * CELL, 0, 0, 0],
        [0, 21 * CELL, 3 * CELL, 3 * CELL, 0, 0, 0],
        [0, 24 * CELL, 3 * CELL, 3 * CELL, 0, 0, 0],
        [0, 27 * CELL, 3 * CELL, 3 * CELL, 0, 0, 0],
        [0, 30 * CELL, 3 * CELL, 3 * CELL, 0, 0, 0],
        [0, 33 * CELL, 3 * CELL, 3 * CELL, 0, 0, 0],
        [0, 36 * CELL, 3 * CELL, 3 * CELL, 0, 0, 0],
        [0, 39 * CELL, 3 * CELL, 3 * CELL, 0, 0, 0],
        [0, 42 * CELL, 3 * CELL, 3 * CELL, 0, 0, 0]
    ],
    animations: {
        jump: [0, 14],
        fly: {frames: [0, 0, 1, 1, 13, 13, 14, 14]}
    }
};


var bg = new createjs.Shape();
bg.graphics.beginFill("#c9f6f3").drawRect(0, 0, 640, 400);
stage.addChild(bg);

var timer = new createjs.Shape();
timer.graphics.beginFill("#555").arc(25, 0, 25, 0, Math.PI, false);
timer.x = 295;
timer.y = 0;
timer.scaleX = 0;
timer.scaleY = 0;
timer.regX = 25;
stage.addChild(timer);

function animateTimer() {
    createjs.Tween.get(timer).
        to({scaleX: 1, scaleY: 1}, 300, createjs.Ease.quadInOut).
        to({scaleX: 0, scaleY: 0}, 9700, createjs.Ease.linear).
        call(onTimerComplete);
}
animateTimer();

var prevPlatTime = 0;
var lakePlatTimer = 1000;
var lakePlatList = new createjs.Container();
stage.addChild(lakePlatList);

var airPropList = new createjs.Container();
stage.addChild(airPropList);

function createLakePlat() {
    var container = new createjs.Container();
    lakePlatList.addChild(container);

    var lakePlat = new createjs.Shape();
    lakePlat.graphics.beginFill("#ff0000").drawRect(0, 0, CELL * 6, CELL * 4);
    container.x = 640;
    container.y = 50 + Math.random() * (400 - CELL * 4 - 50);

    createjs.Tween.get(container).
        to({x: -CELL * 6}, 5000, createjs.Ease.linear).
        call(onLakePlatComplete);

    container.addChild(lakePlat);
}

function createAirProp() {
    var airProp = new createjs.Shape();
    airProp.graphics.beginFill("#00ff00").drawRect(0, 0, CELL * 5, CELL * 5);
    airProp.x = 640;
    airProp.y = 50 + Math.random() * (400 - CELL * 5 - 50);
    createjs.Tween.get(airProp).
        to({x: -CELL * 5}, 5000, createjs.Ease.linear).
        call(onAirPropComplete);

    airPropList.addChild(airProp);
}

if (mode == 'lake') {
    createLakePlat();
}
else {
    createAirProp();
}

var spriteSheet = new createjs.SpriteSheet(spriteData);
var me = new createjs.BitmapAnimation(spriteSheet);
me.x = 100;
me.y = 100;
me.regX = CELL * 1.5;
me.regY = CELL * 1.5;
me.gotoAndPlay("fly");
stage.addChild(me);

stage.update();

var sceneNumber = 1;
var mode; // air, lake
updateMode();

var moving = false;
var platContainer;

function handleMouseDown(event) {
    if (moving) {
        return;
    }
    moving = true;
    if (mode == "air") {
        createjs.Tween.get(me).
            to({x: stage.mouseX, y: stage.mouseY}, 400, createjs.Ease.quadInOut).
            call(onAirComplete);
    }
    else {
        if (mode == "lake") {
            exitPlat();

            var yMed = Math.min(me.y, stage.mouseY) - 50;

            createjs.Tween.get(me).
                to({x: stage.mouseX}, 400, createjs.Ease.linear);

            createjs.Tween.get(me).
                to({y: yMed}, 200, createjs.Ease.circOut).
                to({y: stage.mouseY}, 200, createjs.Ease.circIn).
                call(onLakeComplete);

            me.gotoAndPlay("jump");
        }
    }
}

function exitPlat() {
    if (platContainer !== undefined) {
        var p = platContainer.localToGlobal(me.x, me.y);
        me.x = p.x;
        me.y = p.y;
        stage.addChild(me);
        platContainer = undefined;
    }
}

function collidePointWithRect(x, y, rx, ry, rw, rh) {
    return (rx < x) && (x < rx + rw) && (ry < y) && (y < ry + rh);
}

function detectCollisions() {
    for (i=0; i<airPropList.children.length; i++) {
        var prop = airPropList.children[i];
        if (collidePointWithRect(me.x, me.y, prop.x, prop.y, CELL * 5, CELL * 5)) {
            prop.graphics.beginFill("#ffff00").drawRect(0, 0, CELL * 5, CELL * 5);
        }
    }
}

createjs.Ticker.setFPS(24);
createjs.Ticker.addEventListener("tick", mainloop);

function mainloop(event) {
    stage.update();

    if (mode == "air") {
        detectCollisions();
    }

    if ((createjs.Ticker.getTime() - prevPlatTime) > lakePlatTimer) {
        prevPlatTime = createjs.Ticker.getTime();
        if (mode == "lake") {
            createLakePlat();
        }
        else {
            createAirProp();
        }
    }
}

function updateMode() {
    if (sceneNumber % 2 == 0) {
        mode = "lake";
        exitPlat();
        bg.graphics.beginFill("#89dbda").drawRect(0, 0, 640, 400);
    }
    else {
        mode = "air";
        exitPlat();
        bg.graphics.beginFill("#c9f6f3").drawRect(0, 0, 640, 400);
    }
}

function onTimerComplete() {
    sceneNumber += 1;
    updateMode();
    animateTimer();
}

function onAirComplete() {
    me.gotoAndPlay("fly");
    moving = false;
}

function onLakePlatComplete() {
    lakePlatList.removeChild(this);
}

function onAirPropComplete() {
    airPropList.removeChild(this);
}

function onLakeComplete() {
    me.gotoAndPlay("fly");
    moving = false;
    for (i=0; i<lakePlatList.children.length; i++) {
        var container = lakePlatList.children[i];
        // FIXME USE lakePlat.hitTest(me.x, me.y)
        if (collidePointWithRect(me.x, me.y, container.x, container.y, CELL * 6, CELL * 4)) {
            var lakePlat = container.children[0];
            lakePlat.graphics.beginFill("#ffff00").drawRect(0, 0, CELL * 6, CELL * 4);

            createjs.Tween.get(container).
                to({y: container.y + 20}, 100, createjs.Ease.quadInOut).
                to({y: container.y}, 300, createjs.Ease.quadInOut);

            createjs.Tween.removeTweens(me);
            var p = container.globalToLocal(me.x, me.y);
            me.x = p.x;
            me.y = p.y;
            container.addChild(me);
            platContainer = container;
            return;
        }
    }
}
