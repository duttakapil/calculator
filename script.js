//An alias to the view element
const view = document.getElementById('view-in')

const answerView = document.getElementById('answer')

//Adding click event listerners to all buttons
const buttons = document.querySelectorAll('button');

for(let i = 0; i < buttons.length; i++) {
  let elem = buttons[i];
  elem.addEventListener('click', function() {
    addThis(elem.textContent)
  })
}

//Check if provided value is valid equation
function checkValue(equation) {
  const REGEX = /\-?([0-9]+)\.?([0-9]+)?/g, MATCHED_VALUE = equation.match(REGEX)
  if (MATCHED_VALUE) return equation === MATCHED_VALUE[0]
}

//Get the operators present in the equation
function getOperators(equation) {
  const OPERATOR_REGEX = /(\÷|\x|\-|\+)/g
  return equation.match(OPERATOR_REGEX)
}

//Get the index of the last operator in the equation
function getOperatorIndex(equation) {
  //Collect all operators from the equation
  const MATCHED_VALUE =   getOperators(equation)
  //Pop the last operator from the matched values and get it's index from the right of the equation
  if (MATCHED_VALUE) return equation.lastIndexOf(MATCHED_VALUE.pop())
  return NaN
}

//Get the RHS (right-hand-side) value of the current equation in view
function getRHS(equation) {
  //slice the equation from the last operator to the end of the string, giving the RHS
  return equation.slice(getOperatorIndex(equation) + 1)
}

function getLHS(equation) {
  return equation.slice(0, equation.lastIndexOf(getRHS(equation)))
}

//Add comma's whereever required to the current equation
function addComma(equation, view) {
  //equation = stripComma(equation)

  if(checkValue(stripComma(equation))) {
    view.innerHTML = rewrite(equation)
  }

  else {
    const RHS = getRHS(equation), LHS = getLHS(equation)
    view.innerHTML = LHS + rewrite(RHS)
  }

  function rewrite(equation) {
    equation = stripComma(equation)
    if(equation.length > 3 && equation.indexOf('.') === -1) {
      return breakString(equation).join(',')
    }
    else return equation;
  }

  function breakString(string) {
    const REVERSE_EQUATION = string.split('').reverse().join('')
    let arr = [], count = 0
    for(let i = 3; i < REVERSE_EQUATION.length;  i += 3){
      arr.push(REVERSE_EQUATION.slice(i-3, i))
      count = i
    }
    arr.push(REVERSE_EQUATION.slice(count))
    return arr.map(function (e) { return e.split('').reverse().join('')}).reverse()
  }
}

function updateChar(equation, oldChar, newChar) {
  return equation.split('').map(function(elem) {
    return elem === oldChar ? newChar : elem
  }).join('')
}

function stripComma(equation) {
  return updateChar(equation, ',', '')
}

//Add typed/clicked value to the equation
function addThis(value) {
  let EQUATION = view.innerHTML
  if(value === '*') value = 'x'
  if(value === '/') value = '÷';

  //If view is empty and the key pressed is '-', just update the view with '-'
  //This is being done because I couldn't figure out how to select the '-' at the start of an equation on it's own, when it's optional
  if(!EQUATION && value === '-') updateEquation(value, "update")
  //If the key pressed is an operator, do the following
  //Make sure view is not empty and check if the key pressed is an operator
  else if(EQUATION && getOperators(value)){
    //Make sure the equation till now is a valueid number. If so, just update the view with the operator
    if(checkValue(EQUATION)) updateEquation(value, "update")
    //Check if the last character is an operator
    else if (getOperators(EQUATION.split('').pop())) {
      const NEW_EQUATION = EQUATION.split('').map(function(elem, index) {
        return index === EQUATION.length - 1 ? value : elem
      }).join('')
      updateEquation(NEW_EQUATION, "rewrite")
    }
    else if (getRHS(EQUATION)){
      updateEquation(value, "update")
    }
  }
  //Make sure equation is not empty and then check if the index of the last opeator is less than or equal to the length of equation
  else if (EQUATION && getOperatorIndex(EQUATION) <= EQUATION.length) {
    EQUATION += value
    const RHS = getRHS(EQUATION)
    if(checkValue(stripComma(RHS))) updateEquation(value, "update")
  }
  //
  else {
    EQUATION += value
    if(checkValue(stripComma(EQUATION))){
      updateEquation(value, "update")
    }
  }
}

//Add keybord listerners event to the window
window.addEventListener("keydown", function (e) {
  const key = e.key, keys = ['/', '*', '-', '+', '.']
  if(!isNaN(key) || keys.indexOf(key) !== -1) addThis(key)
  else if(key === 'Enter') equal()
  else if(key === 'Delete') clr()
  else if(key === 'Backspace') backspace()
})

//Clear the view
function clr() {
  updateEquation("", "rewrite")
}

//Remove the last character from the view
function backspace() {
  const eq = view.innerHTML
  updateEquation(eq.slice(0, eq.length - 1), "rewrite")
}

//Evalurate the current equation in view
function equal() {
  const eq = updateChar(updateChar(stripComma(view.innerHTML), 'x', '*'), '÷', '/');
  //eq = updateChar(stripComma(view.innerHTML), '÷', '/');
  updateEquation(eval(eq), "rewrite")
}

function autoAnwer() {
  if (getOperatorIndex(view.innerHTML) < view.innerHTML.length - 1){
    answerView.innerHTML = eval(updateChar(updateChar(stripComma(view.innerHTML), 'x', '*'), '÷', '/'))
    addComma(answerView.innerHTML, answerView)
  }
  else answerView.innerHTML = ""
}

//Update the font size of the equation in view as it's changed
function updateFontSize() {
  const len = stripComma(view.innerHTML).length
  if ( len < 10) view.style.fontSize = '40px'
  else if (len < 15) view.style.fontSize = '30px'
  else if (len < 20) view.style.fontSize = '20px'
}

//Update the equation in the view
function updateEquation(EQUATION, action) {
  // updateChar(EQUATION, '/', '÷');
  if(action === "rewrite") view.innerHTML = EQUATION;
  if(action === "update") view.innerHTML += EQUATION
  addComma(view.innerHTML, view)
  updateFontSize()
  autoAnwer()
}