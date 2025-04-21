export const $ = (tag) => {
  if (tag == null || typeof tag !== 'string' || tag.length === 0) {
    throw new Error(`Wrong element tag: ${tag}`)
  }
  return document.querySelector(tag)
}

const HEX_VALUES = '0123456789abcdef'

const getOneRandomHexValue = () => HEX_VALUES.slice(8)[Math.floor(Math.random() * HEX_VALUES.length / 2)]

const FORBIDEN_RANDOM_COLORS = ['#ffffff', '#000000']

export const randomColor = () => {
  const color = `#${Array.from({ length: 6 }, getOneRandomHexValue).join('')}`
  return FORBIDEN_RANDOM_COLORS.includes(color) ? randomColor() : color
}

export const colorSmallChange = (color) => {
  // #rrggbb
  let changedColor = ''
  const chars = color.split('')

  do {
    chars[1] = getOneRandomHexValue()
    chars[3] = getOneRandomHexValue()
    chars[5] = getOneRandomHexValue()
    changedColor = chars.join('')
  } while (color === changedColor);

  return changedColor
}