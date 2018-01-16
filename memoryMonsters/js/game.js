var log = console.log;

// Those are global variables, they stay alive and reflect the state of the game
var elPreviousCard = null;
var flippedCouplesCount = 0;
var gameFirstClicked = false;
var startGameTime = 0;
var endGameTime = 0;
var totalGameTime = 0;
var gamerName = "";
var isProcessing = false;

// This is a constant that we dont change during the game (we mark those with CAPITAL letters)
var TOTAL_COUPLES_COUNT = 8;

// Load an audio file
var audioWin = new Audio('sound/win.mp3');
var audioRight = new Audio("sound/right.mp3");
var audioWrong = new Audio("sound/wrong.mp3");



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

//flipping to back card side, and randomly arranging all the cards
function resetAllCards() {
    var divs = document.querySelectorAll('.flipped');
    for(let i = 0; i < divs.length; i += 1) {
        divs[i].classList.remove('flipped');
    }
    gameFirstClicked = false;
    flippedCouplesCount = 0; 
    document.querySelector('#playAgainButton').style.display = 'none';
    shuffleCards();
}

//registering the gamer in the local storage, if exist getting gamer best time
//best time and gamer name appears on game.html
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

//after the page is loaded and ready to use
window.onload = function() {
    gamerName = prompt("Enter your name:");
    registerGamer(gamerName);
}


// --- Main function ---
// This function is called whenever the user click a card
function cardClicked(elCard) {
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

    // This is a first card that flipped, only keep it in the global variable
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

                updateUserBestTime();//in local storage
                toggleVisibility("playAgainButton");
                audioWin.play();
            } else {
                audioRight.play();
            }
        }
    }
}