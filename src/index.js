import Creature from "./creature.js";
import Food from "./food.js";
import { $, randomColor } from "./utils.js";
import { config } from "./config.js";

// DOM Elements
const $canvas = $('#simulationCanvas');
const ctx = $canvas.getContext('2d');

// Set canvas dimensions accounting for device pixel ratio
const pixelRatio = window.devicePixelRatio || 1;
$canvas.width = $canvas.clientWidth * pixelRatio;
$canvas.height = $canvas.clientHeight * pixelRatio;

// Scale the context to maintain proper size
ctx.scale(pixelRatio, pixelRatio);

// Set image rendering to crisp
$canvas.style.imageRendering = 'pixelated';

const $startBtn = $('#startBtn');
const $pauseBtn = $('#pauseBtn');
const $stepBtn = $('#stepBtn');
const $speedSlider = $('#speedSlider');
const $speedValue = $('#speedValue');
const $generation = $('#generation');
const $frame = $('#frame');
const $creatures = $('#creatures');
const $printModel = $('#printModel')

// Simulation state
/**
 * @type {Creature[]}
 */
const creatures = [];
let generation = 0;
let frameCount = 0;
const generationLength = 2 * 1000;
const initialPopulationSize = 100;
const maxFoodAmount = 25;

/**
 * @type {Food[]}
 */
let foods = []
/**
 * Generates a random X coordinate within canvas width
 * @returns {number} Random X position
 */
const randomX = () => Math.max(50, Math.floor(Math.random() * $canvas.width));

/**
 * Generates a random Y coordinate within canvas height
 * @returns {number} Random Y position
 */
const randomY = () => Math.max(50, Math.floor(Math.random() * $canvas.height));

const generateFood = () => {
  foods.length = 0
  const rightBias = generation > 5 ? 0.7 : 0.3;
  foods = Array.from({ length: maxFoodAmount }, () => {
    return new Food(
      ctx,
      $canvas.width * (Math.random() > rightBias ? 0.6 : 0.1),
      $canvas.height * Math.random()
    );
  });
}

const respawnFood = () => {
  foods.forEach((food) => { food.respawn() })
}

/**
 * Initializes the simulation with a new population of creatures
 */
function initSimulation() {
  console.clear()
  creatures.length = 0;
  const trainedModel = localStorage.getItem('best-model')
  for (let i = 0; i < initialPopulationSize; i++) {
    const creature = new Creature(
      randomX(),
      randomY(),
      ctx,
      $canvas.width,
      $canvas.height,
      randomColor(),
    );
    if (i === 0 && trainedModel) {
      creature.brain.setModel(JSON.parse(trainedModel))
      creature.color = '#000000'
    } else {
      creature.mutate();
    }
    creatures.push(creature);
  }
  generateFood()

  generation = 0;
  frameCount = 0;
  simulate();
}

/**
 * Main simulation loop - updates and draws all creatures
 */
function simulate() {
  ctx.clearRect(0, 0, $canvas.width, $canvas.height);

  // Draw selection zone (reddish left half)
  ctx.fillStyle = 'rgba(255, 100, 100, 0.2)';
  ctx.fillRect(0, 0, $canvas.width / 2, $canvas.height);

  //Update and draw food
  for (const food of foods) {
    food.draw()
  }

  // Update and draw creatures
  for (const creature of creatures) {
    creature.update(creatures, foods);
  }

  // Pause if no creatures left
  if (creatures.length <= 0) {
    $pauseBtn.click();
  }

  frameCount++;

  // Create new generation when generation length is reached
  if (frameCount >= generationLength) {
    if (generation >= 50) {
      $pauseBtn.click()
    }
    nextGeneration();
    frameCount = 0;
    generation++;
  }

  if (!config.isPaused) {
    config.frameRequestId = requestAnimationFrame(simulate);
  }

  drawGenerationInfo();
}

/**
 * Advances to the next generation by selecting and breeding the fittest creatures
 */
