// ==========================================
// JOGO DA MEMÓRIA
// ==========================================

// Configuração dos níveis
const levels = {
    facil: {
        name: "Fácil",
        pairs: 4
    },

    medio: {
        name: "Médio",
        pairs: 6
    },

    dificil: {
        name: "Difícil",
        pairs: 8
    },

    pro: {
        name: "Pro",
        pairs: 12
    }
};

// Emojis usados nas cartas
const emojis = [
    "🍎",
    "🍕",
    "🚀",
    "🐱",
    "⚽",
    "🎮",
    "🌟",
    "🦄",
    "🍔",
    "🎵",
    "🔥",
    "🌈"
];

// Elementos do HTML
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

const levelButtons = document.querySelectorAll(".level-btn");

// Estado do jogo
let currentLevel = "facil";

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
// INICIAR JOGO
// ==========================================

function startGame(level = currentLevel) {

    currentLevel = level;

    resetGameState();

    const numberOfPairs = levels[level].pairs;

    totalPairsElement.textContent = numberOfPairs;

    gameBoard.innerHTML = "";

    // Ajusta o layout do nível Pro
    if (level === "pro") {
        gameBoard.classList.add("pro");
    } else {
        gameBoard.classList.remove("pro");
    }

    // Seleciona os emojis necessários
    const selectedEmojis = emojis.slice(0, numberOfPairs);

    // Cria os pares
    const cards = [...selectedEmojis, ...selectedEmojis];

    // Embaralha
    shuffle(cards);

    // Cria as cartas
    cards.forEach((emoji, index) => {
        createCard(emoji, index);
    });

    updateStats();
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

    timerElement.textContent = "00:00";
}


// ==========================================
// CRIAR CARTA
// ==========================================

function createCard(emoji, index) {

    const card = document.createElement("button");

    card.classList.add("card");

    card.dataset.emoji = emoji;
    card.dataset.index = index;

    card.innerHTML = `
        <div class="card-inner">

            <div class="card-front">
                ?
            </div>

            <div class="card-back">
                ${emoji}
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

    // Impede cliques inválidos
    if (lockBoard) return;

    if (card === firstCard) return;

    if (card.classList.contains("matched")) return;

    // Começa o cronômetro no primeiro clique
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

    const isMatch =
        firstCard.dataset.emoji === secondCard.dataset.emoji;

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

    // Pontuação
    score += calculatePoints();

    updateStats();

    resetTurn();

    // Verifica vitória
    if (matchedPairs === levels[currentLevel].pairs) {

        setTimeout(finishGame, 500);
    }
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
// PONTUAÇÃO
// ==========================================

function calculatePoints() {

    const basePoints = {
        facil: 100,
        medio: 150,
        dificil: 200,
        pro: 300
    };

    let points = basePoints[currentLevel];

    // Bônus por velocidade
    if (seconds < 30) {
        points += 50;
    } else if (seconds < 60) {
        points += 25;
    }

    // Penalidade por muitos movimentos
    if (moves > levels[currentLevel].pairs * 3) {
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

        timerElement.textContent = formatTime(seconds);

    }, 1000);
}


// ==========================================
// FORMATAR TEMPO
// ==========================================

function formatTime(totalSeconds) {

    const minutes = Math.floor(totalSeconds / 60);

    const remainingSeconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}


// ==========================================
// ATUALIZAR ESTATÍSTICAS
// ==========================================

function updateStats() {

    movesElement.textContent = moves;

    pairsElement.textContent = matchedPairs;

    scoreElement.textContent = score;
}


// ==========================================
// VITÓRIA
// ==========================================

function finishGame() {

    clearInterval(timerInterval);

    finalTime.textContent = formatTime(seconds);

    finalMoves.textContent = moves;

    finalScore.textContent = score;

    winModal.classList.remove("hidden");
}


// ==========================================
// EMBARALHAR
// ==========================================

function shuffle(array) {

    for (let i = array.length - 1; i > 0; i--) {

        const randomIndex = Math.floor(Math.random() * (i + 1));

        [array[i], array[randomIndex]] =
            [array[randomIndex], array[i]];
    }

    return array;
}


// ==========================================
// BOTÕES DE NÍVEL
// ==========================================

levelButtons.forEach(button => {

    button.addEventListener("click", () => {

        const level = button.dataset.level;

        // Remove seleção anterior
        levelButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        // Seleciona o atual
        button.classList.add("active");

        // Fecha modal
        winModal.classList.add("hidden");

        // Inicia novo jogo
        startGame(level);
    });
});


// ==========================================
// REINICIAR
// ==========================================

restartBtn.addEventListener("click", () => {

    winModal.classList.add("hidden");

    startGame(currentLevel);
});


// ==========================================
// JOGAR NOVAMENTE
// ==========================================

playAgainBtn.addEventListener("click", () => {

    winModal.classList.add("hidden");

    startGame(currentLevel);
});


// ==========================================
// INICIALIZAÇÃO
// ==========================================

startGame("facil");