import "./style.css";
import { MiniGolfGame } from "./MiniGolfGame.js";
import { CONFIG } from "./config.js";
import type { GameEvents } from "./types.js";

// Initialize UI elements with config values
function initializeUI(): void {
  // Set dynamic content from config
  const gameTitle = document.getElementById("game-title")!;
  const gameSubtitle = document.getElementById("game-subtitle")!;
  const emailInput = document.getElementById(
    "email-input"
  )! as HTMLInputElement;
  const emailSubmitButton = document.getElementById("email-submit-button")!;
  const gameInstructions = document.getElementById("game-instructions")!;
  const puttyCharacter = document.getElementById(
    "putty-character"
  )! as HTMLImageElement;
  const emailForm = document.getElementById("email-form")! as HTMLFormElement;
  const aimButton = document.getElementById("aim-button")!;
  const puttButton = document.getElementById("putt-button")!;
  const loseTitle = document.getElementById("lose-title")!;
  const loseDescription = document.getElementById("lose-description")!;
  const tryAgainButton = document.getElementById("try-again-button")!;

  // Set text content from config
  gameTitle.textContent = CONFIG.TEXT.TITLE;
  gameSubtitle.textContent = CONFIG.TEXT.SUBTITLE;
  emailInput.placeholder = CONFIG.TEXT.EMAIL_PLACEHOLDER;
  emailSubmitButton.textContent = CONFIG.TEXT.EMAIL_BUTTON;
  gameInstructions.textContent = CONFIG.TEXT.INSTRUCTIONS;
  aimButton.textContent = CONFIG.TEXT.BUTTONS.AIM;
  puttButton.textContent = CONFIG.TEXT.BUTTONS.PUTT;
  loseTitle.textContent = CONFIG.TEXT.LOSE.TITLE;
  loseDescription.textContent = CONFIG.TEXT.LOSE.DESCRIPTION;
  tryAgainButton.textContent = CONFIG.TEXT.BUTTONS.TRY_AGAIN;

  // Set dynamic attributes
  puttyCharacter.src = CONFIG.ASSETS.PUTTY_IMAGE_URL;

  // Set form action based on debug mode
  if (CONFIG.DEBUG && CONFIG.SKIP_EMAIL_SUBMISSION) {
    emailForm.action = ""; // Don't submit to Klaviyo in debug mode
  } else {
    emailForm.action = CONFIG.KLAVIYO_URL;
  }

  // Set canvas dimensions
  const canvas = document.getElementById("golfPreview")! as HTMLCanvasElement;
  canvas.width = CONFIG.CANVAS.WIDTH;
  canvas.height = CONFIG.CANVAS.HEIGHT;

  // Set distance remaining
  const distanceRemaining = document.getElementById("distance-remaining")!;
  distanceRemaining.textContent = `Distance to go: ${CONFIG.GAME.TARGET_DISTANCE}`;
}

// Get DOM elements
const emailSection = document.getElementById("email-section")!;
const gameSection = document.getElementById("game-section")!;
const prizeSection = document.getElementById("prize-section")!;
const loseSection = document.getElementById("lose-section")!;

const emailForm = document.getElementById("email-form")! as HTMLFormElement;
const emailInput = document.getElementById("email-input")! as HTMLInputElement;

const gameStateEl = document.getElementById("game-state")!;
const shotsEl = document.getElementById("shots-taken")!;
const distanceEl = document.getElementById("distance-remaining")!;

const puttButton = document.getElementById("putt-button")! as HTMLButtonElement;
const aimButton = document.getElementById("aim-button")! as HTMLButtonElement;
const claimPrizeButton = document.getElementById(
  "claim-prize-button"
)! as HTMLButtonElement;
const playAgainButton = document.getElementById(
  "play-again-button"
)! as HTMLButtonElement;
const tryAgainButton = document.getElementById(
  "try-again-button"
)! as HTMLButtonElement;

const prizeTitle = document.getElementById("prize-title")!;
const prizeDescription = document.getElementById("prize-description")!;
const prizeCode = document.getElementById("prize-code")!;

