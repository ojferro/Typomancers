// const RANDOM_QUOTE_API_URL = 'http://asdfast.beobit.net/api/'; //'https://loremipsumgenerator.org/api';
const quoteDisplayElement = document.getElementById('quoteDisplay')
const quoteInputElement = document.getElementById('quoteInput')

const numPlayers = 2;

const maxTypingTime = 5000 // milliseconds
const gameStartCountdown = 3000; // milliseconds
const durationOfSpellSuccess = 1000; // milliseconds
const durationOfStun = 1000; // milliseconds
const durationOfSpellSelection = 5000; //milliseconds
const durationOfBattleAnimationPerSpell = 2000; //milliseconds

let timerTime = -1;

let GAME_STATE = "start-game";

let totalTimerCount = 0;
let stopTimerSignal = false;

const myPlayerID = 0; //TODO: this is temporary, it should be auto assigned based on the order players join server

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

    if (GAME_STATE === "casting-spells")
    {
        // Set effectiveness percent
        spells[myPlayerID].updateSpell(
            null,
            null,
            null,
            Math.max(0.0, 1.0-(incorrectLetterCount/arrayValue.length) )
        );
    }

    if (correct && GAME_STATE === "selecting-spell"){
        selectSpell(arrayValue);
    }
})

function selectSpell(spell_id)
{
    // TODO: randomly select the spells that they can pick from
    spells_in_deck = {"a" : new Spell(-5.0, 1, -5, null), "b" : new Spell(-5.0, 1, -5, null), "c" : new Spell(-5.0, 1, -5, null), "d" : new Spell(-5.0, 1, -5, null)};
    spells[myPlayerID] = spells_in_deck[spell_id]

    // Update the current player's mana
    players[myPlayerID].changeMana(spells_in_deck[spell_id].mana_cost);
}

function setGameStatus(status) {

    var waitBeforeClear = 0; // milliseconds
    // var timerIntervalID = null;
    if (status === "start-game"){
        GAME_STATE = "start-game";
        renderNewQuote();
        timer.innerText = "Game starting..."
        quoteInputElement.value = null
        quoteInputElement.disabled = true
        
        waitBeforeClear = gameStartCountdown;
    }
    // else if (status === "correct-spell"){
    //     console.log('Spell successful');

    //     stopTimerSignal = true; // Stop the counter routine
    //     timer.innerText = "SPELL SUCCESSFUL"
    //     quoteInputElement.value = null
    //     quoteInputElement.disabled = true

    //     waitBeforeClear = durationOfSpellSuccess;

    // } else if (status === "stunned-by-opponent")
    // {
    //     console.log('Stunned by oponent');

    //     timer.innerText = "STUNNED BY OPPONENT"
    //     quoteInputElement.value = null
    //     quoteInputElement.disabled = true

    //     waitBeforeClear = durationOfStun;

    // }
    // else if (status === "selecting-spell")
    // {
    //     GAME_STATE = "selecting-spell";
    //     console.log('Selecting spell');

    //     stopTimerSignal = true; // Stop the counter routine
    //     timer.innerText = "SELECTING SPELL"
    //     quoteInputElement.value = null
    //     quoteInputElement.disabled = true

    //     waitBeforeClear = durationOfSpellSelection;
    // }
    else if (status === "battle-time")
    {
        GAME_STATE = "battle-time";
        console.log('Battle animation');
        timer.innerText = "BATTLE TIME!"

        quoteInputElement.value = null
        quoteInputElement.disabled = true

        players.forEach(player =>{
            spells.forEach(spell =>{
                player.applySpell(spell)
            })
        })
        
        waitBeforeClear = durationOfBattleAnimationPerSpell*numPlayers;
    }
    else {
        console.log("WARNING: UNKNOWN STATUS PASSED INTO setGameStatus()");
    }

    // Clear status after a delay, then start next round
    setTimeout(function(){ 
        console.log("Done delay, clearing")
        timer.innerText = ""
        gameStatus.innerText = ""
        gameStatus.classList.remove('incorrect-spell')
        gameStatus.classList.remove('correct-spell')

        quoteInputElement.value = null
        quoteInputElement.disabled = false
        quoteInputElement.focus();

        // Update state machine
        if (GAME_STATE === "selecting-spell"){
            GAME_STATE = "casting-spell"
            // Restart next rount
            renderNewQuote();
            timerIntervalID = startTimer(maxTypingTime)
        }
        else if (GAME_STATE === "battle-time")
        {
            GAME_STATE = "selecting-spell"
        }
    }, waitBeforeClear);

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

async function renderNewQuote() {
    const quote = await getRandomQuote()
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
    var timerIntervalID = setInterval(() => {
        timerTime = ((maxTimeMS - getTimerDelta(startTime))/1000.0).toFixed(1);

        // if (timerTime <=0)
        // {
            // timerTime = 0
            // totalTimerCount -= 1;
            // setGameStatus("battle-time")
            // clearInterval(timerIntervalID); // Stop the counter routine until restarted elsewhere
            // return timerIntervalID;
        // }else 
        if (stopTimerSignal)
        {
            stopTimerSignal = false;
            totalTimerCount -= 1;
            clearInterval(timerIntervalID); // Stop the counter routine until restarted elsewhere
            return timerIntervalID;
        }

        timer.innerText = timerTime;
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

function mainLoop() {
    if (timerTime < 0.0)
    {
        clearInterval(timerIntervalID);
        
        // Clear game status
        console.log("Done delay, clearing")
        timer.innerText = ""
        gameStatus.innerText = ""
        gameStatus.classList.remove('incorrect-spell')
        gameStatus.classList.remove('correct-spell')

        quoteInputElement.value = null
        quoteInputElement.disabled = false
        quoteInputElement.focus();

        if (GAME_STATE === "start-game"){
            console.log("GAME_STATE: start-game, changing to selecting-spell")
            GAME_STATE = "selecting-spell";

            renderNewQuote();
            timer.innerText = "Game starting..."
            quoteInputElement.value = null
            quoteInputElement.disabled = true

            timerIntervalID = startTimer(gameStartCountdown)
        }
        else if (GAME_STATE === "selecting-spell")
        {
            // Do nothing, the event manager takes care of this
            // TODO: Draw the potential spells to choose from here
            timer.innerText = "a) Spell 1, b) Spell 2, c) Spell 3"
            console.log("GAME_STATE: selecting-spell, changing to battle-time")

            GAME_STATE = "battle-time";
            renderNewQuote();
            timerIntervalID = startTimer(durationOfBattleAnimationPerSpell*numPlayers)
        }
        else if (GAME_STATE === "battle-time")
        {
            console.log('GAME_STATE: battle-time');
            timer.innerText = "BATTLE TIME!"

            quoteInputElement.value = null
            quoteInputElement.disabled = true

            players.forEach(player =>{
                spells.forEach(spell =>{
                    player.applySpell(spell)
                })
            })

            GAME_STATE = "selecting-spell";
            timerIntervalID = startTimer(durationOfSpellSelection);
        }
        else {
            console.log("WARNING: UNKNOWN GAME_STATE");
        }
    }
}
setInterval(mainLoop, 10);