'use strict'

import { Sim } from "./sim.js"
import { config } from "./config.js"
import { $ } from "./utils.js"

const canvas = $('canvas#game')

canvas.width = config.canvas.width
canvas.height = config.canvas.height

const ctx = canvas.getContext('2d')
ctx.fillStyle = config.sim.baseColor
ctx.fillRect(50, 50, config.sim.width, config.sim.height)

//#region Update
let timerId

const $play = $('#button-play')
$play.onclick = () => {
  if (timerId) {
    clearInterval(timerId)
  }
  timerId = setInterval(() => {
    ctx.clearRect(50, 50, 20, 20)
    setTimeout(() => {
      ctx.fillRect(50, 50, 20, 20)
    }, 500);
  }, 1000);
}
//#endregion

//#region StopGamte
const $stop = $('#button-stop')
$stop.onclick = () => {
  clearInterval(timerId)
}
//#endregion