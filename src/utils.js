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
  const validIndexesToChange = [2, 4, 6]
  const indexToChange = Math.floor(Math.random() * validIndexesToChange.length)
  return `${color.slice(0, indexToChange)}${getOneRandomHexValue()}${indexToChange < color.length && color.slice(indexToChange + 1)}`
}