import Creature from "./creature.js";
import { $, randomColor } from "./utils.js";
import { config } from "./config.js";

// Elementos del DOM
const $canvas = $('#simulationCanvas');
const ctx = $canvas.getContext('2d');
const $startBtn = $('#startBtn');
const $pauseBtn = $('#pauseBtn');
const $stepBtn = $('#stepBtn');
const $speedSlider = $('#speedSlider');
const $speedValue = $('#speedValue');
const $generation = $('#generation')
const $frame = $('#frame')
const $creatures = $('#creatures')

const creatures = [];
let generation = 0;
let frameCount = 0;
const generationLength = 1000;

const randomX = () => Math.floor(Math.random() * $canvas.width)

const randomY = () => Math.floor(Math.random() * $canvas.height)

const initialPopulationSize = 100;
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
    creature.mutate()
    creatures.push(creature);
  }

  generation = 0;
  frameCount = 0;
  simulate();
}

// Función de simulación
function simulate() {
  ctx.clearRect(0, 0, $canvas.width, $canvas.height);

  // Dibujar zona de selección (mitad izquierda rojiza)
  ctx.fillStyle = 'rgba(255, 100, 100, 0.2)';
  ctx.fillRect(0, 0, $canvas.width / 2, $canvas.height);

  // Actualizar y dibujar criaturas
  for (const creature of creatures) {
    creature.update(creatures);
    creature.draw();
  }

  if (creatures.length <= 0) {
    $pauseBtn.click()
  }

  frameCount++;

  // Cada 100 frames, nueva generación
  if (frameCount >= generationLength) {
    nextGeneration();
    frameCount = 0;
    generation++;
  }

  if (!config.isPaused) {
    // setTimeout(() => {
    config.frameRequestId = requestAnimationFrame(simulate);
    // }, config.simulationSpeedms);
  }

  drawGenerationInfo()
}

function nextGeneration() {
  // Filtrar criaturas en mitad derecha (aptas para reproducirse)
  const rightSideCreatures = creatures.filter(creature =>
    creature.position.x > $canvas.width / 2
  );

  // Ordenar por fitness (ejemplo: distancia recorrida en X)
  rightSideCreatures.sort((a, b) => (b.position.x - b.initialPos.x) - (a.position.x - a.initialPos.x));

  // Reproducir las mejores (mitad superior)
  const parents = rightSideCreatures.slice(0, Math.ceil(rightSideCreatures.length / 2));
  const newCreatures = [];

  // Crear nueva generación
  for (const parent of parents) {
    // Crear 2 hijos por padre (puedes ajustar este número)
    const child1 = parent.clone();
    const child2 = parent.clone();

    // Posicionar hijos cerca del padre
    child1.position.x = randomX();
    child1.position.y = randomY();
    child2.position.x = randomX();
    child2.position.y = randomY();

    newCreatures.push(child1, child2);
  }

  // Reemplazar población (mantener mismo número de criaturas)
  creatures.length = 0;
  creatures.push(...newCreatures);
}

// Configurar controles UI
function setupControls() {
  // Botón de inicio/reinicio
  $startBtn.addEventListener('click', () => {
    if (config.frameRequestId) {
      cancelAnimationFrame(config.frameRequestId);
    }
    creatures.length = 0; // Limpiar criaturas existentes
    if (config.isPaused) {
      config.isPaused = !config.isPaused;
      $pauseBtn.textContent = config.isPaused ? 'Restart' : 'Pause';
      $pauseBtn.classList.toggle('clicked', config.isPaused)
    }
    initSimulation();
  });

  // Botón de pausa
  $pauseBtn.addEventListener('click', () => {
    config.isPaused = !config.isPaused;
    $pauseBtn.textContent = config.isPaused ? 'Restart' : 'Pause';
    $pauseBtn.classList.toggle('clicked', config.isPaused)

    if (!config.isPaused) {
      simulate(); // Reanudar simulación
    }
  });

  // Botón de paso a paso
  $stepBtn.addEventListener('click', () => {
    if (config.isPaused) {
      // Avanzar un solo frame
      ctx.clearRect(0, 0, $canvas.width, $canvas.height);
      for (const creature of creatures) {
        creature.update(creatures);
      }
    }
  });

  // Control deslizante de velocidad
  $speedSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    config.simulationSpeedms = 600 - (value * 50); // Rango: 550ms a 50ms
    console.log('speed', config.simulationSpeedms)
    $speedValue.textContent = `${value}/10`;

    // Si está en pausa, mostrar el nuevo valor pero no cambiar la simulación
    if (!config.isPaused) {
      restartSimulation();
    }
  });
}
setupControls()
// Reiniciar simulación con nueva velocidad
function restartSimulation() {
  if (config.frameRequestId) {
    cancelAnimationFrame(config.frameRequestId);
  }
  simulate();
}

function drawGenerationInfo() {
  $generation.textContent = generation
  $frame.textContent = `${frameCount}/${generationLength}`
  $creatures.textContent = creatures.length
}
