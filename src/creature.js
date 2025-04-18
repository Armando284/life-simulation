import Food from "./food.js";
import NeuralNetwork from "./neural_network.js";
import { colorSmallChange, randomColor } from "./utils.js";

// Debug flag for development features
const DEBUG_MODE = true;

/**
 * Represents a creature in the simulation with neural network brain
 */
class Creature {
  /**
   * Creates a new Creature instance
   * @param {number} x - Initial x position
   * @param {number} y - Initial y position
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {number} worldWidth - Width of the simulation world
   * @param {number} worldHeight - Height of the simulation world
   * @param {string} color - Base color of the creature
   */
  constructor(x, y, ctx, worldWidth, worldHeight, color) {
    this.position = { x, y };
    this.initialPos = { x, y };
    this.velocity = { x: 0, y: 0 }; // Current velocity vector
    this.ctx = ctx;
    this.size = 10; // Visual size and collision radius base
    this.color = color;
    this.speed = 2; // Movement speed
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;

    // Orientation angle in radians (0 = facing up)
    this.angle = 0;
    this.collisionRadius = this.size * 0.8;

    this.foodEaten = 0
    this.canEat = true;

    this.maxEnergy = 100
    this.energy = this.maxEnergy

    this.collisions = 0

    // Neural network (1 input, [200, 200] hidden layers, 4 outputs)
    this.brain = new NeuralNetwork([5, 16, 16, 4]);
  }

  /**
   * Updates creature state including position, collisions and drawing
   * @param {(Creature | Food)[]} obstacles - Array of other creatures to consider
   */
  update(obstacles = []) {
    // 0. Movement spends energy
    this.energy = Math.max(0, this.energy - 0.02);

    // 1. Store previous position for collision resolution
    this.previousPosition = { ...this.position };

    // 2. Get neural network input and process movement
    const frontDist = this.getFrontDistance(obstacles);
    const leftDist = this.getLeftDistance(obstacles);
    const rightDist = this.getRightDistance(obstacles);
    const outputs = this.brain.brain([frontDist, leftDist, rightDist, this.foodEaten, this.energy]);
    this.move(outputs);

    // 3. Handle collisions with other creatures
    this.handleCollisions(obstacles);

    // 4. Update orientation and draw
    if (this.velocity.x !== 0 || this.velocity.y !== 0) {
      this.angle = Math.atan2(this.velocity.y, this.velocity.x) + Math.PI / 2;
    }
    this.draw();
  }

  /**
   * Handles collisions with other creatures and world boundaries
   * @param {(Creature | Food)[]} objects - Array of other creatures
   */
  handleCollisions(objects) {
    for (const obj of objects) {
      if (obj === this) continue;
      const dx = obj.position.x - this.position.x;
      const dy = obj.position.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Minimum distance before collision occurs
      const minDistance = this.collisionRadius + obj.collisionRadius;

      if (distance < minDistance) {

        // Resolve collision 
        if (obj instanceof Food) {
          this.eat(obj)
        } else {
          this.collisions++
          // (push apart)
          const angle = Math.atan2(dy, dx);
          const overlap = minDistance - distance;

          // Move both creatures (50% responsibility each)
          this.position.x -= Math.cos(angle) * overlap * 0.5;
          this.position.y -= Math.sin(angle) * overlap * 0.5;
          obj.position.x += Math.cos(angle) * overlap * 0.5;
          obj.position.y += Math.sin(angle) * overlap * 0.5;

          // Apply bounce effect by modifying velocities
          const damping = 0.7;
          this.velocity.x = -Math.cos(angle) * this.speed * damping;
          this.velocity.y = -Math.sin(angle) * this.speed * damping;
          obj.velocity.x = Math.cos(angle) * obj.speed * damping;
          obj.velocity.y = Math.sin(angle) * obj.speed * damping;
        }
      }
    }

    // Keep within world boundaries (wall collisions)
    this.position.x = Math.max(
      this.collisionRadius,
      Math.min(this.worldWidth - this.collisionRadius, this.position.x)
    );
    this.position.y = Math.max(
      this.collisionRadius,
      Math.min(this.worldHeight - this.collisionRadius, this.position.y)
    );
  }

  // Front sensor (60° of view)
  getFrontDistance(obstacles) {
    return this.getSensorDistance(obstacles, 0, Math.PI / 3); // 60°
  }

  // Left sensor (60° of view, 90° left from body front)
  getLeftDistance(obstacles) {
    return this.getSensorDistance(obstacles, -Math.PI / 2, Math.PI / 3);
  }

  // Right Sensor (60° of view, 90° right from body front)
  getRightDistance(obstacles) {
    return this.getSensorDistance(obstacles, Math.PI / 2, Math.PI / 3);
  }

