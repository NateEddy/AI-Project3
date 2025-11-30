let deck, playerHand, dealerHand;

function newDeck() {
    let cards = [];
    for (let i = 1; i <= 13; i++) {
        for (let j = 0; j < 4; j++) cards.push(i);
    }
    return cards.sort(() => Math.random() - 0.5);
}

function dealCard() {
    return deck.pop();
}

function handValue(hand) {
    let sum = hand.reduce((a,b) => a + Math.min(b, 10), 0);
    let ace = hand.includes(1);
    if (ace && sum + 10 <= 21) return { value: sum + 10, usableAce: true };
    return { value: sum, usableAce: false };
}

function startGame() {
    deck = newDeck();
    playerHand = [dealCard(), dealCard()];
    dealerHand = [dealCard(), dealCard()];

    render();
}

function hit() {
    playerHand.push(dealCard());
    render();
}

function stand() {
    while (handValue(dealerHand).value < 17)
        dealerHand.push(dealCard());
    evaluate();
}

function evaluate() {
    let p = handValue(playerHand).value;
    let d = handValue(dealerHand).value;

    let result = "Push";
    if (p > 21) result = "Player Busts!";
    else if (d > 21 || p > d) result = "Player Wins!";
    else if (p < d) result = "Dealer Wins!";

    document.getElementById("result").innerText = result;
}

function render() {
    document.getElementById("player-hand").innerText = playerHand.join(", ");
    document.getElementById("dealer-hand").innerText = dealerHand[0] + ", ?";
}
