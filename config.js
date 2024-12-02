'use strict'
import { $ } from "./utils.js"

export const config = {
  canvas: {
    width: 1024,
    height: 1024
  },
  sim: {
    baseColor: getComputedStyle($(':root')).getPropertyValue('--color-sim'),
    width: 20,
    height: 60
  }
} 