// const RANDOM_QUOTE_API_URL = 'http://asdfast.beobit.net/api/'; //'https://loremipsumgenerator.org/api';
const quoteDisplayElement = document.getElementById('quoteDisplay')
const quoteInputElement = document.getElementById('quoteInput')


const maxTypingTime = 5000 // milliseconds
const gameStartCountdown = 3000; // milliseconds
const durationOfSpellSuccess = 1000; // milliseconds
const durationOfStun = 1000; // milliseconds

let totalTimerCount = 0;
let stopTimerSignal = false;

quoteInputElement.addEventListener('input', () =>{
    const arrayQuote = quoteDisplayElement.querySelectorAll('span')
    const arrayValue = quoteInputElement.value.split('')

    let correct = true;
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
        }
    })

    if (correct){
        setGameStatus("correct-spell")
    }
})

function setGameStatus(status) {

    var waitBeforeClear = 0; // milliseconds
    // var timerIntervalID = null;
    if (status === "start-game"){
        renderNewQuote();
        timer.innerText = "Game starting..."
        quoteInputElement.value = null
        quoteInputElement.disabled = true
        
        waitBeforeClear = gameStartCountdown;
    }
    else if (status === "correct-spell"){
        console.log('Spell successful');
        gameStatus.innerText = "SPELL SUCCESSFUL"
        gameStatus.classList.remove('incorrect-spell')
        gameStatus.classList.add('correct-spell')

        stopTimerSignal = true; // Stop the counter routine
        timer.innerText = "SPELL SUCCESSFUL"
        quoteInputElement.value = null
        quoteInputElement.disabled = true

        waitBeforeClear = durationOfSpellSuccess;

    } else if (status === "stunned-by-opponent")
    {
        console.log('Stunned by oponent');
        gameStatus.innerText = "STUNNED BY OPPONENT"
        gameStatus.classList.remove('correct-spell')
        gameStatus.classList.add('incorrect-spell');

        timer.innerText = "STUNNED BY OPPONENT"
        quoteInputElement.value = null
        quoteInputElement.disabled = true

        waitBeforeClear = durationOfStun;

    } else {
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

        // Restart next rount
        renderNewQuote();
        timerIntervalID = startTimer(maxTypingTime)
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
        let timerTime = ((maxTimeMS - getTimerDelta(startTime))/1000.0).toFixed(1);

        if (timerTime <=0)
        {
            timerTime = 0
            totalTimerCount -= 1;
            setGameStatus("stunned-by-opponent")
            clearInterval(timerIntervalID); // Stop the counter routine until restarted elsewhere
            return timerIntervalID;
        } else if (stopTimerSignal)
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


setGameStatus("start-game")