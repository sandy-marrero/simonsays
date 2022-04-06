// global constants
//const clueHoldTime = 1000; //how long to hold each clue's light/sound
const cluePauseTime = 333; //how long to pause in between clues
const nextClueWaitTime = 1000; //how long to wait before starting playback of the clue sequence
//global variables
//var pattern = [2, 2, 4, 3, 2, 1, 2, 4];
var pattern = [1, 1, 1, 1, 1, 1, 1, 1];
var progress = 0;
var gamePlaying = false;
var tonePlaying = false;
var volume = 0.5; //must be between 0.0 and 1.0
var guessCounter = 0;

var clueHoldTime = 1000;
var totalMistakes = 0;

function startGame() {
  //initialize game variables
  createPattern();
  totalMistakes = 0;
  progress = 0;
  gamePlaying = true;
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  playClueSequence()
}

function stopGame() {
  gamePlaying = false;
  document.getElementById("stopBtn").classList.add("hidden");
  document.getElementById("startBtn").classList.remove("hidden");
  clueHoldTime = 1000;
}



// Sound Synthesis Functions
const freqMap = {
  1: 261.6,
  2: 329.6,
  3: 392,
  4: 466.2,
  5: 540.4,
  6: 614.6
}
function playTone(btn, len) {
  o.frequency.value = freqMap[btn]
  g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025)
  context.resume()
  tonePlaying = true
  setTimeout(function () {
    stopTone()
  }, len)
}
function startTone(btn) {
  if (!tonePlaying) {
    context.resume()
    o.frequency.value = freqMap[btn]
    g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025)
    context.resume()
    tonePlaying = true
  }
}
function stopTone() {
  g.gain.setTargetAtTime(0, context.currentTime + 0.05, 0.025)
  tonePlaying = false
}
function lightButton(btn) {
  document.getElementById("button" + btn).classList.add("lit")
}
function clearButton(btn) {
  document.getElementById("button" + btn).classList.remove("lit")
}

function playSingleClue(btn) {
  if (gamePlaying) {
    lightButton(btn);
    playTone(btn, clueHoldTime);
    setTimeout(clearButton, clueHoldTime, btn);
  }
}

function playClueSequence() {
  guessCounter = 0;
  context.resume()
  let delay = nextClueWaitTime; //set delay to initial wait time
  for (let i = 0; i <= progress; i++) { // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms")
    setTimeout(playSingleClue, delay, pattern[i]) // set a timeout to play that clue
    delay += clueHoldTime
    delay += cluePauseTime;
    clueHoldTime *= 0.84;
  }
}

function loseGame() {
  stopGame();
  alert("Game Over. You lost.");
  clueHoldTime = 1000;
}

function winGame() {
  stopGame();
  alert("Game Over. You won!.");
}

function guess(btn) {
  console.log("user guessed: " + btn);

  if (!gamePlaying) {
    return;
  }

  if (pattern[guessCounter] == btn) {
    //Guess was correct!
    if (guessCounter == progress) {
      if (progress == pattern.length - 1) {
        //GAME OVER: WIN!
        winGame();
      } else {
        //Pattern correct. Add next segment
        progress++;
        playClueSequence();
      }
    } else {
      //so far so good... check the next guess
      guessCounter++;
    }
  } else {
    //Guess was incorrect
    totalMistakes++;
    if (totalMistakes == 3) {
      loseGame();
    } else
      alert("Wrong Button, you have " + (3 - totalMistakes) + " attempts left, try again");
    //GAME OVER: LOSE!

  }
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function createPattern() {
  for (let i = 0; i < pattern.length; i++) {
    pattern[i] = getRandomInt(1, 7)
  }
}

// Page Initialization
// Init Sound Synthesizer
var AudioContext = window.AudioContext || window.webkitAudioContext
var context = new AudioContext()
var o = context.createOscillator()
var g = context.createGain()
g.connect(context.destination)
g.gain.setValueAtTime(0, context.currentTime)
o.connect(g)
o.start(0)