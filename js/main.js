const cursor = document.getElementById("cursor");
const lifesList = document.getElementById("lifes");
const score = document.getElementById("score");
const overlayBackdrop = document.getElementById("overlay-backdrop");
const startGameModal = document.getElementById("start-game-modal");
const endGameModal = document.getElementById("end-game-modal");
const modalZombie = document.querySelectorAll(".modal-zombie");
const scoreAmount = document.getElementById("score-amount");
const cursorTracker = (ev) => {
  const x = ev.clientX;
  const y = ev.clientY;
  cursor.style.transform = `translate3d(${x - 75}px, ${y - 75}px, 0)`;
};

const px = (amount) => `${amount}px`;
const randomFromRange = (max, min) =>
  Math.floor(Math.random() * (max - min + 1) + min);

document.body.addEventListener("click", () => {
  game.manipulateScore(-3);
  game.score <= 0 && game.endGame();
});

overlayBackdrop.addEventListener("click", (event) => {
  event.stopPropagation();
});
class Game {
  #initialLifes;
  #lifesAmount;
  #intervalGeneratingZombies;
  #generatingZombiesSpeed;
  constructor(initLifes, initScore) {
    this.#initialLifes = initLifes;
    this.#lifesAmount = this.#initialLifes;
    this.#intervalGeneratingZombies = null;
    this.#generatingZombiesSpeed = 600;

    this.zombiesTimeouts = [];
    this.score = initScore;
  }
  #initLifes() {
    for (let i = 0; i < this.#lifesAmount; i++) {
      lifesList.innerHTML += `<li>
        <img src="./assets/images/full_heart.png" class="life-img">
    </li>`;
    }
  }
  #updateScore() {
    score.innerText =
      this.score < 0
        ? "-" + Math.abs(this.score).toString().padStart(5, "0")
        : this.score.toString().padStart(5, "0");
  }
  runGame() {
    this.#initLifes();
    this.#updateScore();

    document.addEventListener("mouseenter", () => {
      cursor.style.display = "block";
    });
    document.addEventListener("mouseleave", () => {
      cursor.style.display = "none";
    });
    document.addEventListener("mousemove", cursorTracker);
    cursor.style.display = "block";
    overlayBackdrop.style.display = "none";
    startGameModal.style.display = "none";
    this.#intervalGeneratingZombies = Zombie.generateZombies(
      this.#generatingZombiesSpeed,
      false
    );
  }

  #increaseGeneratingZombiesSpeed() {
    if (this.#generatingZombiesSpeed < 200) return;
    clearInterval(this.#intervalGeneratingZombies);
    this.#generatingZombiesSpeed -= 20;
    this.#intervalGeneratingZombies = Zombie.generateZombies(
      this.#generatingZombiesSpeed,
      true
    );
  }
  reduceLife() {
    this.#lifesAmount -= 1;
    const hearts = document.querySelectorAll(".life-img");
    hearts[this.#lifesAmount].src = "./assets/images/empty_heart.png";
    this.#lifesAmount == 0 && this.endGame();
  }
  manipulateScore(amount) {
    //every 200 score gain speed up generating zombies
    Math.floor(this.score / 200) != Math.floor((this.score + amount) / 200) &&
      this.#increaseGeneratingZombiesSpeed();
    this.score += amount;
    this.#updateScore();
  }
  endGame() {
    clearInterval(this.#intervalGeneratingZombies);
    document.removeEventListener("mousemove", cursorTracker);
    const zombies = document.querySelectorAll(".zombie");
    this.zombiesTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    zombies.forEach((zombie) => {
      zombie.style.animationPlayState = "paused";
    });
    overlayBackdrop.style.display = "flex";
    endGameModal.style.display = "flex";
    scoreAmount.innerText = this.score.toString();
  }

  restartGame() {
    lifesList.innerHTML = "";
    this.score = 30;
    this.#lifesAmount = this.#initialLifes;
    const zombies = document.querySelectorAll(".zombie");
    zombies.forEach((zombie_element) => {
      zombie_element.remove();
    });
    this.runGame();
  }
}

class Zombie {
  constructor(posX, posY, size, velocity) {
    this.posX = posX;
    this.posY = posY;
    this.size = size;
    this.src = "../assets/images/walkingdead.png";
    this.velocity = velocity;
  }
  static minSpeed = 15;

  static generateZombies(time, shouldIncrease) {
    const generateZombieInterval = setInterval(() => {
      const posX = randomFromRange(-100, window.innerWidth * 0.4);
      const posY = randomFromRange(-20, window.innerHeight * 0.17);
      const size = randomFromRange(50, 250);
      if (shouldIncrease && Zombie.minSpeed > 2) {
        Zombie.minSpeed -= 1;
        shouldIncrease = false;
      }
      const velocity = randomFromRange(1, Zombie.minSpeed);
      const zombie = new Zombie(posX, posY, size, velocity);
      zombie.createZombie();
    }, time);

    return generateZombieInterval;
  }
  createZombie() {
    const zombie = document.createElement("div");
    zombie.classList.add("zombie");
    zombie.style.backgroundImage = this.src;
    zombie.style.width = px(this.size);
    zombie.style.height = px(this.size * 1.56);
    const zombieRenderDuration = this.velocity / 10;
    zombie.style.animation = `render-zombie ${zombieRenderDuration}s ease-out forwards, zombie-animate ${
      this.velocity / 10
    }s steps(9) ${zombieRenderDuration}s infinite, zombie-move ${
      this.velocity
    }s linear ${zombieRenderDuration}s forwards`;
    zombie.style.right = px(this.posX);
    zombie.style.bottom = px(this.posY);
    const zombieTimeout = setTimeout(() => {
      game.reduceLife();
      zombie.remove();
    }, this.velocity * 1000 + zombieRenderDuration * 1000);
    game.zombiesTimeouts.push(zombieTimeout);
    zombie.addEventListener("mousedown", (event) => {
      event.stopPropagation();
      zombie.remove();
      game.manipulateScore(10);
      clearTimeout(zombieTimeout);
    });

    document.body.appendChild(zombie);
  }
}

const game = new Game(6, 30);

