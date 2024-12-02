'use strict'

import { Sim } from "./sim.js"
import { config } from "./config.js"
import { $ } from "./utils.js"

const canvas = $('canvas#game')

canvas.width = config.canvas.width
canvas.height = config.canvas.height

const ctx = canvas.getContext('2d')

ctx.fillStyle = getComputedStyle($(':root')).getPropertyValue('--color-primary')
ctx.fillRect(50, 50, 20, 20)