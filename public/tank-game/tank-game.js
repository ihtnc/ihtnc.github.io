/*
create a tank game where the player uses the tank to try and hit a target with a bullet
use the up and down keys to adjust the angle of the tank's cannon
use the left and right keys to adjust the power of the tank
use the space bar to fire a bullet
the tank has a configurable number of bullets to shoot the target with
the target is placed on random points in the screen every game
the game ends if the tank hits the target or if the tank runs out of bullets
the bullet is affected by gravity and air resistance
gravity and air resistance are configurable
*/

// create a tank object
var tank = {
  angle: 20,
  power: 10,
  bullets: 5,
  x: 0,
  y: 0,
  width: 100,
  height: 100
};

var tankBarrel = {
  x: 0,
  y: 0,
  rotationX: 0,
  rotationY: 0,
  offsetX: 3,
  offsetY: -8,
  width: 50,
  height: 25,
  degreeMultiplier: -1
}

// create a target object
var target = {
  x: 0,
  y: 0,
  originalX: 0,
  originalY: 0,
  width: 50,
  height: 50,
  movementRange: 100,
  movementSpeedMultiplier: 0.75,
  currentDirection: '',
  isHit: false
};

// create a bullet object
var bullet = {
  fired: false,
  stopped: true,
  x: 0,
  y: 0,
  velocityX: 0,
  velocityY: 0,
  offsetX: 5,
  offsetY: 0,
  width: 30,
  height: 10,
  frame: 0,
  speed: 0.10
};

var rank = {
  width: 20,
  height: 25,
  offsetX: -5,
  offsetY: 15
}

var trajectory = {
  lineWidthMultiplier: 0.333,
  length: 180,
  lineDash: [0, 60, 15, 10, 15, 10, 15, 10, 15, 10, 15, 10]
};

// create an object to handle delaying of renders
var delayCounter = {
  active: false,
  lifeTime: 0
}

// create an explosion object
var explosion = {
  width: 75,
  height: 75
};

// create a game object
var game = {
  score: 0,
  gravity: 3.75,
  airResistance: 0.095,
  powerMultiplier: 8,
  maxAngle: 70,
  minAngle: -15,
  maxPower: 20,
  minPower: 5,
  difficulty: 0,
  hitsPerDifficulty: 5,
  totalHits: 0,
  airResistanceModifier: 0.05,
  width: 0,
  height: 0,
  fps: 60
};

var controls = {
  width: 50,
  height: 50,
  padding: 10,
  currentCommand: '',
  powerUp: {
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0,
    sizeMultiplier: 1
  },
  powerDown: {
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0,
    sizeMultiplier: 1
  },
  angleUp: {
    x: 0,
    y: 0,
    offsetX: -10,
    offsetY: 20,
    sizeMultiplier: 1
  },
  angleDown: {
    x: 0,
    y: 0,
    offsetX: -10,
    offsetY: -20,
    sizeMultiplier: 1
  },
  fire: {
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0,
    sizeMultiplier: 1
  },
  shoot: {
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0,
    sizeMultiplier: 2
  }
};

// get the canvas element
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
var canvasPadding = 0;

// load resources
var tankImage = new Image();
tankImage.src = "./images/game/tank-no-barrel.svg";
var tankBarrelImage = new Image();
tankBarrelImage.src = "./images/game/tank-barrel.svg";
var targetImage = new Image();
targetImage.src = "./images/game/target.svg";
var bulletImage = new Image();
bulletImage.src = "./images/game/bullet.svg";
var explosionImage = new Image();
explosionImage.src = "./images/game/explosion.svg";
var arrowImage = new Image();
arrowImage.src = "./images/game/arrow.svg";
var shootImage = new Image();
shootImage.src = "./images/game/shoot.svg";
var rankImage = new Image();
rankImage.src = "./images/game/rank.svg";

// event listeners
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", cancelCommand);
document.addEventListener("pointerdown", handlePointerDown);
document.addEventListener("pointerup", cancelCommand);
document.addEventListener("pointerout", cancelCommand);
window.addEventListener("resize", handleResize);

// prevent context menu
canvas.addEventListener("contextmenu", function (e) {
  e.preventDefault();
}, false);

// Get the device pixel ratio
var dpr = window.devicePixelRatio || 1;

