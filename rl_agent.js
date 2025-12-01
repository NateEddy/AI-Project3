// --- RL Agent ---
let Q = {};
const actions = ["hit", "stand"];

function getState(playerValue, dealerUp, usableAce) {
    return `${playerValue}_${dealerUp}_${usableAce ? 1 : 0}`;
}

function greedy(state, epsilon=0.1) {
    if (Math.random() < epsilon) return actions[Math.floor(Math.random()*2)];
    if (!Q[state]) Q[state] = { hit: 0, stand: 0 };
    return Q[state].hit > Q[state].stand ? "hit" : "stand";
}

// Monte Carlo training with reward tracking for learning curve
function trainAgent(episodes, logInterval=500) {
    let rewards = [];
    let totalReward = 0;

    for (let ep = 1; ep <= episodes; ep++) {
        deck = newDeck();
        playerHand = [dealCard(), dealCard()];
        dealerHand = [dealCard(), dealCard()];

        let trajectory = [];
        while (true) {
            let { value, usableAce } = handValue(playerHand);
            if (value > 21) break;

            let state = getState(value, dealerHand[0], usableAce);
            let action = greedy(state);

            trajectory.push({state, action});

            if (action === "hit") playerHand.push(dealCard());
            else break;
        }

        let reward = simulateDealerAndReward();
        totalReward += reward;

        for (let step of trajectory) {
            if (!Q[step.state]) Q[step.state] = { hit: 0, stand: 0 };
            Q[step.state][step.action] += 0.1 * (reward - Q[step.state][step.action]);
        }

        if (ep % logInterval === 0) {
            rewards.push({episode: ep, avgReward: totalReward / ep});
        }
    }

document.getElementById("log").innerText =
    `\nEpisodes: ${episodes}\nFinal average reward: ${(totalReward / episodes).toFixed(3)}`;
    return rewards;
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

function learningGraph(data) {
    const canvas = document.getElementById("learningCurve");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const maxReward = Math.max(...data.map(d => d.avgReward));
    const minReward = Math.min(...data.map(d => d.avgReward));
    const margin = 40;
    const width = canvas.width - margin*2;
    const height = canvas.height - margin*2;

    ctx.beginPath();
    ctx.moveTo(margin, canvas.height - margin);
    for (let i = 0; i < data.length; i++) {
        const x = margin + (i / (data.length-1)) * width;
        const y = canvas.height - margin - ((data[i].avgReward - minReward) / (maxReward - minReward)) * height;
        ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, canvas.height-margin);
    ctx.lineTo(canvas.width-margin, canvas.height-margin);
    ctx.stroke();
}

function trainAndPlot(episodes) {
    const data = trainAgent(episodes, Math.floor(episodes/100));
    learningGraph(data);
}

function agentPlay() {
    deck = newDeck();
    playerHand = [dealCard(), dealCard()];
    dealerHand = [dealCard(), dealCard()];

    document.getElementById("result").innerText = "";
    document.getElementById("log").innerText = "";
    render();

    function agentTurn() {
        let { value, usableAce } = handValue(playerHand);
        if (value > 21) { stand(); return; }

        let state = getState(value, dealerHand[0], usableAce);
        let action = greedy(state, 0);
        logAction("Player chooses: " + action);

        if (action === "hit") {
            playerHand.push(dealCard());
            render();
            setTimeout(agentTurn, 500);
        } else {
            stand();
        }
    }

    function logAction(text) {
        document.getElementById("log").innerText += text + "\n";
    }

    agentTurn();
}

function agentPlayMore(rounds) {
    let wins = 0, losses = 0, draws = 0;
    let currentRound = 0;
    document.getElementById("log").innerText = "";
    document.getElementById("result").innerText = "Playing rounds...";

    function playRound() {
        deck = newDeck();
        playerHand = [dealCard(), dealCard()];
        dealerHand = [dealCard(), dealCard()];

        function agentTurn() {
            let { value, usableAce } = handValue(playerHand);
            if (value > 21) { finishRound(-1); return; }

            let state = getState(value, dealerHand[0], usableAce);
            let action = greedy(state, 0);

            if (action === "hit") {
                playerHand.push(dealCard());
                setTimeout(agentTurn, 0);
            } else {
                finishRound(simulateDealerAndReward());
            }
        }

        function finishRound(reward) {
            if (reward > 0) wins++;
            else if (reward < 0) losses++;
            else draws++;

            currentRound++;
            document.getElementById("result").innerText =
                `Round ${currentRound}/${rounds} - Wins: ${wins}, Losses: ${losses}, Draws: ${draws}`;

            if (currentRound < rounds) setTimeout(playRound, 0);
            else document.getElementById("log").innerText =
                `Win rate: ${(wins/rounds*100).toFixed(2)}%`;
        }

        agentTurn();
    }

    playRound();
}
