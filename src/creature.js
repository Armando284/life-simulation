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

    // Neural network (1 input, [200, 200] hidden layers, 4 outputs)
    this.brain = new NeuralNetwork([1, 200, 200, 4]);
  }

  /**
   * Updates creature state including position, collisions and drawing
   * @param {Creature[]} obstacles - Array of other creatures to consider
   */
  update(obstacles = []) {
    // 1. Store previous position for collision resolution
    this.previousPosition = { ...this.position };

    // 2. Get neural network input and process movement
    const input = this.getFrontDistance(obstacles);
    const outputs = this.brain.brain([input]);
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
   * @param {Creature[]} creatures - Array of other creatures
   */
  handleCollisions(creatures) {
    for (const other of creatures) {
      if (other === this) continue;

      const dx = other.position.x - this.position.x;
      const dy = other.position.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Minimum distance before collision occurs
      const minDistance = this.collisionRadius + other.collisionRadius;

      if (distance < minDistance) {
        // Resolve collision (push apart)
        const angle = Math.atan2(dy, dx);
        const overlap = minDistance - distance;

        // Move both creatures (50% responsibility each)
        this.position.x -= Math.cos(angle) * overlap * 0.5;
        this.position.y -= Math.sin(angle) * overlap * 0.5;
        other.position.x += Math.cos(angle) * overlap * 0.5;
        other.position.y += Math.sin(angle) * overlap * 0.5;

        // Apply bounce effect by modifying velocities
        const damping = 0.7;
        this.velocity.x = -Math.cos(angle) * this.speed * damping;
        this.velocity.y = -Math.sin(angle) * this.speed * damping;
        other.velocity.x = Math.cos(angle) * other.speed * damping;
        other.velocity.y = Math.sin(angle) * other.speed * damping;
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

  /**
   * Calculates distance to nearest obstacle in front of the creature
   * @param {Creature[]} obstacles - Array of other creatures
   * @returns {number} Normalized distance (0 = no obstacle, 1 = touching)
   */
  getFrontDistance(obstacles) {
    const sensorLength = this.size * 3;
    const frontX = this.position.x + Math.cos(this.angle - Math.PI / 2) * sensorLength;
    const frontY = this.position.y + Math.sin(this.angle - Math.PI / 2) * sensorLength;

    // Check world boundaries first
    if (frontX <= 0 || frontX >= this.worldWidth ||
      frontY <= 0 || frontY >= this.worldHeight) {
      return 1;
    }

    // Check other creatures
    let closestDistance = Infinity;

    for (const obstacle of obstacles) {
      if (obstacle === this) continue;

      const dx = obstacle.position.x - this.position.x;
      const dy = obstacle.position.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Angle to obstacle
      const angleToObstacle = Math.atan2(dy, dx);
      const angleDiff = Math.abs(this.angle - angleToObstacle);

      // Only consider obstacles in front (60° vision cone)
      if (angleDiff < Math.PI / 3 && distance < sensorLength) {
        // Real distance accounting for sizes
        const realDistance = distance - (this.size + obstacle.size);
        if (realDistance < closestDistance) {
          closestDistance = realDistance;
        }
      }
    }

    // Normalize value (0 = nothing, 1 = touching)
    if (closestDistance !== Infinity) {
      return 1 - Math.min(1, closestDistance / sensorLength);
    }
    return 0;
  }

  /**
   * Moves the creature based on neural network outputs
   * @param {number[]} outputs - Neural network output array [up, down, left, right]
   */
  move(outputs) {
    const [up, down, left, right] = outputs;

    // Reset velocity
    this.velocity = { x: 0, y: 0 };

    // Determine direction based on strongest output
    if (up === Math.max(up, down, left, right)) {
      this.velocity.y = -this.speed;
    } else if (down === Math.max(up, down, left, right)) {
      this.velocity.y = this.speed;
    } else if (left === Math.max(up, down, left, right)) {
      this.velocity.x = -this.speed;
    } else if (right === Math.max(up, down, left, right)) {
      this.velocity.x = this.speed;
    }

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
    if (Math.random() < 0.06) {
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
    this.brain.mutate(
      0.1, // mutationRate 
      0.2 + Math.random() * 0.3 // mutationScale (variable)
    );
    this.color = colorSmallChange(this.color);
  }
}

export default Creature;