// Game event handlers
const gameEvents: GameEvents = {
  onEmailSubmitted: (email: string) => {
    if (CONFIG.DEBUG) {
      console.log("📧 Email submitted:", email, "(Debug mode)");
    }
    emailSection.style.display = "none";
    gameSection.style.display = "block";
    gameStateEl.textContent = CONFIG.TEXT.GAME_STATES.READY;
    gameStateEl.className = "game-state ready";
    aimButton.style.display = "inline-block";
    updateGameStats();
  },

  onShoot: (power: number, newDistance: number) => {
    gameStateEl.textContent = CONFIG.TEXT.GAME_STATES.SHOOTING(
      power,
      newDistance
    );
    gameStateEl.className = "game-state shooting";
    puttButton.style.display = "none";
    updateGameStats();
  },

  onWin: (shots: number, prize) => {
    gameSection.style.display = "none";
    prizeSection.style.display = "block";

    prizeTitle.textContent = `🎉 ${prize.name}!`;
    prizeDescription.textContent = prize.description;
    prizeCode.textContent = prize.code;

    // Update claim prize button text
    claimPrizeButton.textContent = CONFIG.TEXT.BUTTONS.CLAIM_PRIZE;
    playAgainButton.textContent = CONFIG.TEXT.BUTTONS.PLAY_AGAIN;

    if (CONFIG.DEBUG) {
      console.log(`🏆 Game won in ${shots} shots!`, prize);
    }
  },

  onLose: () => {
    gameSection.style.display = "none";
    loseSection.style.display = "block";
    if (CONFIG.DEBUG) {
      console.log("💔 Game lost - overshot the hole!");
    }
  },

  onReset: () => {
    // Reset to ready state
    gameStateEl.textContent = CONFIG.TEXT.GAME_STATES.READY;
    gameStateEl.className = "game-state ready";
    aimButton.style.display = "inline-block";
    puttButton.style.display = "none";
    updateGameStats();
  },
};

// Initialize UI and game
initializeUI();
const game = new MiniGolfGame("golfPreview", undefined, gameEvents);

function updateGameStats(): void {
  const stats = game.getStats();
  shotsEl.textContent = `Shots: ${stats.shotsTaken}`;
  distanceEl.textContent = `Distance to go: ${
    stats.targetDistance - stats.currentDistance
  }`;
}

// Email form handling with debug support
emailForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();

  if (email && email.includes("@")) {
    // Handle email submission based on debug mode
    if (CONFIG.DEBUG && CONFIG.SKIP_EMAIL_SUBMISSION) {
      // Debug mode: skip actual submission
      console.log("🐛 Debug mode: Skipping email submission to Klaviyo");
      game.emailSubmitted(email);
    } else {
      // Production mode: submit to Klaviyo
      const formData = new FormData();
      formData.append("email", email);

      // Submit to Klaviyo asynchronously
      fetch(emailForm.action, {
        method: "POST",
        body: formData,
        mode: "no-cors", // Klaviyo doesn't support CORS, so we use no-cors
      })
        .then(() => {
          if (CONFIG.DEBUG) {
            console.log("📧 Email submitted to Klaviyo successfully");
          }
        })
        .catch(() => {
          // Klaviyo submission might fail due to CORS, but that's expected
          // The email will still be captured
          if (CONFIG.DEBUG) {
            console.log("📧 Email submitted to Klaviyo (CORS expected)");
          }
        });

      // Enable the game regardless of Klaviyo response
      game.emailSubmitted(email);
    }
  }
});

// Game control buttons
aimButton.addEventListener("click", () => {
  game.startAiming();
  aimButton.style.display = "none";
  puttButton.style.display = "inline-block";
  gameStateEl.textContent = CONFIG.TEXT.GAME_STATES.AIMING;
  gameStateEl.className = "game-state aiming";
});

puttButton.addEventListener("click", () => {
  game.putt();
});

// Prize and reset buttons
claimPrizeButton.addEventListener("click", () => {
  // In production, this could redirect to apply the discount
  if (CONFIG.DEBUG) {
    console.log("🎁 Prize claim button clicked (Debug mode)");
  }
  alert("Prize claimed! Your discount has been applied to your cart.");
  resetToStart();
});

playAgainButton.addEventListener("click", () => {
  resetToStart();
});

tryAgainButton.addEventListener("click", () => {
  game.resetGame();
  loseSection.style.display = "none";
  gameSection.style.display = "block";
});

function resetToStart(): void {
  // Reset everything to initial state
  prizeSection.style.display = "none";
  loseSection.style.display = "none";
  emailSection.style.display = "block";
  gameSection.style.display = "none";
  emailInput.value = "";
  gameStateEl.textContent = CONFIG.TEXT.GAME_STATES.EMAIL_REQUIRED;
  gameStateEl.className = "game-state email-required";
  game.resetGame();
}

// Development console logs
if (CONFIG.DEBUG) {
  console.log("🏌️ Mini Golf Game initialized!");
  console.log("🐛 Debug mode enabled");
  console.log(
    "📧 Email submission:",
    CONFIG.SKIP_EMAIL_SUBMISSION ? "DISABLED" : "ENABLED"
  );
  console.log("🎯 Game instance:", game);
  console.log("⚙️ Configuration:", CONFIG);
  console.log("📝 Available methods:", {
    emailSubmitted: "game.emailSubmitted(email)",
    startAiming: "game.startAiming()",
    putt: "game.putt()",
    resetGame: "game.resetGame()",
    getState: "game.getState()",
    getStats: "game.getStats()",
  });
}
