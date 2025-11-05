document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Get DOM Elements ---
    const splashScreen = document.getElementById('splash-screen');
    const mainMenu = document.getElementById('main-menu');
    const choicePhase = document.getElementById('choice-phase');
    const spinPhase = document.getElementById('spin-phase');
    const resultsScreen = document.getElementById('results-screen');

    const startBtn = document.getElementById('start-btn');
    const retryBtn = document.getElementById('retry-btn');
    const cards = document.querySelectorAll('.card');
    const timerDisplay = document.getElementById('timer');
    
    const wheelSpinner = document.getElementById('wheel-spinner');
    const playerChoiceDisplay = document.getElementById('player-choice-display');
    const resultMessage = document.getElementById('result-message');

    // --- 2. Game State Variables ---
    let playerChoice = '';
    let gamesSinceLastWin = 0;
    let choiceTimer; // Holds the 5-second timer
    let countdownInterval; // Holds the 1-second interval for UI
    
    const choices = ['rock', 'paper', 'scissors'];
    
    // This MUST match the hardcoded HTML layout
    // 18 slots, 6 of each choice
    const wheelSlotData = [
        'rock', 'paper', 'scissors', 
        'rock', 'paper', 'scissors',
        'rock', 'paper', 'scissors', 
        'rock', 'paper', 'scissors',
        'rock', 'paper', 'scissors', 
        'rock', 'paper', 'scissors'
    ];
    const wheelSlots = 18;

    // --- 3. Game Flow Functions ---

    /**
     * Starts the game, shows splash for 4s, then main menu.
     */
    function initGame() {
        setTimeout(() => {
            splashScreen.style.display = 'none';
            mainMenu.style.display = 'flex';
        }, 4000); // Splash screen duration
    }

    /**
     * Hides other screens, shows choice phase, and starts the 5s timer.
     */
    function startChoicePhase() {
        // Hide other screens
        mainMenu.style.display = 'none';
        resultsScreen.style.display = 'none';
        
        // Show choice screen
        choicePhase.style.display = 'flex';

        // Force "pop" animation to replay
        cards.forEach(card => {
            card.style.animation = 'none';
            card.offsetHeight; // Trigger a reflow
            card.style.animation = null; 
        });

        // Start the 5-second timer
        startChoiceTimer();
    }

    /**
     * Handles the 5-second timer logic.
     */
    function startChoiceTimer() {
        // Clear any old timers
        clearTimeout(choiceTimer);
        clearInterval(countdownInterval);

        let timeLeft = 5;
        timerDisplay.textContent = timeLeft;

        // Update UI every second
        countdownInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);

        // Set main timer: If 5s pass, REPEAT this phase
        choiceTimer = setTimeout(() => {
            startChoicePhase(); // Repeats the phase immediately
        }, 5000);
    }

    /**
     * Called when a player clicks a card.
     */
    function selectCard(e) {
        // Stop the 5-second timer
        clearTimeout(choiceTimer);
        clearInterval(countdownInterval);

        playerChoice = e.currentTarget.dataset.choice;
        startSpinPhase();
    }

    /**
     * Shows the spinning wheel phase.
     */
    function startSpinPhase() {
        choicePhase.style.display = 'none';
        spinPhase.style.display = 'flex';

        // Display player's choice
        playerChoiceDisplay.innerHTML = `You chose: <i class="fas ${getIconClass(playerChoice)}"></i>`;
        
        // Start the spin
        spinWheel();
    }

    /**
     * Main logic for spinning the wheel and determining the result.
     */
    function spinWheel() {
        // 1. Determine computer's choice (with forced win logic)
        const computerChoice = getComputerChoice();

        // 2. Find a target slot on the wheel that matches the computer's choice
        let possibleIndices = [];
        wheelSlotData.forEach((slot, index) => {
            if (slot === computerChoice) {
                possibleIndices.push(index);
            }
        });
        const targetSlotIndex = possibleIndices[Math.floor(Math.random() * possibleIndices.length)];

        // 3. Calculate rotation
        const sectorAngle = 360 / wheelSlots; // 20 degrees
        const targetRotation = (targetSlotIndex * sectorAngle); // e.g., slot 1 (20deg), slot 2 (40deg)
        const randomOffset = (Math.random() - 0.5) * (sectorAngle * 0.8); // Small offset
        const baseSpins = 360 * 6; // At least 6 full spins
        
        // We spin counter-clockwise, so we use negative values
        const finalAngle = -(baseSpins + targetRotation + randomOffset);

        // 4. Reset wheel and apply spin
        // Reset (no transition)
        wheelSpinner.style.transition = 'none';
        wheelSpinner.style.transform = 'rotate(0deg)';
        wheelSpinner.offsetHeight; // Trigger reflow to apply reset

        // Spin (with transition)
        wheelSpinner.style.transition = 'transform 6s cubic-bezier(0.2, 0.8, 0.4, 1)';
        wheelSpinner.style.transform = `rotate(${finalAngle}deg)`;

        // 5. Set timer to show results after spin finishes
        setTimeout(() => {
            showResults(computerChoice);
        }, 6500); // 6s for spin + 0.5s buffer
    }

    /**
     * Determines the computer's choice, forcing a win if needed.
     */
    function getComputerChoice() {
        // FORCED WIN: If 4 or more games since last win, force a loss for the computer.
        if (gamesSinceLastWin >= 4) {
            if (playerChoice === 'rock') return 'scissors';
            if (playerChoice === 'paper') return 'rock';
            if (playerChoice === 'scissors') return 'paper';
        }
        
        // Standard random choice
        return choices[Math.floor(Math.random() * choices.length)];
    }

    /**
     * Displays the result message and "Try Again" button.
     */
    function showResults(computerChoice) {
        spinPhase.style.display = 'none';
        resultsScreen.style.display = 'flex';

        const result = getWinner(playerChoice, computerChoice);

        if (result === 'win') {
            resultMessage.textContent = "YOU WON! PLEASE TRY AGAIN FOR ANOTHER WIN!";
            gamesSinceLastWin = 0; // Reset counter
        } else if (result === 'loss') {
            resultMessage.textContent = "YOU LOST! TRY AGAIN PLEASE!";
            gamesSinceLastWin++; // Increment counter
        } else { // 'draw'
            resultMessage.textContent = "IT'S A DRAW! TRY AGAIN!";
            gamesSinceLastWin++; // Increment counter
        }
    }

    /**
     * Compares two choices and returns 'win', 'loss', or 'draw'.
     */
    function getWinner(player, computer) {
        if (player === computer) return 'draw';

        if (
            (player === 'rock' && computer === 'scissors') ||
            (player === 'paper' && computer === 'rock') ||
            (player === 'scissors' && computer === 'paper')
        ) {
            return 'win';
        }

        return 'loss';
    }

    /**
     * Helper to get Font Awesome icon class from choice name.
     */
    function getIconClass(choice) {
        if (choice === 'rock') return 'fa-hand-rock';
        if (choice === 'paper') return 'fa-file-alt';
        if (choice === 'scissors') return 'fa-cut';
    }


    // --- 4. Event Listeners ---
    startBtn.addEventListener('click', startChoicePhase);
    retryBtn.addEventListener('click', startChoicePhase); // Returns to choice phase
    cards.forEach(card => card.addEventListener('click', selectCard));

    // --- 5. Start Game ---
    initGame();
});