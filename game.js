
const arena = document.getElementById("arena");
const enemiesContainer = document.getElementById("enemies-container");

const waveDisplay = document.getElementById("wave");
const enemiesDisplay = document.getElementById("enemies");
const scoreDisplay = document.getElementById("score");

const healthFill = document.getElementById("health-fill");
const healthText = document.getElementById("health-text");

const overlay = document.getElementById("overlay");
const startButton = document.getElementById("start-button");

const viewButton = document.getElementById("view-button");
const playerView = document.getElementById("player-view");
const damageFlash = document.getElementById("damage-flash");
const crosshair = document.getElementById("crosshair");
const message = document.getElementById("message");

let wave = 1;
let score = 0;
let health = 100;

let enemies = [];
let gameRunning = false;
let thirdPerson = false;

let lastTime = 0;
let spawnTimer = 0;
let attackCooldown = 0;

function updateHUD() {
  waveDisplay.textContent = String(wave).padStart(2, "0");
  enemiesDisplay.textContent = enemies.length;
  scoreDisplay.textContent = String(score).padStart(4, "0");

  healthText.textContent = health;
  healthFill.style.width = health + "%";
}

function startGame() {
  wave = 1;
  score = 0;
  health = 100;

  enemies = [];
  spawnTimer = 0;
  attackCooldown = 0;

  gameRunning = true;

  enemiesContainer.innerHTML = "";
  overlay.classList.add("hidden");

  message.textContent = "SURVIVE THE NIGHT";

  updateHUD();
  lastTime = performance.now();

  requestAnimationFrame(gameLoop);
}

function createEnemy() {
  const element = document.createElement("div");
  element.className = "enemy";

  const enemy = {
    element,
    x: Math.random() * 80 + 10,
    y: Math.random() * 45 + 25,
    size: Math.random() * 0.4 + 0.8,
    speed: Math.random() * 0.012 + 0.008,
    alive: true
  };

  element.style.left = enemy.x + "%";
  element.style.top = enemy.y + "%";
  element.style.transform =
    `translate(-50%, -50%) scale(${enemy.size})`;

  enemiesContainer.appendChild(element);
  enemies.push(enemy);

  updateHUD();
}

function attack(event) {
  if (!gameRunning || attackCooldown > 0) return;

  attackCooldown = 250;

  const rect = arena.getBoundingClientRect();

  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const targetX = (mouseX / rect.width) * 100;
  const targetY = (mouseY / rect.height) * 100;

  let target = null;
  let closestDistance = Infinity;

  for (const enemy of enemies) {
    const dx = enemy.x - targetX;
    const dy = enemy.y - targetY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 10 && distance < closestDistance) {
      closestDistance = distance;
      target = enemy;
    }
  }

  if (target) {
    target.alive = false;
    target.element.classList.add("hit");

    score += 100;

    message.textContent = "MONSTER DEFEATED";

    setTimeout(() => {
      target.element.remove();
    }, 120);

    enemies = enemies.filter(enemy => enemy.alive);

    updateHUD();

    if (enemies.length === 0) {
      nextWave();
    }
  } else {
    message.textContent = "ENERGY PULSE MISSED";
  }
}

function nextWave() {
  wave++;

  message.textContent = "WAVE " + wave + " INCOMING";

  spawnTimer = 1500;

  updateHUD();
}

function takeDamage(amount) {
  health = Math.max(0, health - amount);

  damageFlash.classList.remove("active");

  void damageFlash.offsetWidth;

  damageFlash.classList.add("active");

  updateHUD();

  if (health <= 0) {
    endGame();
  }
}

function endGame() {
  gameRunning = false;

  overlay.classList.remove("hidden");

  overlay.querySelector(".eyebrow").textContent =
    "THE NIGHT HAS WON";

  overlay.querySelector("h1").innerHTML =
    "YOU ARE<br>LOST";

  overlay.querySelector("p").textContent =
    "Final score: " + score;

  startButton.textContent = "TRY AGAIN";
}

function gameLoop(timestamp) {
  if (!gameRunning) return;

  const delta = Math.min(timestamp - lastTime, 50);

  lastTime = timestamp;

  attackCooldown = Math.max(0, attackCooldown - delta);
  spawnTimer -= delta;

  if (spawnTimer <= 0 && enemies.length === 0) {
    const enemyCount = Math.min(3 + wave * 2, 30);

    for (let i = 0; i < enemyCount; i++) {
      createEnemy();
    }

    spawnTimer = 1000;
  }

  for (const enemy of enemies) {
    enemy.y += enemy.speed * delta;

    enemy.element.style.top = enemy.y + "%";

    if (enemy.y > 85) {
      enemy.alive = false;
      enemy.element.remove();

      takeDamage(10);

      if (!gameRunning) return;
    }
  }

  enemies = enemies.filter(enemy => enemy.alive);

  updateHUD();

  requestAnimationFrame(gameLoop);
}

function toggleView() {
  thirdPerson = !thirdPerson;

  playerView.classList.toggle("third-person", thirdPerson);

  viewButton.textContent = thirdPerson
    ? "FIRST PERSON"
    : "THIRD PERSON";

  crosshair.style.opacity = thirdPerson ? "0.5" : "0.8";
}

startButton.addEventListener("click", startGame);

arena.addEventListener("click", attack);

viewButton.addEventListener("click", toggleView);

document.addEventListener("keydown", event => {
  if (event.key.toLowerCase() === "v") {
    toggleView();
  }
});

updateHUD();
        
