import Canvas from "./canvas.js";
import Brick from "./brick.js";
import Player from "./player.js";
import Ball from "./ball.js";
import Level from "./level.js";

let playerScore = 0;
let playerLife = 5;
const score = $("#score");
score.text(playerScore);
const life = $("#life");
life.text(playerLife);
const level = $("#level");
level.text(1);
const soundEl = document.getElementById("bg-sound");
const canvas = new Canvas(document.getElementById("canvas"));
$(window).on('resize', canvas.setWidthHeight);

let CURRENT_LEVEL = 0;

const levelsBrickStructure = [
  [
    [true, false, true, false, true],
    [false, true, false, true, false],
    [true, false, true, false, true],
    [false, true, false, true, false],
    [true, false, true, false, true],
    [false, true, false, true, false],
  ],
  [
    [true, true, true, true, true],
    [true, false, true, false, true],
    [true, false, true, false, true],
    [true, false, true, false, true],
    [true, false, true, false, true],
    [true, false, true, false, true],
  ],
  [
    [true, true, true, true],
    [true, true, true, false],
    [true, true, false, false],
    [true, false, false, false],
    [true, true, false, false],
    [true, true, true, false],
  ],
  [
    [false, false, false, true, false, false, false],
    [false, false, true, true, true, false, false],
    [false, true, true, true, true, true, false],
    [true, true, true, true, true, true, true],
    [false, true, true, true, true, true, false],
    [false, false, true, true, true, false, false],
    [false, false, false, true, false, false, false]
  ],
  [
    [false, false, false, false, false, true, false, true],
    [false, false, false, false, true, true, false, true],
    [true, false, false, true, true, true, false, true],
    [ true, true, true, true, true, true, false, true],
    [ true, false, false, true, true, true, false, true],
    [ false, false, false, false, true, true, false, true],
    [ false, false, false, false, false, true, false, true],
  ],
  [
    [true, false, false, false, false, false, false, true,true],
    [true, true, false, false, false, false, true, true, false],
    [true, true, true, false, false, true, true, true, false],
    [true, false, true, false, true, false, false, true, false],
    [true, true, true, false, false, true, true, true, false],
    [true, true, true, true, true, true, true, true, true, true],
  ]
];
const levels = [];

levelsBrickStructure.forEach(structure => {
  levels.push(new Level(structure));
});

