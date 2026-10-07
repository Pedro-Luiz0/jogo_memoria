// ==========================================
// JOGO DA MEMÓRIA
// ==========================================


// ==========================================
// DADOS DO JOGO VINDOS DO JSON
// ==========================================

let levels = {};
let relatedPairs = [];
let emojiToImage = {};


// ==========================================
// CARREGAR JSON
// ==========================================

async function loadGameData() {

    try {

        const response = await fetch("dados.json");

        if (!response.ok) {
            throw new Error("Não foi possível carregar o arquivo dados.json");
        }

        const data = await response.json();

        levels = data.levels;
        relatedPairs = data.relatedPairs;
        emojiToImage = data.emojiToImage;

        console.log("Dados carregados do JSON:", data);

    } catch (error) {

        console.error("Erro ao carregar dados.json:", error);

        alert(
            "Erro ao carregar os dados do jogo. " +
            "Verifique se o arquivo dados.json existe."
        );
    }
}


// ==========================================
// ELEMENTOS HTML
// ==========================================

const gameBoard = document.getElementById("gameBoard");

const movesElement = document.getElementById("moves");
const timerElement = document.getElementById("timer");
const pairsElement = document.getElementById("pairs");
const totalPairsElement = document.getElementById("totalPairs");
const scoreElement = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");
const playAgainBtn = document.getElementById("playAgainBtn");

const winModal = document.getElementById("winModal");

const finalTime = document.getElementById("finalTime");
const finalMoves = document.getElementById("finalMoves");
const finalScore = document.getElementById("finalScore");

const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const winnerBox = document.getElementById("winnerBox");
const winnerText = document.getElementById("winnerText");

const turnIndicator = document.getElementById("turnIndicator");
const currentPlayerElement = document.getElementById("currentPlayer");

const playersScore = document.getElementById("playersScore");

const player1ScoreElement = document.getElementById("player1Score");
const player2ScoreElement = document.getElementById("player2Score");
const player1PairsElement = document.getElementById("player1Pairs");
const player2PairsElement = document.getElementById("player2Pairs");

// ==========================================
// ESTADO
// ==========================================

// Escolhas vindas das telas de menu (?nivel=dificil&modo=duo)
const params = new URLSearchParams(window.location.search);

let currentLevel = params.get("nivel");

let gameMode = params.get("modo");

let firstCard = null;
let secondCard = null;

let lockBoard = false;

let moves = 0;
let matchedPairs = 0;
let score = 0;

let seconds = 0;
let timerInterval = null;

let gameStarted = false;


// ==========================================
// ESTADO DO 2 PLAYERS
// ==========================================

let currentPlayer = 1;

let player1Score = 0;
let player2Score = 0;

let player1Pairs = 0;
let player2Pairs = 0;


// ==========================================
// INICIAR JOGO
// ==========================================

function startGame(level = currentLevel) {

    currentLevel = level;

    resetGameState();

    const numberOfPairs = levels[level].pairs;

    totalPairsElement.textContent = numberOfPairs;

    gameBoard.innerHTML = "";

    gameBoard.classList.remove("pro");
    gameBoard.classList.remove("expert");


    // Layout Pro
    if (level === "pro") {
        gameBoard.classList.add("pro");
    }

    // Pega somente os pares necessários
    const selectedPairs = relatedPairs.slice(
        0,
        numberOfPairs
    );


    // Transforma os pares em cartas
    const cards = [];

    selectedPairs.forEach((pair, pairId) => {

        cards.push({
            emoji: pair[0],
            pairId: pairId
        });

        cards.push({
            emoji: pair[1],
            pairId: pairId
        });

    });


    // Embaralhar
    shuffle(cards);


    // Criar cartas
    cards.forEach((card, index) => {

        createCard(
            card.emoji,
            card.pairId,
            index
        );

    });


    updateStats();
    updatePlayersScore();
    updateTurn();
    fitBoard();
}


// ==========================================
// RESET
// ==========================================

function resetGameState() {

    clearInterval(timerInterval);

    firstCard = null;
    secondCard = null;

    lockBoard = false;

    moves = 0;
    matchedPairs = 0;
    score = 0;

    seconds = 0;

    gameStarted = false;

    timerInterval = null;


    // Players
    currentPlayer = 1;

    player1Score = 0;
    player2Score = 0;

    player1Pairs = 0;
    player2Pairs = 0;


    timerElement.textContent = "00:00";
}


// ==========================================
// CRIAR CARTA
// ==========================================

function createCard(emoji, pairId, index) {
    const card = document.createElement("button");
    card.classList.add("card");
    card.dataset.emoji = emoji;
    card.dataset.pairId = pairId;
    card.dataset.index = index;

    const frontImage = emojiToImage[emoji] || ""; // Obtém a URL da imagem correspondente ao emoji
    card.innerHTML = `
        <div class="card-inner">
            <div class="card-front"></div>
            <div class="card-back">
                <img src="${frontImage}" alt="Card Image" class="card-image">
            </div>
        </div>
    `;

    card.addEventListener("click", () => flipCard(card));
    gameBoard.appendChild(card);
}


