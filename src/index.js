'use strict'

import { Sim } from "./sim.js"
import { config } from "./config.js"
import { $ } from "./utils.js"

const canvas = $('canvas#game')

canvas.width = config.canvas.width
canvas.height = config.canvas.height

const ctx = canvas.getContext('2d')
const sims = []

function start() {
  ctx.clearRect(0, 0, config.canvas.width, config.canvas.height)
  sims.length = 0
  sims.push(new Sim({ ctx, x: 50, y: 50 }))
}
start()
//#region Update
let timerId

const $play = $('#button-play')
$play.onclick = () => {
  if (timerId) {
    clearInterval(timerId)
  }
  timerId = setInterval(() => {
    sims.forEach((sim) =>
      sim.down()
    )
  }, 150);
}
//#endregion

//#region StopGamte
const $stop = $('#button-stop')
$stop.onclick = () => {
  clearInterval(timerId)
  start()
}
//#endregion