export const $ = (tag) => {
  if (tag == null || typeof tag !== 'string' || tag.length === 0) {
    throw new Error(`Wrong element tag: ${tag}`)
  }
  return document.querySelector(tag)
}

const HEX_VALUES = '0123456789abcdef'

const getOneRandomHexValue = () => HEX_VALUES[Math.floor(Math.random() * HEX_VALUES.length)]

export const randomColor = () => {
  const color = Array.from({ length: 6 }, getOneRandomHexValue)
  return `#${color.join('')}`
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