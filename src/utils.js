export const $ = (tag) => {
  if (tag == null || typeof tag !== 'string' || tag.length === 0) {
    throw new Error(`Wrong element tag: ${tag}`)
  }
  return document.querySelector(tag)
}

const HEX_VALUES = '0001123456789abcdeefff'

const getOneRandomHexValue = () => HEX_VALUES[Math.floor(Math.random() * HEX_VALUES.length)]

export const randomColor = () => {
  const color = Array.from({ length: 6 }, getOneRandomHexValue)
  return `#${color.join('')}`
}

export const colorSmallChange = (color) => {
  // #rrggbb
  const validIndexesToChange = [2, 4, 6]
  const indexToChange = validIndexesToChange[Math.floor(Math.random() * validIndexesToChange.length)]

  const codeStart = color.slice(0, indexToChange)

  let mutatedCharacter = ''
  do {
    mutatedCharacter = getOneRandomHexValue()
  } while (mutatedCharacter === color[indexToChange]);

  const codeEnd = color.slice(indexToChange + 1)

  return `${codeStart}${mutatedCharacter}${indexToChange < color.length && codeEnd}`
}