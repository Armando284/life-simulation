import NeuralNetwork from "./neural_network.js";
import { colorSmallChange, randomColor } from "./utils.js";

const DEBUG_MODE = true


class Creature {
  constructor(x, y, ctx, worldWidth, worldHeight, color) {
    this.position = { x, y };
    this.initialPos = { x, y }
    this.velocity = { x: 0, y: 0 }; // Ahora tenemos velocidad
    this.ctx = ctx;
    this.size = 4;
    this.color = color;
    this.speed = 2;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;

    // Ángulo de orientación (en radianes)
    this.angle = 0; // 0 = mira hacia arriba (como antes)
    this.collisionRadius = this.size * 0.8;

    // Red neuronal (1 input, 4 outputs)
    this.brain = new NeuralNetwork([1, 200, 200, 4]);
  }

  update(obstacles = []) {
    // 1. Actualizar posición previa (para resolver colisiones)
    this.previousPosition = { ...this.position };

    // 2. Obtener input y mover (como antes)
    const input = this.getFrontDistance(obstacles);
    const outputs = this.brain.brain([input]);
    this.move(outputs);

    // 3. Verificar colisiones con otras criaturas
    this.handleCollisions(obstacles);

    // 4. Actualizar ángulo y dibujar
    if (this.velocity.x !== 0 || this.velocity.y !== 0) {
      this.angle = Math.atan2(this.velocity.y, this.velocity.x) + Math.PI / 2;
    }
    this.draw();
  }

  handleCollisions(creatures) {
    for (const other of creatures) {
      if (other === this) continue;

      const dx = other.position.x - this.position.x;
      const dy = other.position.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Distancia mínima para considerar colisión
      const minDistance = this.collisionRadius + other.collisionRadius;

      if (distance < minDistance) {
        // Resolver colisión (empujar)
        const angle = Math.atan2(dy, dx);
        const overlap = minDistance - distance;

        // Mover ambas criaturas (50% de responsabilidad cada una)
        this.position.x -= Math.cos(angle) * overlap * 0.5;
        this.position.y -= Math.sin(angle) * overlap * 0.5;
        other.position.x += Math.cos(angle) * overlap * 0.5;
        other.position.y += Math.sin(angle) * overlap * 0.5;

        // Aplicar efecto de "rebote" modificando velocidades
        const damping = 0.7;
        this.velocity.x = -Math.cos(angle) * this.speed * damping;
        this.velocity.y = -Math.sin(angle) * this.speed * damping;
        other.velocity.x = Math.cos(angle) * other.speed * damping;
        other.velocity.y = Math.sin(angle) * other.speed * damping;
      }
    }

    // Mantener dentro de los bordes (colisión con paredes)
    this.position.x = Math.max(this.collisionRadius,
      Math.min(this.worldWidth - this.collisionRadius, this.position.x));
    this.position.y = Math.max(this.collisionRadius,
      Math.min(this.worldHeight - this.collisionRadius, this.position.y));
  }

  getFrontDistance(obstacles) {
    const sensorLength = this.size * 3;
    const frontX = this.position.x + Math.cos(this.angle - Math.PI / 2) * sensorLength;
    const frontY = this.position.y + Math.sin(this.angle - Math.PI / 2) * sensorLength;

    // Verificar bordes primero
    if (frontX <= 0 || frontX >= this.worldWidth ||
      frontY <= 0 || frontY >= this.worldHeight) {
      return 1;
    }

    // Verificar otras criaturas
    let closestDistance = Infinity;

    for (const obstacle of obstacles) {
      if (obstacle === this) continue;

      const dx = obstacle.position.x - this.position.x;
      const dy = obstacle.position.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Ángulo hacia el obstáculo
      const angleToObstacle = Math.atan2(dy, dx);
      const angleDiff = Math.abs(this.angle - angleToObstacle);

      // Solo considerar obstáculos en el frente (60° cono de visión)
      if (angleDiff < Math.PI / 3 && distance < sensorLength) {
        // Distancia real considerando radios
        const realDistance = distance - (this.size + obstacle.size);
        if (realDistance < closestDistance) {
          closestDistance = realDistance;
        }
      }
    }

    // Normalizar valor (0 = nada, 1 = contacto)
    if (closestDistance !== Infinity) {
      return 1 - Math.min(1, closestDistance / sensorLength);
    }
    return 0;
  }

  move(outputs) {
    const [up, down, left, right] = outputs;

    // Resetear velocidad
    this.velocity = { x: 0, y: 0 };

    // Determinar dirección basada en outputs
    if (up === Math.max(up, down, left, right)) {
      this.velocity.y = -this.speed;
    } else if (down === Math.max(up, down, left, right)) {
      this.velocity.y = this.speed;
    } else if (left === Math.max(up, down, left, right)) {
      this.velocity.x = -this.speed;
    } else if (right === Math.max(up, down, left, right)) {
      this.velocity.x = this.speed;
    }

    // Actualizar posición con límites
    this.position.x = Math.max(this.size,
      Math.min(this.worldWidth - this.size, this.position.x + this.velocity.x));
    this.position.y = Math.max(this.size,
      Math.min(this.worldHeight - this.size, this.position.y + this.velocity.y));
  }

  draw() {
    this.ctx.save();
    this.ctx.translate(this.position.x, this.position.y);
    this.ctx.rotate(this.angle);

    // Cuerpo
    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    this.ctx.fill();

    // Indicador frontal (triángulo)
    this.ctx.fillStyle = '#e74c3c';
    this.ctx.beginPath();
    this.ctx.moveTo(0, -this.size);
    this.ctx.lineTo(-this.size / 2, this.size / 2);
    this.ctx.lineTo(this.size / 2, this.size / 2);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();

    // Dibujar sensor frontal (debug)
    if (DEBUG_MODE) {
      this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
      this.ctx.beginPath();
      this.ctx.moveTo(this.position.x, this.position.y);
      const frontX = this.position.x + Math.cos(this.angle - Math.PI / 2) * this.size * 2;
      const frontY = this.position.y + Math.sin(this.angle - Math.PI / 2) * this.size * 2;
      this.ctx.lineTo(frontX, frontY);
      this.ctx.stroke();
    }
  }

  clone() {
    //console.log(this.brain.toString())
    const clone = new Creature(
      this.position.x,
      this.position.y,
      this.ctx,
      this.worldWidth,
      this.worldHeight,
      this.color
    );
    clone.brain = this.brain.clone();

    // 30% de probabilidad de mutación al clonar
    if (Math.random() < 0.06) {
      clone.mutate()
    }

    clone.initialPos = {
      x: this.initialPos.x,
      y: this.initialPos.y
    }; // Heredar posición inicial
    return clone;
  }

  mutate() {
    this.brain.mutate(
      0.1, // mutationRate 
      0.2 + Math.random() * 0.3 // mutationScale variable
    );
    this.color = colorSmallChange(this.color)
  }

}

export default Creature;