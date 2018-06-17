let log = console.log;

// Global variables, reflect the state of the game
let elPreviousCard = null;
let flippedCouplesCount = 0;
let gameFirstClicked = false;
let totalGameTime = 0;
let gamerName = "";
let isProcessing = false;
let currentTime = 0;
let setTimeoutID = 0;
let bestTimeDisplay = [0, 0];


/* Indexes
    0 - minute
    1 - second
    2 - hundredth of a second
    3 - thousandths of a second */
let timer = [0, 0, 0, 0];
let interval;
let timerRunning = false;// When the script originally loads, the timer is not running.


// Constants
const TOTAL_COUPLES_COUNT = 8;
const theTimer = document.querySelector(".timer");


// Load an audio file
const audioWin = new Audio('sound/win.mp3');
const audioRight = new Audio("sound/right.mp3");
const audioWrong = new Audio("sound/wrong.mp3");

const board = document.querySelector('.board');
const allCards = document.querySelectorAll('.card');

const resetOrPlayAgain = document.getElementById('resetOrPlayAgain');
const changeTheUser = document.getElementById('changeUser');
const giveUp = document.getElementById('giveUp');

// todo:
//1. why this way it's not working??
//   const divs = document.querySelectorAll('.flipped');
//2. injectCardsToHTML in window.load calling it before prepareEventListeners, the
//   event handlers won't work! why?
//3. maybe add Hundredths section future addition.


//==========================================================Timer Code==============================================
//==================================================================================================================
function leadingZero(time) {
    if(time < 10) {
        time = "0" + time;
    }
    return time;
}

// Run a standard minute/second timer.
function runTimer() {
    currentTime = leadingZero(timer[0]) + ":" + leadingZero(timer[1]);// + ":" + leadingZero(timer[2]);
    theTimer.innerHTML = currentTime;
    timer[3] += 1;
    //log('timer[3]: ' + timer[3]);

    // Doing the time calculation for display, Math.floor --> no decimals
    // (timer[3] / 100)       --> gives seconds
    // (timer[3] / 100) / 60) --> gives minutes
    timer[0] = Math.floor((timer[3] / 100) / 60);
    timer[1] = Math.floor((timer[3] / 100) - (timer[0] * 60));
    /* timer[2] thousandth of a second.
       subtracting timer one times 100, clearing out every time that 
       get to 100 hundredth of a second. Because that's now a second and we need to get back to zero.
       And subtracting timer zero times 6,000. For every time the minutes reach 100
       so it will not start counting upwards from there.*/
    timer[2] = Math.floor(timer[3] - (timer[1] * 100) - (timer[0] * 6000));
    log(timer[0] * 60 + timer[1]);
}

function startTimer() {
    if(!timerRunning) {
        timerRunning = true;
        interval = setInterval(runTimer, 10);
    }
}

function resetTime() {
    clearInterval(interval);
    interval = null;
    timer = [0, 0, 0, 0];
    timerRunning = false;
    theTimer.innerHTML = "00:00";//:00";
}

function stopTime() {
    clearInterval(interval);
    interval = null;
    timer = [0, 0, 0, 0];
    timerRunning = false;
}

//===================================================== Game functions =============================================
//==================================================================================================================
/*function injectCardsToHTML() {
    let html = "";
    for(let i = 1; i <= TOTAL_COUPLES_COUNT; i += 1) {
        for(let j = 0; j < 2; j += 1) {
            html += `<div class="card" data-card="${i}">
                        <img src="img/cards/${i}.png">
                        <img class="back" src="img/cards/back.png">
                    </div>
`;
        }
    }
    return html;
}*/

function checkIfGameFirstClick() {
    if(!gameFirstClicked) {
        gameFirstClicked = true;
    }
}

function formatBestTime(bestTime) {
    if(bestTime > 59) {
        log('inside if');
        bestTimeDisplay[0] =  Math.floor(bestTime / 60);
        log(bestTimeDisplay[0]);
        bestTimeDisplay[1] = bestTime % 60;
        log(bestTimeDisplay[1]);
        bestTime = `${leadingZero(bestTimeDisplay[0])}:${leadingZero(bestTimeDisplay[1])}`;
        bestTimeDisplay = [0, 0];
    } else {
        bestTime = `00:${leadingZero(bestTime)}`;
    }

    return bestTime;
}

function updateUserBestTime() {
    if (localStorage.getItem("bestTime_" + gamerName) === null) {
        localStorage.setItem("bestTime_" + gamerName, totalGameTime);
        document.querySelector(".bestTime").innerHTML = formatBestTime(totalGameTime);
    } else if (totalGameTime < localStorage.getItem("bestTime_" + gamerName)) {
        localStorage.setItem("bestTime_" + gamerName, totalGameTime);
        document.querySelector(".bestTime").innerHTML = formatBestTime(totalGameTime);
    }
}

