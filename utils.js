export const $ = (tag) => {
  if (tag == null || typeof tag !== 'string' || tag.length === 0) {
    throw new Error(`Wrong element tag: ${tag}`)
  }
  return document.querySelector(tag)
}