  /**
   * Calculates distance to nearest obstacle in a specific direction
   * @param {Creature[]} obstacles - Array of other creatures
   * @param {number} angleOffset - Offset from facing direction (in radians)
   * @param {number} visionWidth - Vision cone width (in radians)
   * @returns {number} Normalized distance (0 = no obstacle, 1 = touching)
   */
  getSensorDistance(obstacles, angleOffset, visionWidth) {
    const sensorLength = this.size * 20;

    // Sensor direction (body angle + offset)
    const sensorAngle = this.angle + angleOffset;

    // Sensor end (for world boundaries)
    const sensorEndX = this.position.x + Math.cos(sensorAngle) * sensorLength;
    const sensorEndY = this.position.y + Math.sin(sensorAngle) * sensorLength;

    // Check world boundary on sensor direction
    if (sensorEndX <= 0 || sensorEndX >= this.worldWidth ||
      sensorEndY <= 0 || sensorEndY >= this.worldHeight) {
      return 1;
    }

    // Calculate distance to obstacle
    let closestDistance = Infinity;

    for (const obstacle of obstacles) {
      if (obstacle === this) continue;

      const dx = obstacle.position.x - this.position.x;
      const dy = obstacle.position.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Ángle to obstacle
      const angleToObstacle = Math.atan2(dy, dx);
      let angleDiff = Math.abs(sensorAngle - angleToObstacle);
      angleDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff); // ! corrected to avoid 360°

      // Only take obstacles on view
      if (angleDiff <= visionWidth / 2 && distance < sensorLength) {
        const realDistance = distance - (this.size + obstacle.size);
        if (realDistance < closestDistance) {
          closestDistance = realDistance;
        }
      }
    }

    // Normalize (0 = nothing, 1 = touching)
    return closestDistance !== Infinity
      ? 1 - Math.min(1, closestDistance / sensorLength)
      : 0;
  }

  /**
   * 
   * @param {Food} food 
   * @returns 
   */
  eat(food) {
    if (!this.canEat) return
    this.canEat = false
    this.foodEaten++
    this.energy = Math.min(this.maxEnergy, this.energy + 35);
    food.despawn()
    this.canEat = true
  }

  /**
   * Moves the creature based on neural network outputs
   * @param {number[]} outputs - Neural network output array [up, down, left, right]
   */
  move(outputs) {
    const [up, down, left, right] = outputs;

    // 1. Calcular vector de dirección
    const dirX = right - left;
    const dirY = down - up;

    // 2. Normalizar el vector (magnitud 1)
    const magnitude = Math.sqrt(dirX ** 2 + dirY ** 2);

    // Reset velocity
    this.velocity = { x: 0, y: 0 };

    // Determine direction based on strongest output
    // Allows for diagonal movement
    this.velocity.x = (dirX / magnitude) * this.speed;
    this.velocity.y = (dirY / magnitude) * this.speed;

    // Update position with world boundaries
    this.position.x = Math.max(
      this.size,
      Math.min(this.worldWidth - this.size, this.position.x + this.velocity.x)
    );
    this.position.y = Math.max(
      this.size,
      Math.min(this.worldHeight - this.size, this.position.y + this.velocity.y)
    );
  }

  /**
   * Draws the creature on the canvas
   */
  draw() {
    this.ctx.save();
    this.ctx.translate(this.position.x, this.position.y);
    this.ctx.rotate(this.angle);

    // Draw body (circle)
    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw front indicator (triangle)
    this.ctx.fillStyle = '#e74c3c';
    this.ctx.beginPath();
    this.ctx.moveTo(0, -this.size);
    this.ctx.lineTo(-this.size / 2, this.size / 2);
    this.ctx.lineTo(this.size / 2, this.size / 2);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();

    // Draw front sensor (debug mode only)
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

  /**
   * Creates a clone of this creature with optional mutation
   * @returns {Creature} A new creature instance
   */
  clone() {
    const clone = new Creature(
      this.position.x,
      this.position.y,
      this.ctx,
      this.worldWidth,
      this.worldHeight,
      this.color
    );
    clone.brain = this.brain.clone();

    // 6% chance of mutation when cloning
    if (Math.random() < 0.1) {
      clone.mutate();
    }

    // Inherit initial position
    clone.initialPos = {
      x: this.initialPos.x,
      y: this.initialPos.y
    };
    return clone;
  }

  /**
   * Mutates the creature's neural network and color
   */
  mutate() {
    const mutationRate = 0.05 + (1 - this.energy / 100) * 0.1;
    const mutationScale = 0.1 + (this.foodEaten / 10);
    this.brain.mutate(mutationRate, mutationScale);
    this.color = colorSmallChange(this.color);
  }
}

export default Creature;