// ==========================================
// VIRAR CARTA
// ==========================================

function flipCard(card) {

    if (lockBoard) return;

    if (card === firstCard) return;

    if (card.classList.contains("matched")) return;


    // Começa cronômetro
    if (!gameStarted) {

        startTimer();

        gameStarted = true;
    }


    card.classList.add("flipped");


    if (!firstCard) {

        firstCard = card;

        return;
    }


    secondCard = card;

    moves++;

    updateStats();

    checkMatch();
}


// ==========================================
// VERIFICAR PAR
// ==========================================

function checkMatch() {

    /*
        Agora o par não precisa ter
        emojis iguais.

        Exemplo:

        🌧️ + ☂️

        Os dois possuem o mesmo pairId.
    */

    const isMatch =
        firstCard.dataset.pairId ===
        secondCard.dataset.pairId;


    if (isMatch) {

        disableMatchedCards();

    } else {

        unflipCards();
    }
}


// ==========================================
// PAR CORRETO
// ==========================================

function disableMatchedCards() {

    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    firstCard.classList.add("disabled");
    secondCard.classList.add("disabled");


    matchedPairs++;


    const points = calculatePoints();

    score += points;


    // 2 PLAYERS
    if (gameMode === "duo") {

        if (currentPlayer === 1) {

            player1Score += points;
            player1Pairs++;

        } else {

            player2Score += points;
            player2Pairs++;

        }

    }


    updateStats();

    updatePlayersScore();


    resetTurn();


    // Verifica vitória
    if (
        matchedPairs ===
        levels[currentLevel].pairs
    ) {

        setTimeout(
            finishGame,
            600
        );

    }

    /*
        IMPORTANTE:

        No modo 2 jogadores, quem acerta
        continua jogando.

        Por isso NÃO trocamos o jogador aqui.
    */
}


// ==========================================
// CARTAS ERRADAS
// ==========================================

function unflipCards() {

    lockBoard = true;


    setTimeout(() => {

        firstCard.classList.remove("flipped");

        secondCard.classList.remove("flipped");


        resetTurn();


        /*
            No modo 2 players:

            Errou = troca de jogador.
        */

        if (gameMode === "duo") {

            changePlayer();

        }

    }, 850);
}


// ==========================================
// RESETAR TURNO
// ==========================================

function resetTurn() {

    firstCard = null;
    secondCard = null;

    lockBoard = false;
}


// ==========================================
// TROCAR JOGADOR
// ==========================================

function changePlayer() {

    currentPlayer =
        currentPlayer === 1
            ? 2
            : 1;


    updateTurn();
}


// ==========================================
// ATUALIZAR TURNO
// ==========================================

function updateTurn() {

    if (gameMode === "solo") {

        turnIndicator.classList.add("hidden");

        return;
    }


    turnIndicator.classList.remove("hidden");


    currentPlayerElement.textContent =
        `Jogador ${currentPlayer}`;


    document
        .querySelector(".player-one")
        .classList.toggle(
            "active-player",
            currentPlayer === 1
        );


    document
        .querySelector(".player-two")
        .classList.toggle(
            "active-player",
            currentPlayer === 2
        );
}


// ==========================================
// PONTUAÇÃO
// ==========================================
// ==========================================
// PONTUAÇÃO
// ==========================================

function calculatePoints() {

    // A pontuação base agora vem do JSON
    let points = levels[currentLevel].basePoints;


    // Bônus por velocidade

    if (seconds < 30) {

        points += 50;

    } else if (seconds < 60) {

        points += 25;

    }


    // Penalidade por muitos movimentos

    if (
        moves >
        levels[currentLevel].pairs * 3
    ) {

        points -= 20;

    }


    return Math.max(points, 10);
}
// ==========================================
// CRONÔMETRO
// ==========================================

function startTimer() {

    timerInterval = setInterval(() => {

        seconds++;

        timerElement.textContent =
            formatTime(seconds);

    }, 1000);
}


// ==========================================
// FORMATAR TEMPO
// ==========================================

function formatTime(totalSeconds) {

    const minutes =
        Math.floor(totalSeconds / 60);

    const remainingSeconds =
        totalSeconds % 60;


    return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;
}


// ==========================================
// ESTATÍSTICAS
// ==========================================

function updateStats() {

    movesElement.textContent = moves;

    pairsElement.textContent =
        matchedPairs;

    scoreElement.textContent =
        score;
}


// ==========================================
// PLACAR DOS PLAYERS
// ==========================================

