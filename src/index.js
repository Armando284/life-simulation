import Creature from "./creature.js";
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

// Simulation state
const creatures = [];
let generation = 0;
let frameCount = 0;
const generationLength = 1000;
const initialPopulationSize = 100;

/**
 * Generates a random X coordinate within canvas width
 * @returns {number} Random X position
 */
const randomX = () => Math.floor(Math.random() * $canvas.width);

/**
 * Generates a random Y coordinate within canvas height
 * @returns {number} Random Y position
 */
const randomY = () => Math.floor(Math.random() * $canvas.height);

/**
 * Initializes the simulation with a new population of creatures
 */
function initSimulation() {
  creatures.length = 0;

  for (let i = 0; i < initialPopulationSize; i++) {
    const creature = new Creature(
      randomX(),
      randomY(),
      ctx,
      $canvas.width,
      $canvas.height,
      randomColor()
    );
    creature.mutate();
    creatures.push(creature);
  }

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

  // Update and draw creatures
  for (const creature of creatures) {
    creature.update(creatures);
    creature.draw();
  }

  // Pause if no creatures left
  if (creatures.length <= 0) {
    $pauseBtn.click();
  }

  frameCount++;

  // Create new generation when generation length is reached
  if (frameCount >= generationLength) {
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
  const rightSideCreatures = creatures.filter(creature =>
    creature.position.x > $canvas.width / 2
  );

  // Sort by fitness (distance traveled in X axis)
  rightSideCreatures.sort((a, b) => (b.position.x - b.initialPos.x) - (a.position.x - a.initialPos.x));

  // Select top performers (top half)
  const parents = rightSideCreatures.slice(0, Math.ceil(rightSideCreatures.length / 2));
  const newCreatures = [];

  // Create new generation
  for (const parent of parents) {
    // Create 2 children per parent
    const child1 = parent.clone();
    const child2 = parent.clone();

    // Position children randomly
    child1.position.x = randomX();
    child1.position.y = randomY();
    child2.position.x = randomX();
    child2.position.y = randomY();

    newCreatures.push(child1, child2);
  }

  // Replace population (maintain same number of creatures)
  creatures.length = 0;
  creatures.push(...newCreatures);
}

/**
 * Updates the UI with current generation information
 */
function drawGenerationInfo() {
  $generation.textContent = generation;
  $frame.textContent = `${frameCount}/${generationLength}`;
  $creatures.textContent = creatures.length;
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
}

// Initialize controls
setupControls();