// const RANDOM_QUOTE_API_URL = 'http://asdfast.beobit.net/api/'; //'https://loremipsumgenerator.org/api';
const gameStatusElement = document.getElementById('console')
const quoteDisplayElement = document.getElementById('quoteDisplay')
const quoteInputElement = document.getElementById('quoteInput')

let ws = JSON.parse(sessionStorage.getItem("ws"));

const numPlayers = 2; // TODO: Get from Server

const maxTypingTime = 5000 // milliseconds
const gameStartCountdown = 3000; // milliseconds
const durationOfSpellSuccess = 1000; // milliseconds
const durationOfStun = 1000; // milliseconds
const durationOfSpellSelection = 5000; //milliseconds
const durationOfBattleAnimationPerSpell = 2000; //milliseconds

let timerTime = -1;
let timerIntervalID = null; // Time interval ID is used to kill a timer.

let GAME_STATE = "parent-state";

let totalTimerCount = 1;
let stopTimerSignal = false;

let myPlayerID = sessionStorage.getItem("clientID"); // TODO get from server

let players = [];
let spells  = [];
for (let i = 0; i < numPlayers; i++) {
    players.push(new Player(i));
    spells.push(new Spell());
}

quoteInputElement.addEventListener('input', () =>{
    const arrayQuote = quoteDisplayElement.querySelectorAll('span')
    const arrayValue = quoteInputElement.value.split('')

    let correct = true; // unused at the moment
    let incorrectLetterCount = 0;
    arrayQuote.forEach((characterSpan, index) => {
        const character = arrayValue[index]
        if (character == null){
            characterSpan.classList.remove('correct')
            characterSpan.classList.remove('incorrect')
            correct = false
        } else if (character === characterSpan.innerText){
            characterSpan.classList.add('correct')
            characterSpan.classList.remove('incorrect')
        } else {
            characterSpan.classList.remove('correct')
            characterSpan.classList.add('incorrect')
            correct = false
            incorrectLetterCount+=1
        }
    })

    if (GAME_STATE === "casting-spell")
    {
        // Set effectiveness percent
        spells[myPlayerID].updateSpell(
            null,
            null,
            null,
            Math.max(0.0, 1.0-(incorrectLetterCount/arrayValue.length) )
        );
    }
    if (GAME_STATE === "selecting-spell" && arrayValue.length>0){
        selectSpell(arrayValue);
    }
})

function selectSpell(spell_id)
{
    console.log(spell_id[0])
    // TODO: randomly select the spells that they can pick from
    if (["a","b","c"].includes(spell_id[0]))
    {
        quoteInputElement.value = spell_id[0]
        quoteInputElement.disabled = true

        console.log("In selectSpell. You chose: " + spell_id);
        spells_in_deck = {"a" : new Spell(-5.0, 1, -5, null), "b" : new Spell(-5.0, 1, -5, null), "c" : new Spell(-5.0, 1, -5, null), "d" : new Spell(-5.0, 1, -5, null)};
        spells[myPlayerID] = spells_in_deck[spell_id]

        // Update the current player's mana
        players[myPlayerID].changeMana(spells_in_deck[spell_id].mana_cost);
    } else {
        console.log("Unknown spell selection. Try again.")
        quoteInputElement.value = null
        gameStatusElement.innerHTML = gameStatusElement.innerHTML + "\n Unknown spell selection. Try again."
    }
}

function getRandomQuote() {
    // return fetch(RANDOM_QUOTE_API_URL)
    //     .then(response => response.json())
    //     .then(data => console.log(data))
        // .then(data => data.text)
        // .then(data => data.json())
        // .then(data => data.text)
    return "Lorem ipsum";
}

async function renderNewQuote(quote) {
    quoteDisplayElement.innerHTML = ''
    quote.split('').forEach(character =>{
        const characterSpan = document.createElement('span')
        characterSpan.innerText = character
        quoteDisplayElement.appendChild(characterSpan)
    })
}