function updatePlayersScore() {

    player1ScoreElement.textContent =
        player1Score;

    player2ScoreElement.textContent =
        player2Score;


    player1PairsElement.textContent =
        `${player1Pairs} pares`;

    player2PairsElement.textContent =
        `${player2Pairs} pares`;
}


// ==========================================
// VITÓRIA
// ==========================================

function finishGame() {

    clearInterval(timerInterval);


    finalTime.textContent =
        formatTime(seconds);

    finalMoves.textContent =
        moves;

    finalScore.textContent =
        score;


    // SOLO
    if (gameMode === "solo") {

        modalTitle.textContent =
            "Parabéns! 🏆";

        modalMessage.textContent =
            "Você encontrou todos os pares!";

        winnerBox.classList.add("hidden");

    }


    // 2 PLAYERS
    else {

        winnerBox.classList.remove("hidden");


        if (player1Score > player2Score) {

            modalTitle.textContent =
                "Jogador 1 venceu! 🏆";

            modalMessage.textContent =
                "Parabéns! Jogador 1 encontrou mais pares.";

            winnerText.textContent =
                "Jogador 1 é o vencedor!";

        }

        else if (player2Score > player1Score) {

            modalTitle.textContent =
                "Jogador 2 venceu! 🏆";

            modalMessage.textContent =
                "Parabéns! Jogador 2 encontrou mais pares.";

            winnerText.textContent =
                "Jogador 2 é o vencedor!";

        }

        else {

            modalTitle.textContent =
                "Empate! 🤝";

            modalMessage.textContent =
                "Os dois jogadores tiveram a mesma pontuação.";

            winnerText.textContent =
                "Deu empate!";

        }

    }


    winModal.classList.remove("hidden");
}


// ==========================================
// EMBARALHAR
// ==========================================

function shuffle(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const randomIndex =
            Math.floor(
                Math.random() * (i + 1)
            );


        [
            array[i],
            array[randomIndex]
        ] = [
            array[randomIndex],
            array[i]
        ];

    }

    return array;
}


// ==========================================
// REINICIAR
// ==========================================

restartBtn.addEventListener(
    "click",
    () => {

        winModal.classList.add("hidden");

        startGame(currentLevel);

    }
);


// ==========================================
// JOGAR NOVAMENTE
// ==========================================

playAgainBtn.addEventListener(
    "click",
    () => {

        winModal.classList.add("hidden");

        startGame(currentLevel);

    }
);


// ==========================================
// AJUSTAR TABULEIRO À TELA (sem rolagem)
// ==========================================

function fitBoard() {

    const total = gameBoard.children.length;

    if (!total) return;

    const style = getComputedStyle(gameBoard);
    const gap = parseFloat(style.columnGap) || 0;
    const pad = parseFloat(style.paddingLeft) || 0;

    const width = gameBoard.clientWidth - pad * 2;
    const height = gameBoard.clientHeight - pad * 2;

    // Testa cada número de colunas e fica com a que deixa as cartas maiores
    let best = { size: 0, cols: 1 };

    for (let cols = 1; cols <= total; cols++) {

        const rows = Math.ceil(total / cols);

        const size = Math.min(
            (width - gap * (cols - 1)) / cols,
            (height - gap * (rows - 1)) / rows
        );

        if (size > best.size) best = { size, cols };
    }

    const size = Math.max(Math.floor(Math.min(best.size, 150)), 0);

    gameBoard.style.setProperty("--card-size", size + "px");
    gameBoard.style.gridTemplateColumns = `repeat(${best.cols}, ${size}px)`;
}

// Recalcula ao girar/redimensionar a tela
new ResizeObserver(fitBoard).observe(gameBoard);



// INICIALIZAÇÃO


async function initializeGame() {

    // Primeiro carrega os dados do JSON
    await loadGameData();


    // Verifica se os dados foram carregados

    if (
        Object.keys(levels).length === 0 ||
        relatedPairs.length === 0
    ) {

        console.error(
            "Os dados do jogo não foram carregados."
        );

        return;
    }


    // Verifica se o nível é válido

    if (!levels[currentLevel]) {

        window.location.replace("index.html");

        return;
    }


    // Verifica o modo de jogo

    if (
        gameMode !== "solo" &&
        gameMode !== "duo"
    ) {

        window.location.replace(
            "modo.html?nivel=" + currentLevel
        );

        return;
    }


    // Mostra informações do jogo

    document.getElementById("gameInfo").textContent =
        `${levels[currentLevel].name} · ${
            gameMode === "duo"
                ? "2 jogadores"
                : "1 jogador"
        }`;


    // Mostra placar de dois jogadores somente
    // quando o modo for duo

    playersScore.classList.toggle(
        "hidden",
        gameMode !== "duo"
    );


    // Inicia o jogo

    startGame(currentLevel);
}


// ==========================================
// INICIAR APLICAÇÃO
// ==========================================

initializeGame();
