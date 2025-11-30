// Q[state][action] = value
let Q = {};

function getState(playerValue, dealerUp, usableAce) {
    return `${playerValue}_${dealerUp}_${usableAce ? 1 : 0}`;
}

const actions = ["hit", "stand"];

function epsilonGreedy(state, epsilon=0.1) {
    if (Math.random() < epsilon) return actions[Math.floor(Math.random()*2)];
    if (!Q[state]) Q[state] = { hit: 0, stand: 0 };
    return Q[state].hit > Q[state].stand ? "hit" : "stand";
}

function trainAgent(episodes) {
    let log = "";
    for (let ep = 0; ep < episodes; ep++) {
        let trajectory = [];

        // Play a full episode
        deck = newDeck();
        playerHand = [dealCard(), dealCard()];
        dealerHand = [dealCard(), dealCard()];

        let state, action;
        while (true) {
            let { value, usableAce } = handValue(playerHand);
            if (value > 21) break;

            state = getState(value, dealerHand[0], usableAce);
            action = epsilonGreedy(state);

            trajectory.push({state, action});

            if (action === "hit") {
                playerHand.push(dealCard());
            } else break;
        }

        // Determine reward
        let reward = simulateDealerAndReward();

        // Monte Carlo update
        let G = reward;
        for (let step of trajectory) {
            if (!Q[step.state]) Q[step.state] = { hit: 0, stand: 0 };
            Q[step.state][step.action] += 0.1 * (G - Q[step.state][step.action]);
        }
    }

    document.getElementById("log").innerText = "Training complete.";
}

function simulateDealerAndReward() {
    let p = handValue(playerHand).value;
    while (handValue(dealerHand).value < 17) dealerHand.push(dealCard());
    let d = handValue(dealerHand).value;
    if (p > 21) return -1;
    if (d > 21) return 1;
    if (p > d) return 1;
    if (p < d) return -1;
    return 0;
}
