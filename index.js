import { reformat, toString, toValue } from './formatter.js'
import { ALL_KEYS, KEYS, OPERATORS_PRECEDENCE, ERROR, MAX_DIGITS_DISPLAYED } from './consts.js'

document.addEventListener('DOMContentLoaded', () => {

  const display = document.getElementsByClassName('display')[0].firstElementChild
  const keyboard = document.getElementsByClassName('keyboard')[0]
  const clearButton = keyboard.querySelector('.key.clear button')

  let activeOperatorEl = null

  display.innerText = '0'

  document.addEventListener('keydown', (e) => {
    document.activeElement.blur()
    if (ALL_KEYS.includes(e.key)) {
      const buttonEl = keyboard.querySelector(`button[data-key="${e.key}"]`)
      buttonEl.classList.add('active')
      if (KEYS.operators.includes(buttonEl.dataset.key) && activeOperatorEl !== buttonEl) {
        if (activeOperatorEl) activeOperatorEl.classList.remove('active')
        activeOperatorEl = buttonEl
      }
    }
  })

  document.addEventListener('keyup', (e) => {
    if (ALL_KEYS.includes(e.key)) {
      const buttonEl = keyboard.querySelector(`button[data-key="${e.key}"]`)
      if (!KEYS.operators.includes(buttonEl.dataset.key)) {
        buttonEl.classList.remove('active')
        if (activeOperatorEl) activeOperatorEl.classList.remove('active')
        activeOperatorEl = null
      } else if (buttonEl !== activeOperatorEl) {
        if (activeOperatorEl) activeOperatorEl.classList.remove('active')
        activeOperatorEl = buttonEl
      }
      if (KEYS.clear === buttonEl.dataset.key && operators.length) {
        activeOperatorEl = document.querySelector(`button[data-key="${operators[operators.length - 1]}"]`)
        activeOperatorEl.classList.add("active")
      }
      buttonEl.click()
    }
  })

  keyboard.addEventListener('mousedown', (e) => {
    if (KEYS.operators.includes(e.target.dataset.key)) {
      if (activeOperatorEl) activeOperatorEl.classList.remove('active')
      activeOperatorEl = e.target
      e.target.classList.add('active')
    } else {
      e.target.classList.add('active')
    }
  })

  keyboard.addEventListener('mouseup', (e) => {
    if (!KEYS.operators.includes(e.target.dataset.key)) {
      e.target.classList.remove('active')
      if (activeOperatorEl) activeOperatorEl.classList.remove('active')
      activeOperatorEl = null
    }
    if (KEYS.clear === e.target.dataset.key && operators.length) {
      activeOperatorEl = document.querySelector(`button[data-key="${operators[operators.length - 1]}"]`)
      activeOperatorEl.classList.add("active")
    }
  })

  keyboard.addEventListener('mouseout', (e) => {
    if (e.target.classList.contains('active') && !KEYS.operators.includes(e.target.dataset.key)) {
      e.target.classList.remove('active')
    }
  })

  keyboard.addEventListener('click', (e) => {
    if (e.target) handleButtonPress(e.target.dataset.key)
  })

  let operands = [0]
  let operators = []
  let lastKey = null
  let savedOperand = 0
  let savedOperator = null

  function handleButtonPress(key) {
    if (KEYS.digits.includes(key)) {
      handleDigit(key)
    } else if (KEYS.operators.includes(key)) {
      handleOperator(key)
    } else if (KEYS.calculate === key) {
      calculate()
    } else if (KEYS.clear === key) {
      if (clearButton.innerText === 'C') {
        clear()
      } else {
        clearAll()
      }
    }
    lastKey = key
  }

  function handleDigit(digit) {
    if (digit !== '0') clearButton.innerText = 'C'
    if (display.innerText.replace(/[ ,-]/g, '').length < MAX_DIGITS_DISPLAYED || KEYS.operators.includes(lastKey)) {
      if (KEYS.operators.includes(lastKey) || operands.length === 0) {
        operands.push(0)
        display.innerText = ''
      }
      if (lastKey === KEYS.calculate) {
        operands[0] = 0
        display.innerText = ''
      }
      if (digit === ',') {
        if (display.innerText === '' || display.innerText === '0') {
          display.innerText = '0,'
        } else if (!display.innerText.includes(',')) {
          display.innerText += ','
        }
      } else {
        if (display.innerText === '0') {
          display.innerText = digit
        } else {
          display.innerText = reformat(display.innerText + digit)
        }
      }
      savedOperand = toValue(display.innerText)
      operands[operands.length - 1] = toValue(display.innerText)
    }
  }

  function handleOperator(operator) {
    savedOperator = operator
    savedOperand = toValue(display.innerText)

    if (!KEYS.operators.includes(lastKey)) {
      const lastOperator = operators.length && operators[operators.length - 1]
      if (lastOperator && OPERATORS_PRECEDENCE[operator] <= OPERATORS_PRECEDENCE[lastOperator]) {
        calculate()
        if (lastKey !== KEYS.calculate) {
          savedOperand = toValue(display.innerText)
        }
      }
      operators.push(operator)
    } else {
      operators[operators.length - 1] = operator
    }
  }

  function calculate() {
    if (!savedOperator) return
    if (operands.length === 1) operands.push(savedOperand)
    let roundedResultString
    while (operands.length > 1) {
      const right = operands.pop()
      const left = operands.length ? operands.pop() : savedOperand
      const operator = operators.pop() || savedOperator
      let result = performOperation(left, right, operator)
      roundedResultString = result !== ERROR ? round(result, MAX_DIGITS_DISPLAYED) : ERROR
      operands.push(roundedResultString !== ERROR ? parseFloat(roundedResultString) : ERROR)
    }
    display.innerText = roundedResultString !== ERROR ? toString(roundedResultString) : ERROR
  }

  function performOperation(left, right, operator) {
    if (left === ERROR || right === ERROR) return ERROR
    let result
    if (operator === '+') {
      result = left + right
    } else if (operator === '-') {
      result = left - right
    } else if (operator === '*') {
      result = left * right
    } else if (operator === '/') {
      if (right === 0) return ERROR
      result = left / right
    } else {
      throw new Error(`Unknown operator: ${operator}`)
    }
    return Number.isFinite(result) ? result : ERROR
  }

  function clear() {
    display.innerText = 0
    if (operators.length > 0) savedOperand = 0
    if (operators.length && operands.length === 1) operands.push(0)
    clearButton.innerText = 'AC'
    if (operands.length) operands[operands.length - 1] = 0
  }

  function clearAll() {
    operators = []
    operands = [0]
    savedOperand = 0
    savedOperator = null
    lastKey = null
    display.innerText = '0'
  }

  function round(number, precision) {
    let result = number
    let i = precision
    while (result.toString().replace(/[.]/, '').length > precision) {
      result = number.toPrecision(i--)
    }
    return result
  }

})