function shuffleCards() {
    //var board = document.querySelector('.board');
    for (let i = board.children.length; i >= 0; i -= 1) {
        board.appendChild(board.children[Math.random() * i | 0]);
    }
} 

// Flipping to back card side, and randomly arranging all the cards, and reset time
function resetAllCards() {
    let divs = document.querySelectorAll('.flipped');
    for(let i = 0; i < divs.length; i += 1) {
        log("inside resetAllCards for");
        divs[i].classList.remove('flipped');
    }
    gameFirstClicked = false;
    flippedCouplesCount = 0;
    if(setTimeoutID > 0) {
        window.clearTimeout(setTimeoutID);
        setTimeoutID = 0;
        isProcessing = false;
    }
    shuffleCards();
    resetTime();
}

// Registering the gamer in the local storage, if exist getting gamer best time.
// best time and gamer name appears on index.html
function registerGamer(gamerName) {
    if(localStorage.getItem("gamerName_" + gamerName) === null) {
        localStorage.setItem('gamerName_' + gamerName, gamerName);
    } else {
        //converting string to number
        let bestTime = +localStorage.getItem("bestTime_" + gamerName);
        document.querySelector(".bestTime").innerHTML = formatBestTime(bestTime);
    }
    document.querySelector("#playerName").innerHTML = gamerName;
}

function promptGamerName() {
    gamerName = window.prompt("Enter you Name: ");
    if(gamerName === '' || gamerName === null) {
        gamerName = "Anonymous";
    }
    return gamerName;
}

function changeUser() {
    gamerName = promptGamerName();
    registerGamer(gamerName);
    resetAllCards();
}

function flipAllCards() {
    if(setTimeoutID > 0) {
        window.clearTimeout(setTimeoutID);
        setTimeoutID = 0;
        isProcessing = false;
    }
    for(let i = 0; i < allCards.length; i += 1) {
        allCards[i].classList.add('flipped');    
    }
    stopTime();
    setTimeoutID = setTimeout(resetAllCards, 5000);
}

function prepareEventHandlers() {
    for(let i = 0; i < allCards.length; i += 1) {
        // The line below is like using a pipe sending the event to the event funtion hander, but no need for this app.
        // Also have to change the clickingThe card signature as well - function clickingTheCard(event, elCard)
        // allCards[i].addEventListener("click", function(event) { clickingTheCard(event, this); }, false);
        allCards[i].addEventListener("click", function() { clickingTheCard(this); }, false);
        allCards[i].addEventListener("click", startTimer, false);
    }

    resetOrPlayAgain.addEventListener("click", resetAllCards, false);
    giveUp.addEventListener("click", flipAllCards, false);
    // Be aware for naming the function as the same name of object caller ---> cause a collision
    // the event handler is not registered to the button!
    changeTheUser.addEventListener("click", changeUser, false);
}

// After loading all page assets, preparing the game 
window.onload = function() {
    gamerName = promptGamerName();
    registerGamer(gamerName);
    //log(injectCardsToHTML());
    //board.innerHTML = injectCardsToHTML();
    prepareEventHandlers();
    shuffleCards();
};



//======================================================= Main Function ============================================
//==================================================================================================================
// This function is called whenever the user click a card
function clickingTheCard(elCard) {
    // If the user clicked an already flipped card - do nothing and return from the function
    if (elCard.classList.contains('flipped')) {
        return;
    }

    checkIfGameFirstClick();//check if the gamer clicked the first time and starts the clock

    // Flip it
    if (isProcessing === true) {
        return;// Gamer won't be able to flip more then two cards at once
    } else {
        elCard.classList.add('flipped');
    }

    // This is the first flipped card out of the peer, a global variable
    if (elPreviousCard === null) {
        elPreviousCard = elCard;
    } else {
        isProcessing = true;
        // get the data-card attribute's value from both cards
        let card1 = elPreviousCard.getAttribute('data-card');
        let card2 = elCard.getAttribute('data-card');

        // No match, schedule to flip them back in 1 second
        if (card1 !== card2){
            setTimeoutID = setTimeout(function () {
                audioWrong.play();
                elCard.classList.remove('flipped');
                elPreviousCard.classList.remove('flipped');
                elPreviousCard = null;
                isProcessing = false;
            }, 1000);
        } else {
            // Yes! a match!
            flippedCouplesCount += 1;
            elPreviousCard = null;
            isProcessing = false;

            // All cards flipped!
            if (TOTAL_COUPLES_COUNT === flippedCouplesCount) {
                clearInterval(interval);
                totalGameTime = timer[0] * 60 + timer[1];
                updateUserBestTime();//in local storage
                audioWin.play();
            } else {
                audioRight.play();
            }
        }
    }
}