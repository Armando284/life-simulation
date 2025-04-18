export default class Food {
  constructor(ctx, worldWidth, worldHeight) {
    this.ctx = ctx;
    this.worldWidth = worldWidth
    this.worldHeight = worldHeight
    this.size = 6;
    this.collisionRadius = this.size * 0.8;

    this.color = '#00ff00';
    this.#randomPos()
  }

  #randomPos() {
    this.position = {
      x: Math.random() * (this.worldWidth * 0.5),
      y: Math.random() * this.worldHeight
    };
  }

  despawn() {
    this.position = {
      x: -50,
      y: -50
    };
  }

  respawn() {
    this.#randomPos()
  }

  draw() {
    this.ctx.save();
    this.ctx.translate(this.position.x, this.position.y);
    // Draw body (circle)
    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }
}