function startTimer(maxTimeMS) {
    totalTimerCount += 1;
    if (totalTimerCount != 1){
        throw "Assertion failed";
    }
    timer.innerText = maxTimeMS/1000.0;
    startTime = new Date()
    timerTime = 0
    timerIntervalID = setInterval(() => {
        timerTime = ((maxTimeMS - getTimerDelta(startTime))/1000.0).toFixed(1);

        if (stopTimerSignal)
        {
            stopTimerSignal = false;
            clearInterval(timerIntervalID); // Stop the counter routine until restarted elsewhere
            return timerIntervalID;
        }

        if (timerTime >= 0.000)
        {
            timer.innerText = timerTime;
        }
    }, 100)

    return timerIntervalID
}

function getTimerDelta(startTime){
    return new Date() - startTime;
}


var img = new Image();
img.src = './sprites/wizard.png';
img.onload = function() {
    var ctx = document.getElementById("opponent-canvas-1").getContext('2d');
    ctx.drawImage(img, 0, 0, 100, 100);
}

var img = new Image();
img.src = './sprites/wizard.png';
img.onload = function() {
    var ctx = document.getElementById("opponent-canvas-2").getContext('2d');
    ctx.drawImage(img, 0, 0, 100, 100);
}
// setGameStatus("start-game")

function nextGameState()
{
    if (GAME_STATE === "parent-state"){
        GAME_STATE = "start-game"
    }else if (GAME_STATE === "start-game"){
        GAME_STATE = "selecting-spell";
    } else if (GAME_STATE === "selecting-spell"){
        GAME_STATE = "casting-spell";
    } else if (GAME_STATE === "casting-spell"){
        GAME_STATE = "battle-time";
    }else if (GAME_STATE === "battle-time"){
        GAME_STATE = "selecting-spell";
    } else
    {
        throw "UNKNOWN GAME STATE!";
    }
}
function mainLoop() {
    if (timerTime < 0.0)
    {
        clearInterval(timerIntervalID);
        totalTimerCount -= 1;

        // Update the GAME_STATE
        nextGameState();
        
        // Clear game status
        timer.innerText = ""
        gameStatus.innerText = ""
        gameStatus.classList.remove('incorrect-spell')
        gameStatus.classList.remove('correct-spell')

        quoteInputElement.value = null
        quoteInputElement.disabled = false
        quoteInputElement.focus();

        if (GAME_STATE === "start-game"){
            console.log("GAME_STATE: start-game")
    
            timer.innerText = "Game starting..."
            gameStatusElement.innerText = "Game starting..."
            quoteInputElement.value = null
            quoteInputElement.disabled = true
    
            timerIntervalID = startTimer(gameStartCountdown)
        }
        else if (GAME_STATE === "selecting-spell")
        {
            // Do nothing, the event manager takes care of this
            // TODO: Draw the potential spells to choose from here
            console.log("GAME_STATE: selecting-spell")
    
            const quote = "a) Spell 1, b) Spell 2, c) Spell 3"
            renderNewQuote(quote);
            gameStatusElement.innerHTML = "Spell selection - Type in the spell ID: " + quote;

            quoteInputElement.value = null
            quoteInputElement.disabled = false

            timerIntervalID = startTimer(durationOfSpellSelection)
        }
        else if (GAME_STATE === "casting-spell")
        {
            console.log('GAME_STATE: casting-spell');
            // timer.innerText = "BATTLE TIME!"
            gameStatusElement.innerHTML = "Cast your spells! Type quickly and accurately";
    
            quoteInputElement.value = null
            quoteInputElement.disabled = false

            renderNewQuote(getRandomQuote())
    
            timerIntervalID = startTimer(maxTypingTime);
        }
        else if (GAME_STATE === "battle-time")
        {
            console.log('GAME_STATE: battle-time');
            // timer.innerText = "BATTLE TIME!"
            gameStatusElement.innerHTML = "BATTLE TIME!";
    
            quoteInputElement.value = null
            quoteInputElement.disabled = true
    
            players.forEach(player =>{
                spells.forEach(spell =>{
                    player.applySpell(spell)
                })
            })
    
            timerIntervalID = startTimer(durationOfBattleAnimationPerSpell*numPlayers);
        }
        else {
            throw "WARNING: UNKNOWN GAME_STATE";
        }
    }
}


init()
setInterval(mainLoop, 10);