// initialise game
function init() {
  canvas.style.touchAction = "none";

  ctx.imageSmoothingEnabled = true;

  resize();
  initGame();
};

// resize game
function resize() {
  game.width = canvas.offsetWidth;
  game.height = canvas.offsetHeight;
  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = canvas.offsetHeight * dpr;

  ctx.scale(dpr, dpr);
}

// reset game
function initGame() {
  initTank();
  initBarrel();
  initTarget();
  initBullet();
  initControls();

  game.gravity = 3.75;
  game.airResistance = 0.095;
  game.difficulty = 0;
  game.score = 0;
  game.totalHits = 0;
}

// reset tank to initial state
function initTank() {
  tank.x = canvasPadding + controls.width + controls.padding;
  tank.y = game.height - controls.width + controls.padding - canvasPadding - tank.height;
  tank.bullets = 5;
}

function initBarrel() {
  tankBarrel.x = tank.x + tank.width - tankBarrel.width + tankBarrel.offsetX;
  tankBarrel.y = tank.y + tank.height / 2 - tankBarrel.height / 2 + tankBarrel.offsetY;
  tankBarrel.rotationX = tankBarrel.x;
  tankBarrel.rotationY = tankBarrel.y + tankBarrel.height / 2;
}

// move target's position
function initTarget() {
  var allowedArea = game.width * 0.6 - target.movementRange;
  var targetStartX = game.width - allowedArea - target.width - canvasPadding;
  var targetAllowedY = game.height - target.height - canvasPadding;
  target.x = targetStartX + Math.floor(Math.random() * (allowedArea)) + canvasPadding;
  target.y = Math.floor(Math.random() * (targetAllowedY)) + canvasPadding;
  target.originalX = target.x;
  target.originalY = target.y;
  target.isHit = false;
}

// reset bullet to initial state
function initBullet() {
  bullet.fired = false;
  bullet.stopped = true;
  bullet.frame = 0;

  relocateBullet();
  setInitialBulletVelocity();
}

// initialise the controls
function initControls() {
  controls.powerDown.x = tank.x - controls.width * controls.powerDown.sizeMultiplier - controls.padding + controls.powerDown.offsetX;
  controls.powerDown.y = tank.y + tank.height / 2 - controls.height * controls.powerDown.sizeMultiplier / 2 + controls.powerDown.offsetY;
  controls.powerUp.x = tank.x + tank.width + controls.padding + controls.powerUp.offsetX;
  controls.powerUp.y = tank.y + tank.height / 2 - controls.height * controls.powerUp.sizeMultiplier / 2 + controls.powerUp.offsetY;
  controls.angleUp.x = tank.x + tank.width / 2 - controls.width * controls.angleUp.sizeMultiplier / 2 + controls.angleUp.offsetX;
  controls.angleUp.y = tank.y - controls.height * controls.angleUp.sizeMultiplier - controls.padding + controls.angleUp.offsetY;
  controls.angleDown.x = tank.x + tank.width / 2 - controls.width * controls.angleDown.sizeMultiplier / 2 + controls.angleDown.offsetX;
  controls.angleDown.y = tank.y + tank.height + controls.padding + controls.angleDown.offsetY;
  controls.shoot.x = game.width - controls.width * controls.shoot.sizeMultiplier - canvasPadding - controls.width - controls.padding + controls.shoot.offsetX;
  controls.shoot.y = tank.y + tank.height / 2 - controls.height * controls.shoot.sizeMultiplier / 2 - canvasPadding + controls.shoot.offsetY;

  relocateFireControl();
}

// draw the game
function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStats();
  drawTank();
  drawBarrel();
  drawTarget();
  drawTrajectory();
  drawBullet();
  drawControls();
};

// draw tank stats
function drawStats() {
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";

  var hiScoreMessage = "Hi-score:";
  var hiScore = localStorage.getItem("hiScore") ?? 0;
  var hiScoreSize = getTextSize(hiScoreMessage);
  var scoreMessage = "Score:";
  var scoreSize = getTextSize(scoreMessage);
  var longestMessage = Math.max(hiScoreSize.width, scoreSize.width);

  var col1X = 10;
  var col2X = col1X + longestMessage + 10;
  var colY = 20;

  ctx.fillText(hiScoreMessage, col1X, colY);
  ctx.fillText(hiScore, col2X, colY);
  colY += hiScoreSize.height;

  ctx.fillText(scoreMessage, col1X, colY);
  ctx.fillText(game.score, col2X, colY);
  colY += scoreSize.height;

  drawBulletsLeft(col1X, colY);
  colY += bullet.height;

  drawRankLevel(col1X, colY);
};

