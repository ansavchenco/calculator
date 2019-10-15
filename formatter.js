import { SPACING_RANGE } from './consts.js'

export function reformat(value, separator = ',') {
  let [intPart, floatPart] = value.split(separator)
  if (!intPart.includes('e')) {
    const formatted = addSpacings(removeSpacings(intPart))
    return floatPart ? [formatted, floatPart].join(separator) : formatted
  }
  return value
}

export function toValue(string) {
  return parseFloat(removeSpacings(string.replace(',', '.')))
}

export function toString(value) {
  return reformat(value.toString().replace('.', ','))
}

function removeSpacings(value) {
  return value.split(' ').join('')
}

function addSpacings(value) {
  const firstChar = value[0]
  const valueArray = firstChar === '-' ? Array.from(value.slice(1)) : Array.from(value)
  let left = valueArray.length
  while (left > SPACING_RANGE) {
    valueArray.splice(left - SPACING_RANGE, 0, ' ')
    left -= SPACING_RANGE
  }
  return firstChar === '-' ? ['-', ...valueArray].join('') : valueArray.join('')
}
