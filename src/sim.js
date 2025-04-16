'use strict'
import { config } from "./config.js"

export class Sim {
  #ctx
  #x
  #y
  #width
  #height
  #baseColor

  constructor({ ctx, x, y }) {
    this.#ctx = ctx
    this.#x = x
    this.#y = y
    this.#width = config.sim.width
    this.#height = config.sim.height
    this.#baseColor = config.sim.baseColor

    this.#draw()
  }

  #draw() {
    this.#ctx.fillStyle = this.#baseColor
    this.#ctx.fillRect(this.#x, this.#y, this.#width, this.#height)
  }

  #move(oldX, oldY, x, y) {
    this.#ctx.clearRect(oldX, oldY, this.#width, this.#height)
    this.#x = x
    this.#y = y
    console.log(this.#x, this.#y)
    this.#draw()
  }

  up() {
    const newY = Math.max(this.#y - this.#height, 0)
    this.#move(this.#x, this.#y, this.#x, newY)
  }

  right() {
    const newX = Math.min(this.#x + this.#width, config.canvas.width - this.#width)
    this.#move(this.#x, this.#y, newX, this.#y)
  }

  down() {
    const newY = Math.min(this.#y + this.#height, config.canvas.height - this.#height)
    this.#move(this.#x, this.#y, this.#x, newY)
  }

  left() {
    const newX = Math.max(this.#x - this.#width, 0)
    this.#move(this.#x, this.#y, newX, this.#y)
  }
}