// draw the bullets left
function drawBulletsLeft(x, y) {
  var bulletSpacing = bullet.height + 5;

  //rotate image to portrait
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(degreesToRadians(-90));

  for (var i = 0; i < tank.bullets; i++) {
    ctx.drawImage(bulletImage, x - bullet.width, bulletSpacing * i, bullet.width, bullet.height);
  }

  ctx.restore();
}

function drawRankLevel(x, y) {
  if (!rankImage.complete) { return; }

  for (var i = 0; i < game.difficulty; i++) {
    ctx.drawImage(rankImage, x + rank.width * i + rank.offsetX, y + rank.offsetY, rank.width, rank.height);
  }
}

// draw the controls
function drawControls() {
  if (!arrowImage.complete || !shootImage.complete) { return; }

  ctx.save();
  ctx.globalAlpha = (controls.currentCommand === 'powerDown') ? 1 : 0.5;
  ctx.translate(controls.powerDown.x + controls.width / 2, controls.powerDown.y + controls.height / 2);
  ctx.rotate(degreesToRadians(180));
  ctx.translate(-controls.powerDown.x - controls.width / 2, -controls.powerDown.y - controls.height / 2);
  ctx.drawImage(arrowImage, controls.powerDown.x, controls.powerDown.y, controls.width, controls.height);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = (controls.currentCommand === 'powerUp') ? 1 : 0.5;
  ctx.drawImage(arrowImage, controls.powerUp.x, controls.powerUp.y, controls.width, controls.height);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = (controls.currentCommand === 'angleUp') ? 1 : 0.5;
  ctx.translate(controls.angleUp.x + controls.width / 2, controls.angleUp.y + controls.height / 2);
  ctx.rotate(degreesToRadians(-90));
  ctx.translate(-controls.angleUp.x - controls.width / 2, -controls.angleUp.y - controls.height / 2);
  ctx.drawImage(arrowImage, controls.angleUp.x, controls.angleUp.y, controls.width, controls.height);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = (controls.currentCommand === 'angleDown') ? 1 : 0.5;
  ctx.translate(controls.angleDown.x + controls.width / 2, controls.angleDown.y + controls.height / 2);
  ctx.rotate(degreesToRadians(90));
  ctx.translate(-controls.angleDown.x - controls.width / 2, -controls.angleDown.y - controls.height / 2);
  ctx.drawImage(arrowImage, controls.angleDown.x, controls.angleDown.y, controls.width, controls.height);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = (controls.currentCommand === 'fire') ? 1 : 0.5;

  ctx.drawImage(shootImage, controls.fire.x, controls.fire.y, controls.width, controls.height);
  ctx.drawImage(shootImage, controls.shoot.x, controls.shoot.y, controls.width * controls.shoot.sizeMultiplier, controls.height * controls.shoot.sizeMultiplier)
  ctx.restore();
}

// draw the tank
function drawTank() {
  if (tankImage.complete) {
    ctx.drawImage(tankImage, tank.x, tank.y, tank.width, tank.height);
  };
};

// draw the tank's barrel
function drawBarrel() {
  if (tankBarrelImage.complete) {
    var angle = tank.angle * tankBarrel.degreeMultiplier;

    ctx.save();
    ctx.translate(tankBarrel.rotationX, tankBarrel.rotationY);
    ctx.rotate(degreesToRadians(angle));
    ctx.drawImage(tankBarrelImage, 0, -tankBarrel.height / 2, tankBarrel.width, tankBarrel.height);
    ctx.restore();
  };
};

// draw the target
function drawTarget() {
  if (targetImage.complete && target.isHit === false) {
    ctx.drawImage(targetImage, target.x, target.y, target.width, target.height);
  };
};

// draw trajectory lines from tank based on angle and power
function drawTrajectory() {
  ctx.save();
  var lineWidth = tank.power * trajectory.lineWidthMultiplier;
  var startX = tankBarrel.x;
  var startY = tankBarrel.y + tankBarrel.height / 2;
  var trajectoryLength = trajectory.length * tank.power / game.maxPower;
  var radians = degreesToRadians(tank.angle);

  var endX = startX + trajectoryLength * Math.cos(radians);
  var endY = startY - trajectoryLength * Math.sin(radians);

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(trajectory.lineDash);
  ctx.stroke();
  ctx.restore();
};