function nextGeneration() {
  // Filter creatures in the right half (eligible for reproduction)
  const canReproduceCreatures = creatures.filter(creature =>
    creature.position.x > $canvas.width / 2 &&
    creature.foodEaten > 0
  );

  // Sort by fitness (distance traveled in X axis)
  canReproduceCreatures.sort((a, b) => calculateFitness(b) - calculateFitness(a));

  // Select top performers (top half)
  const parents = canReproduceCreatures.slice(0, Math.ceil(canReproduceCreatures.length / 2));
  const newCreatures = [];

  const maxChildren = initialPopulationSize / parents.length

  // const randomChildrenUnderMax = Math.floor(Math.random() * maxChildren)
  // const minChildren = 10
  // const randomChildrenBetweenMinAndMax = Math.max(minChildren, randomChildrenUnderMax)
  // Create new generation
  for (const parent of parents) {
    // Creates N children per parent
    const children = Array.from({ length: maxChildren }, () => {
      const child = parent.clone();
      child.position = {
        x: randomX(),
        y: randomY()
      }
      return child
    })

    newCreatures.push(...children);
  }

  // Replace population (maintain same number of creatures)
  creatures.length = 0;
  creatures.push(...newCreatures);
  // respawnFood()
  generateFood()
}

/**
 * 
 * @param {Creature} creature 
 * @returns 
 */
function calculateFitness(c) {
  return (
    c.position.x * 0.7 +
    c.foodEaten * 50 +
    c.energy * 0.3 -
    c.collisions * 2 // Añadir contador de colisiones
  );
}

/**
 * Updates the UI with current generation information
 */
function drawGenerationInfo() {
  $generation.textContent = generation;
  $frame.textContent = `${frameCount}/${generationLength}`;
  $creatures.textContent = `${creatures.length}/${initialPopulationSize}`;
}

/**
 * Restarts the simulation with current settings
 */
function restartSimulation() {
  if (config.frameRequestId) {
    cancelAnimationFrame(config.frameRequestId);
  }
  simulate();
}

/**
 * Sets up all UI controls and event listeners
 */
function setupControls() {
  // Start/Reset button
  $startBtn.addEventListener('click', () => {
    if (config.frameRequestId) {
      cancelAnimationFrame(config.frameRequestId);
    }
    creatures.length = 0; // Clear existing creatures

    if (config.isPaused) {
      config.isPaused = !config.isPaused;
      $pauseBtn.textContent = config.isPaused ? 'Restart' : 'Pause';
      $pauseBtn.classList.toggle('clicked', config.isPaused);
    }
    initSimulation();
  });

  // Pause button
  $pauseBtn.addEventListener('click', () => {
    config.isPaused = !config.isPaused;
    $pauseBtn.textContent = config.isPaused ? 'Restart' : 'Pause';
    $pauseBtn.classList.toggle('clicked', config.isPaused);

    if (!config.isPaused) {
      simulate(); // Resume simulation
    }
  });

  // Step button
  $stepBtn.addEventListener('click', () => {
    if (config.isPaused) {
      // Advance one frame
      ctx.clearRect(0, 0, $canvas.width, $canvas.height);
      for (const creature of creatures) {
        creature.update(creatures);
      }
    }
  });

  // Speed slider
  $speedSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    config.simulationSpeedms = 600 - (value * 50); // Range: 550ms to 50ms
    $speedValue.textContent = `${value}/10`;

    // If not paused, apply new speed immediately
    if (!config.isPaused) {
      restartSimulation();
    }
  });

  $printModel.onclick = () => {
    if (creatures.length <= 0) throw new Error('No model available!')

    const bestCreature = creatures.sort((a, b) => calculateFitness(b) - calculateFitness(a))[0]
    console.log('\nBEST MODEL\n')
    const bestModel = bestCreature.brain.getModel()
    localStorage.setItem('best-model', JSON.stringify(bestModel))
    downloadJSON(bestModel)
    console.log(bestModel)
    console.log('\nEND BEST MODEL\n')
  }
}

// Initialize controls
setupControls();

function downloadJSON(jsonData) {
  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'archivo.json';
  a.click();
  URL.revokeObjectURL(url);
}