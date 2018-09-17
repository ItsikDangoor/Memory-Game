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


window.onload = function() {
    gamerName = promptGamerName();
    registerGamer(gamerName);
    //log(injectCardsToHTML());
    //board.innerHTML = injectCardsToHTML();
    prepareEventHandlers();
    shuffleCards();
};

//To Do:
//initialize all variables after 'give up' action(Flipping cards)