// draw the bullet
function drawBullet() {
  if (bullet.fired && !bullet.stopped && bulletImage.complete) {
    //rotate the bullet based on its velocity
    var degree = radiansToDegrees(Math.atan2(bullet.velocityY, bullet.velocityX));

    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    ctx.rotate(degreesToRadians(degree));
    ctx.drawImage(bulletImage, bullet.width * -0.5, bullet.height * -0.5, bullet.width, bullet.height);
    ctx.restore();
  }
};

// update the game
function updateGame() {
  checkCommand();
  updateBullet();
  updateTarget();
  checkHit();
  checkBounds();
  checkGameOver();
};

// update the bullet's position
function updateBullet() {
  if (!bullet.fired || bullet.stopped) { return; }

  if (bullet.frame === 0) {
    // apply air resistance
    bullet.velocityX *= (1 - game.airResistance);
    bullet.velocityY *= (1 - game.airResistance);

    // apply gravity
    bullet.velocityY += game.gravity;
  }

  // update the bullet's position
  var framePerChange = game.fps * bullet.speed;
  bullet.x += bullet.velocityX / framePerChange;
  bullet.y += bullet.velocityY / framePerChange;
  bullet.frame++;

  if (bullet.frame >= framePerChange) {
    bullet.frame = 0;
  }
};

// update the target's position based on difficulty
function updateTarget() {
  if (game.difficulty <= 1 || (bullet.fired && bullet.stopped)) { return; }

  if (target.currentDirection === '') {
    var vertical = Math.random() > 0.5 ? true : false;
    target.currentDirection = Math.random() > 0.5 ? (vertical ? 'up' : 'left') : (vertical ? 'down' : 'right');
  }

  var newDirection = false;

  if (target.currentDirection === 'up') {
    target.y -= target.movementSpeedMultiplier;
    if (target.y <= target.originalY - target.movementRange
      || target.y <= canvasPadding) {
      newDirection = true;
    }
  } else if (target.currentDirection === 'down') {
    target.y += target.movementSpeedMultiplier;
    if (target.y >= target.originalY + target.movementRange
      || target.y >= game.height - target.height - canvasPadding) {
      newDirection = true;
    }
  } else if (target.currentDirection === 'left') {
    target.x -= target.movementSpeedMultiplier;
    if (target.x <= target.originalX - target.movementRange) {
      newDirection = true;
    }
  } else if (target.currentDirection === 'right') {
    target.x += target.movementSpeedMultiplier;
    if (target.x >= target.originalX + target.movementRange
      || target.x >= game.width - target.width - canvasPadding) {
      newDirection = true;
    }
  }

  var direction = '';
  if (newDirection) {
    switch (target.currentDirection) {
      case 'up':
        direction = 'down';
        break;
      case 'down':
        direction = 'up';
        break;
      case 'left':
        direction = 'right';
        break;
      case 'right':
        direction = 'left';
        break;
    }

    var changeOrientation = (game.difficulty <= 2) ? false : (Math.random() > 0.5 ? true : false);
    if (changeOrientation) {
      if (direction === 'up' || direction === 'down') {
        direction = Math.random() > 0.5 ? 'left' : 'right';
      } else if (direction === 'left' || direction === 'right'){
        direction = Math.random() > 0.5 ? 'up' : 'down';
      }
    }

    newDirection = false;
  }

  if (direction !== '') {
    target.currentDirection = direction;
  }
}

// check if the bullet hits the target
function checkHit() {
  if (bullet.fired === false) { return; }

  var hit = checkCollision();
  if (hit) {
    bullet.stopped = true;
    target.isHit = true;

    if (isDelayOver()) {
      tank.bullets += 1;

      if (game.difficulty <= 1) {
        game.score += 1;
      } else {
        game.score += 2 * (game.difficulty - 1);
      }

      adjustDifficulty();
      initTarget();
      initBullet();
      return;
    }

    drawHitMessage();
    drawExplosion();
  }
};