function getGame(l) {

  if (!l) return;
  score.text(playerScore);
  level.text(CURRENT_LEVEL + 1);
  life.text(playerLife);
  /* LEVEL */
  const COL = l.COL;
  const ROW = l.ROW;
  const COL_WIDTH = canvas.width / COL;
  const COL_HEIGHT = 40;
  const PADDING = 15;
  const BricksArr = [];
  let BRICKS_LEFT = 0;
  let oldX;

  for (let i = 0; i < ROW; i = i + 1) {
    for (let j = 0; j < COL; j = j + 1) {
      const x = COL_WIDTH * j + PADDING / 2;
      const y = COL_HEIGHT * i + PADDING / 2;
      BricksArr.push(
        new Brick(x, y, COL_WIDTH - PADDING, COL_HEIGHT - PADDING, l.ARR[j][i])
      );
      if (l.ARR[j][i]) {
        BRICKS_LEFT += 1;
      }
    }
  }

  /* PLAYER */
  const player = new Player(
    canvas.width / 2 - COL_WIDTH / 2,
    canvas.height - 3 * COL_HEIGHT,
    (3 * COL_WIDTH) / 2,
    (2 * COL_HEIGHT) / 3,
    playerScore,
    playerLife
  );

  /* BALL */
  const ball = new Ball(canvas.width / 2, canvas.height / 2, 10, CURRENT_LEVEL);
  function isBallCollideWithBrick(ball, brick) {
    return (
      ball.x + ball.radius > brick.x &&
      ball.x - ball.radius < brick.x + brick.width &&
      ball.y + ball.radius > brick.y &&
      ball.y - ball.radius < brick.y + brick.height
    );
  }

  function drawBricks() {
    BricksArr.forEach(brick => {
      if (brick.isVisible && isBallCollideWithBrick(ball, brick)) {
        brick.isVisible = false;
        player.score += 10;
        let snd = new Audio("../assets/sounds/pop.mp3");
        snd.play();
        BRICKS_LEFT -= 1;
        score.text(player.score);
        playerScore = player.score;
        ball.yVelocity *= -1;
        if (BRICKS_LEFT === 0) {
          player.isWon = true;
        }
      } else if (brick.isVisible) {
        brick.draw(canvas.ctx);
      }
    });
  }

  function drawGame() {
    ball.draw(canvas.ctx);
    drawBricks();
    player.draw(canvas.ctx);
  }

  function updateGame() {
    ball.update(canvas, player);
    player.update(canvas);
  }

  function clearGame() {
    canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  (function animateGame() {
    life.text(player.life);
    if (player.life <= 0) {
      let snd = new Audio("../assets/sounds/game_over.wav");
      snd.play();
      gameOver();
      return;
    } else if (player.isWon) {
      CURRENT_LEVEL += 1;
      playerLife +=1;
      if (CURRENT_LEVEL < levels.length) {
        alert(`You Win! The next level ${CURRENT_LEVEL + 1}`);
        getGame(levels[CURRENT_LEVEL]);
      } else {
        alert(`You Won!The score ${playerScore}`);
        location.reload();
      }
      return;
    }
    clearGame();
    drawGame();
    updateGame();
    requestAnimationFrame(animateGame);
  })();

  $(window).on("keydown", function (event) {
    if (event.key === "ArrowRight") {
      player.isRight = true;
      player.isLeft = false;
    } else if (event.key === "ArrowLeft") {
      player.isRight = false;
      player.isLeft = true;
    }
  });

  $(window).on("keyup", function (event) {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      player.isRight = false;
      player.isLeft = false;
    }
  });

  $(window).mousemove(function (event) {
    oldX = event.pageX;
    setTimeout(() => checkMovement(event, oldX), 35);
    oldX = event.pageX;
  });

  const checkMovement = (event, oldX) => {
    player.x += (oldX - event.pageX) / 3;
  };

  function gameOver() {
    $('#container-game-over').show();
    allNone();
    clearGame();
    $('canvas').hide();
    $(".bottom").first().css('display', 'none');
  }

  $('#restart').on('click', function() {
    removeHome();
    clearGame();
    $('canvas').show();
    $('#container-game-over').hide();

  });
}

let volume = 2;

$(".playButton").on('click', function() {
  const name = $('#yourName').val();
  if(!name) {
    alert('Please insert your name!');
    return;
  }
  $('.playerName').text(`Hello ${name}!`)
  removeHome();
});
$(".volume").on('click', muteSound);
$("#left").on('click', showHome);
$("#right").on('click', startGame);
$("#one").on('click', () => startLevel(0));
$("#two").on('click', () => startLevel(1));
$("#three").on('click', () => startLevel(2));
$("#four").on('click', () => startLevel(3));
$("#five").on('click', () => startLevel(4));
$("#six").on('click', () => startLevel(5));
$(window).on('load', move);

function removeHome() {
  $(".home-screen").first().css('display', 'none');
  $(".bottom").first().css('display', 'flex');
  showLevelScreen();
}

function showHome() {
  $(".container-level").first().css('display', 'none');
  $(".home-screen").first().css('display', 'flex');
}

function move() {
  showHome();
}

function showLevelScreen() {
  $(".bottom").first().css('display', 'none');
  $(".container-level").first().css('display', 'flex');
}

function allNone() {
  $(".container-level").first().css('display', 'none');
  $(".home-screen").first().css('display', 'none');
}

function showGameCard() {
  $(".bottom").first().css('display', 'flex');
}

function startGame() {
  allNone();
  showGameCard();
  getGame(levels[CURRENT_LEVEL]);
}

function startLevel(level) {
  CURRENT_LEVEL = level;
  allNone();
  showGameCard();
  getGame(levels[CURRENT_LEVEL]);
}

function muteSound() {
  const obj = $(".volume").first();
  if (volume % 2 != 0) {
    obj.attr("id","mute");
    soundEl.pause();
  } else {
    obj.attr("id","sound");
    soundEl.play();
  }
  volume++;
}