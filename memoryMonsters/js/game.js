var log = console.log;

// Global variables, reflect the state of the game
var elPreviousCard = null;
var flippedCouplesCount = 0;
var gameFirstClicked = false;
var startGameTime = 0;
var endGameTime = 0;
var totalGameTime = 0;
var gamerName = "";
var isProcessing = false;


/* Indexs
    0 - minute
    1 - second
    2 - hundredth of a second
    3 - thousandths of a second */
var timer = [0, 0, 0, 0];
var interval;
var timerRunning = false;// When the script originally loads, the timer is not running.


// Constants
const TOTAL_COUPLES_COUNT = 8;
const theTimer = document.querySelector(".timer");


// Load an audio file
var audioWin = new Audio('sound/win.mp3');
var audioRight = new Audio("sound/right.mp3");
var audioWrong = new Audio("sound/wrong.mp3");


//==========================================================Timer Code==============================================
//==================================================================================================================
function leadingZero(time) {
    if(time < 10) {
        time = "0" + time;
    }
    return time;
}

// Run a standard minute/second timer.
// Hundredths section future addtion.
function runTimer() {
    let currentTime = leadingZero(timer[0]) + ":" + leadingZero(timer[1]);// + ":" + leadingZero(timer[2]);
    theTimer.innerHTML = currentTime;
    timer[3] += 1;

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
}

function startTimer() {
    if(!timerRunning) {
        timerRunning = true;
        /*The problem is, need to do stop the interval from outside the start function and can not do it
          because theres no way of referring to the interval to begin with,so if trying to stop it,
          will bring to stop some other interval that's running and nothing will work.
          But the solution is simple!
          Global variable called interval, put set interval inside that variable, this variable 
          now effectively is the set interval function. That means, if will use a clear interval 
          function on interval, what in fact will be using it on set interval and clearing this interval.*/
        /*setInterval(runTimer, 10);*/ //runs every thousands of a second//the older version
        interval = setInterval(runTimer, 10);
    }
}

function resetTime() {
    /* First, reset the interval timer that runs in the background. That's that setInterval timer that sits inside the interval variable,
       so will just clearInterval,interval. This just ensures the browser's not running in interval in the background after starting 
       a new one because that would just waste a lot of resources.

       Next grab the interval variable and set it to null.
       doing this so that when reassigning set interval the next time starting the app it is not setting up a new interval with 
       a new index number because then again it be running multiple processes in the browser simultaneously and waste a lot of resources. */
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
function checkIfGameFirstClick() {
    if(!gameFirstClicked) {
        gameFirstClicked = true;
        startGameTime = Date.now();
    }
}

function updateUserBestTime() {
    if (localStorage.getItem("bestTime_" + gamerName) === null) {
        localStorage.setItem("bestTime_" + gamerName, totalGameTime);
        document.querySelector(".bestTime").innerHTML = totalGameTime;
    } else if (totalGameTime < localStorage.getItem("bestTime_" + gamerName)) {
        localStorage.setItem("bestTime_" + gamerName, totalGameTime);
        document.querySelector(".bestTime").innerHTML = totalGameTime;
    }
}

function toggleVisibility(id) {
       var e = document.getElementById(id);
       if(e.style.display === 'inline-block')
          e.style.display = 'none';
       else
          e.style.display = 'inline-block';
}

function shuffleCards() {
    var board = document.querySelector('.board');
    for (var i = board.children.length; i >= 0; i--) {
        board.appendChild(board.children[Math.random() * i | 0]);
    }
} 

// Flipping to back card side, and randomly arranging all the cards, and reset time
function resetAllCards() {
    var divs = document.querySelectorAll('.flipped');
    for(let i = 0; i < divs.length; i += 1) {
        divs[i].classList.remove('flipped');
    }
    gameFirstClicked = false;
    flippedCouplesCount = 0; 
    document.querySelector('#resetOrPlayAgain').style.display = 'none';
    shuffleCards();
    resetTime();
}

// Registering the gamer in the local storage, if exist getting gamer best time.
// best time and gamer name appears on game.html
function registerGamer(gamerName) {
    if(localStorage.getItem("gamerName_" + gamerName) === null) {
        localStorage.setItem('gamerName_' + gamerName, gamerName);
    } else {
        document.querySelector(".bestTime").innerHTML = localStorage.getItem("bestTime_" + gamerName);
    }
    document.querySelector("#playerName").innerHTML = gamerName;
}

function changeUser() {
    gamerName = prompt("Enter you Name: ");
    registerGamer(gamerName);
    resetAllCards();
}

function flipAllCards() {
    var allCards = document.querySelectorAll('.card');
    for(let i = 0; i < allCards.length; i += 1)
    {
        allCards[i].classList.add('flipped');    
    }
    stopTime();
}

function prepareEventHandlers() {
    var allCards = document.querySelectorAll('.card');
    var resetOrPlayAgain = document.getElementById('resetOrPlayAgain');
    var changeTheUser = document.getElementById('changeUser');
    var giveUp = document.getElementById('giveUp');

    for(let i = 0; i < allCards.length; i += 1)
    {
        // The line below is like using a pipe sending the event to the event funtion hander, but no need for this app.
        // Also have to change the clickingTHe card signature as well - function clickingTheCard(event, elCard)
        // allCards[i].addEventListener("click", function(event) { clickingTheCard(event, this); }, false);
        allCards[i].addEventListener("click", function() { clickingTheCard(this); }, false);
        allCards[i].addEventListener("click", startTimer, false);
    }

    resetOrPlayAgain.addEventListener("click", resetAllCards, false);
    giveUp.addEventListener("click", flipAllCards, false);
    // Be aware for naming the function as the same name of object caller ---> cause a collision
    // the event handler is not registed to the button!
    changeTheUser.addEventListener("click", changeUser, false);
}

// After loading all page assets, preparing the game 
window.onload = function() {
    gamerName = prompt("Enter your name:");
    registerGamer(gamerName);
    prepareEventHandlers();
}



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
        var card1 = elPreviousCard.getAttribute('data-card');
        var card2 = elCard.getAttribute('data-card');

        // No match, schedule to flip them back in 1 second
        if (card1 !== card2){
            setTimeout(function () {
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
                endGameTime = Date.now();
                totalGameTime = Math.floor((endGameTime - startGameTime)/1000);
                clearInterval(interval);
                updateUserBestTime();//in local storage
                toggleVisibility("resetOrPlayAgain");
                audioWin.play();
            } else {
                audioRight.play();
            }
        }
    }
}