// draw a hit message
function drawHitMessage() {
  ctx.save();
  ctx.fillStyle = "green";
  ctx.font = "50px Arial";
  var message = "HIT!";
  var textSize = getTextSize(message);
  ctx.fillText(message, game.width / 2 - textSize.width / 2, game.height / 2 - textSize.height);
  ctx.restore();
};

// draw the explosion at target
function drawExplosion() {
  if (explosionImage.complete) {
    ctx.drawImage(explosionImage, target.x + target.width / 2 - explosion.width / 2, target.y + target.height / 2 - explosion.height / 2, explosion.width, explosion.height);
  };
}

// check if the bullet is out of bounds
function checkBounds() {
  if (bullet.fired === false) { return; }

  if (bullet.x < 0 || bullet.x > game.width || bullet.y > game.height) {
    bullet.stopped = true;

    if (isDelayOver()) {
      // move target after every attempt on higher difficulty
      if (game.difficulty > 0) {
        initTarget();
      }

      initBullet();
      return;
    }

    drawMissMessage();
  }
};

// draw a miss message
function drawMissMessage() {
  ctx.save();
  ctx.fillStyle = "red";
  ctx.font = "50px Arial";
  var message = "MISS!";
  var textSize = getTextSize(message);
  ctx.fillText(message, game.width / 2 - textSize.width / 2, game.height / 2 - textSize.height);
  ctx.restore();
};

// check if game is over
function checkGameOver() {
  if (bullet.fired == false && tank.bullets <= 0) {
    var hiScore = localStorage.getItem("hiScore") ?? 0;
    var newHighScore = game.score > hiScore;

    if (isDelayOver()) {
      if (newHighScore) {
        localStorage.setItem("hiScore", game.score);
      }

      initGame();

      return;
    }

    drawGameOver(newHighScore);
  }
}

// draw the game over screen
function drawGameOver(addHighScore = false) {
  ctx.save();

  ctx.fillStyle = "black";
  ctx.font = "50px Arial";
  var message = "Game Over";
  var textSize = getTextSize(message);
  ctx.fillText(message, game.width / 2 - textSize.width / 2, game.height / 2 - textSize.height);

  // add score
  ctx.font = "30px Arial";
  ctx.fillStyle = "green";
  var score = "Score: " + game.score;
  var scoreSize = getTextSize(score);
  ctx.fillText(score, game.width / 2 - scoreSize.width / 2, game.height / 2 + 5);

  if (addHighScore) {
    ctx.font = "20px Arial";
    var highScore = "New High Score!";
    var highScoreSize = getTextSize(highScore);
    ctx.fillText(highScore, game.width / 2 - highScoreSize.width / 2, game.height / 2 + scoreSize.height + 10);
  }

  ctx.restore();
};

function adjustDifficulty() {
  game.totalHits += 1;

  if (game.totalHits % game.hitsPerDifficulty === 0) {
    game.difficulty += 1;
  }

  if (game.difficulty >= 4) {
    // randomize whether to add or subtract air resistance
    var modifier = game.airResistanceModifier * game.difficulty / 4;
    game.airResistance += Math.random() > 0.5 ? modifier : -modifier;
  }
}

// provides a delay before proceeding
function isDelayOver(frameDelay = 60 * 3) {
  if (delayCounter.active) {
    delayCounter.lifeTime -= 1;
  } else {
    delayCounter.active = true;
    delayCounter.lifeTime = frameDelay;
  }

  if (delayCounter.lifeTime <= 0) {
    delayCounter.active = false;
    return true;
  }

  return false;
}

// set initial bullet velocity and fire the bullet
function fireBullet() {
  bullet.fired = true;
  bullet.stopped = false;
  tank.bullets -= 1;
}

// set bullet's initial velocity
function setInitialBulletVelocity() {
  var halfPower = game.maxPower / 2;
  var adjustedPower = halfPower + (tank.power / game.maxPower) * halfPower;
  var firePower = adjustedPower * game.powerMultiplier;
  var radians = degreesToRadians(tank.angle);
  bullet.velocityX = firePower * Math.cos(radians);
  bullet.velocityY = firePower * Math.sin(radians) * -1;
}

