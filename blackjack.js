let deck, playerHand, dealerHand;

function newDeck() {
    let cards = [];
    for (let i = 1; i <= 13; i++) {
        for (let j = 0; j < 4; j++) cards.push(i);
    }

    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    return cards;
}

function dealCard() {
    return deck.pop();
}

function cardToString(card) {
    if (card === 1) return "A";
    if (card === 11) return "J";
    if (card === 12) return "Q";
    if (card === 13) return "K";
    return card;
}

function handValue(hand) {
    let sum = hand.reduce((a,b) => a + Math.min(b,10), 0);
    let ace = hand.includes(1);
    if (ace && sum + 10 <= 21) return { value: sum + 10, aceCard: true };
    return { value: sum, aceCard: false };
}

function startGame() {
    deck = newDeck();
    playerHand = [dealCard(), dealCard()];
    dealerHand = [dealCard(), dealCard()];

    document.getElementById("result").innerText = "";
    render();
}

function hit() {
    playerHand.push(dealCard());
    let playerVal = handValue(playerHand).value;
    if (playerVal > 21) stand();
    else render();
}

function stand() {
    while (handValue(dealerHand).value < 17) dealerHand.push(dealCard());
    evaluate();
}

function evaluate() {
    let p = handValue(playerHand).value;
    let d = handValue(dealerHand).value;

    let result = "Push";
    if (p > 21) result = "Player Busts! Dealer Wins!";
    else if (d > 21) result = "Dealer Busts! Player Wins!";
    else if (p > d) result = "Player Wins!";
    else if (p < d) result = "Dealer Wins!";

    document.getElementById("result").innerText = result;
    render(true); 
}

function render(revealDealer=false) {
    document.getElementById("player-hand").innerText =
        playerHand.map(cardToString).join(", ");

    if (revealDealer) {
        document.getElementById("dealer-hand").innerText =
            dealerHand.map(cardToString).join(", ");
    } else {
        document.getElementById("dealer-hand").innerText =
            cardToString(dealerHand[0]) + ", ?";
    }
}

startGame();