function executeCommand(command) {
  switch (command) {
    case "powerUp":
      tank.power = Math.min(tank.power + 1, game.maxPower);
      setInitialBulletVelocity();
      break;
    case "powerDown":
      tank.power = Math.max(tank.power - 1, game.minPower);
      setInitialBulletVelocity();
      break;
    case "angleUp":
      tank.angle = Math.min(tank.angle + 1, game.maxAngle);
      relocateBullet();
      relocateFireControl();
      setInitialBulletVelocity();
      break;
    case "angleDown":
      tank.angle = Math.max(tank.angle - 1, game.minAngle);
      relocateBullet();
      relocateFireControl();
      setInitialBulletVelocity();
      break;
    case "fire":
      if (tank.bullets > 0 && bullet.fired === false) {
        fireBullet();
      }
      break;
  }
}

// handle key events
function handleKeyDown(event) {
  if (bullet.fired) { return; }

  switch (event.keyCode) {
    case 37: // left arrow key
      controls.currentCommand = "powerDown";
      break;
    case 39: // right arrow key
      controls.currentCommand = "powerUp";
      break;
    case 38: // up arrow key
      controls.currentCommand = "angleUp";
      break;
    case 40: // down arrow key
      controls.currentCommand = "angleDown";
      break;
    case 32: // space bar
      controls.currentCommand = "fire";
      break;
  }

  if (controls.currentCommand !== '') {
    executeCommand(controls.currentCommand);
  }
};

// handle pointer down events
function handlePointerDown(event) {
  event.preventDefault();

  if (bullet.fired) { return; }

  var rect = canvas.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;

  if (x >= controls.powerUp.x && x <= controls.powerUp.x + controls.width * controls.powerUp.sizeMultiplier &&
    y >= controls.powerUp.y && y <= controls.powerUp.y + controls.height * controls.powerUp.sizeMultiplier) {
    controls.currentCommand = "powerUp";
  } else if (x >= controls.powerDown.x && x <= controls.powerDown.x + controls.width * controls.powerDown.sizeMultiplier &&
    y >= controls.powerDown.y && y <= controls.powerDown.y + controls.height * controls.powerDown.sizeMultiplier) {
    controls.currentCommand = "powerDown";
  } else if (x >= controls.angleUp.x && x <= controls.angleUp.x + controls.width * controls.angleUp.sizeMultiplier &&
    y >= controls.angleUp.y && y <= controls.angleUp.y + controls.height * controls.angleUp.sizeMultiplier) {
    controls.currentCommand = "angleUp";
  } else if (x >= controls.angleDown.x && x <= controls.angleDown.x + controls.width * controls.angleDown.sizeMultiplier &&
    y >= controls.angleDown.y && y <= controls.angleDown.y + controls.height * controls.angleDown.sizeMultiplier) {
    controls.currentCommand = "angleDown";
  } else if (x >= controls.fire.x && x <= controls.fire.x + controls.width * controls.fire.sizeMultiplier &&
    y >= controls.fire.y && y <= controls.fire.y + controls.height * controls.fire.sizeMultiplier) {
    controls.currentCommand = "fire";
  } else if (x >= controls.shoot.x && x <= controls.shoot.x + controls.width * controls.shoot.sizeMultiplier &&
    y >= controls.shoot.y && y <= controls.shoot.y + controls.height * controls.shoot.sizeMultiplier) {
    controls.currentCommand = "fire";
  }

  if (controls.currentCommand !== '') {
    executeCommand(controls.currentCommand);
  }
}

// handle pointer up events
function cancelCommand(event) {
  event.preventDefault();
  controls.currentCommand = '';
}

// execute the command if it is set
function checkCommand() {
  if (bullet.fired) { return; }

  if (controls.currentCommand !== '') {
    executeCommand(controls.currentCommand);
  }
}

// place bullet to the end of the tank barrel
function relocateBullet() {
  var startX = tankBarrel.x + tankBarrel.width + bullet.offsetX + bullet.width / 2 + bullet.offsetX;
  var startY = tankBarrel.y + tankBarrel.height / 2 + bullet.offsetY;

  var angle = tank.angle * tankBarrel.degreeMultiplier;
  var rotated = getRotatedCoordinates(startX, startY, tankBarrel.rotationX, tankBarrel.rotationY, angle);
  bullet.x = rotated.x;
  bullet.y = rotated.y;
}

// move fire control to the end of the trajectory
function relocateFireControl() {
  var startX = tankBarrel.x;
  var startY = tankBarrel.y + tankBarrel.height / 2;
  var trajectoryLength = trajectory.length + controls.padding;
  var radians = degreesToRadians(tank.angle);
  var endX = startX + trajectoryLength * Math.cos(radians);
  var endY = startY - trajectoryLength * Math.sin(radians);
  controls.fire.x = endX - controls.width / 2 + controls.fire.offsetX;
  controls.fire.y = endY - controls.height / 2 + controls.fire.offsetY;
}

// check if bullet collides with the target shape
// uses separation of axis theorem
function checkCollision() {
  var bulletPoints = getBulletPoints();
  var targetPoints = getTargetPoints();

  var bulletAxes = getAxes(bulletPoints);
  var targetAxes = getAxes(targetPoints);

  for (var i = 0; i < bulletAxes.length; i++) {
    var axis = bulletAxes[i];
    var bulletProjection = projectPoints(bulletPoints, axis);
    var targetProjection = projectPoints(targetPoints, axis);

    if (!isOverlap(bulletProjection, targetProjection)) {
      return false;
    }
  }

  for (var i = 0; i < targetAxes.length; i++) {
    var axis = targetAxes[i];
    var bulletProjection = projectPoints(bulletPoints, axis);
    var targetProjection = projectPoints(targetPoints, axis);

    if (!isOverlap(bulletProjection, targetProjection)) {
      return false;
    }
  }

  return true;
}

function getBulletPoints() {
  var degree = radiansToDegrees(Math.atan2(bullet.velocityY, bullet.velocityX));
  var ul = getRotatedCoordinates(bullet.x - bullet.width / 2, bullet.y - bullet.height / 2, bullet.x, bullet.y, degree);
  var ur = getRotatedCoordinates(bullet.x + bullet.width / 2, bullet.y - bullet.height / 2, bullet.x, bullet.y, degree);
  var ll = getRotatedCoordinates(bullet.x - bullet.width / 2, bullet.y + bullet.height / 2, bullet.x, bullet.y, degree);
  var lr = getRotatedCoordinates(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.x, bullet.y, degree);

  return [ul, ur, ll, lr];
}

function getTargetPoints() {
  var ul = { x: target.x, y: target.y };
  var ur = { x: target.x + target.width, y: target.y };
  var ll = { x: target.x, y: target.y + target.height };
  var lr = { x: target.x + target.width, y: target.y + target.height };

  return [ul, ur, ll, lr];
}

// get the axes of the shape
function getAxes(points) {
  var axes = [];

  for (var i = 0; i < points.length; i++) {
    var p1 = points[i];
    var p2 = points[(i + 1) % points.length];

    var edge = { x: p2.x - p1.x, y: p2.y - p1.y };
    var normal = { x: edge.y, y: -edge.x };

    var length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
    normal.x /= length;
    normal.y /= length;

    axes.push(normal);
  }

  return axes;
}

// project the points onto the axis
function projectPoints(points, axis) {
  var min = Number.MAX_VALUE;
  var max = Number.MIN_VALUE;

  for (var i = 0; i < points.length; i++) {
    var dotProduct = points[i].x * axis.x + points[i].y * axis.y;
    min = Math.min(min, dotProduct);
    max = Math.max(max, dotProduct);
  }

  return { min: min, max: max };
}

// check if the projections overlap
function isOverlap(projection1, projection2) {
  return projection1.min <= projection2.max && projection1.max >= projection2.min;
}

// convert degrees to radians
function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
};

// convert radians to degrees
function radiansToDegrees(radians) {
  return radians * 180 / Math.PI;
};

// get the rotated coordinates
function getRotatedCoordinates(x, y, cx, cy, angle) {
  // Convert the angle from degrees to radians
  var rad = degreesToRadians(angle);

  // Calculate the rotated coordinates
  var rx = Math.cos(rad) * (x - cx) - Math.sin(rad) * (y - cy) + cx;
  var ry = Math.sin(rad) * (x - cx) + Math.cos(rad) * (y - cy) + cy;

  return { x: rx, y: ry };
}

// calculate text width and height drawn on canvas
function getTextSize(text) {
  var metrics = ctx.measureText(text);
  return { width: metrics.width, height: parseInt(ctx.font) };
}

function handleResize() {
  resize();
  drawGame();
}

// run the game
function runGame() {
  drawGame();
  updateGame();
  requestAnimationFrame(runGame);
};

// kick it off
init();
runGame();