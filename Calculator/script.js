const displayEl = document.getElementById('display');
const trailEl = document.getElementById('trail');

let current = '0';
let previous = null;
let operator = null;
let overwrite = true;

const opSymbols = { '+':'+', '−':'−', '×':'×', '÷':'÷' };

function formatNumber(numStr){
  if (numStr === 'Error') return numStr;
  const [intPart, decPart] = numStr.split('.');
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
}

function updateDisplay(){
  displayEl.textContent = formatNumber(current);
  trailEl.textContent = previous !== null && operator
    ? `${formatNumber(previous)} ${operator}`
    : '\u00A0';
}

function inputDigit(d){
  if (overwrite){
    current = d === '.' ? '0.' : d;
    overwrite = false;
  } else {
    if (current.length >= 14) return;
    current += d;
  }
  updateDisplay();
}

function inputDecimal(){
  if (overwrite){
    current = '0.';
    overwrite = false;
    updateDisplay();
    return;
  }
  if (!current.includes('.')) current += '.';
  updateDisplay();
}

function clearAll(){
  current = '0';
  previous = null;
  operator = null;
  overwrite = true;
  updateDisplay();
}

function backspace(){
  if (overwrite) return;
  current = current.length > 1 ? current.slice(0, -1) : '0';
  if (current === '-' || current === '') current = '0';
  if (current === '0') overwrite = true;
  updateDisplay();
}

function percent(){
  const val = parseFloat(current);
  if (isNaN(val)) return;
  current = String(val / 100);
  updateDisplay();
}

function compute(a, b, op){
  switch(op){
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? NaN : a / b;
    default: return b;
  }
}

function roundResult(n){
  return Math.round((n + Number.EPSILON) * 1e10) / 1e10;
}

function chooseOperator(op){
  const inputVal = parseFloat(current);

  if (operator && !overwrite){
    const result = compute(previous, inputVal, operator);
    if (isNaN(result)){
      showError();
      return;
    }
    previous = roundResult(result);
    current = String(previous);
  } else {
    previous = inputVal;
  }

  operator = op;
  overwrite = true;
  updateDisplay();
}

function equals(){
  if (operator === null || previous === null) return;
  const inputVal = parseFloat(current);
  const result = compute(previous, inputVal, operator);
  if (isNaN(result)){
    showError();
    return;
  }
  current = String(roundResult(result));
  previous = null;
  operator = null;
  overwrite = true;
  updateDisplay();
}

function showError(){
  current = 'Error';
  previous = null;
  operator = null;
  overwrite = true;
  displayEl.textContent = current;
  trailEl.textContent = 'Division by zero';
}

function flashKey(btn){
  if (!btn) return;
  btn.classList.add('active-flash');
  setTimeout(() => btn.classList.remove('active-flash'), 110);
}

document.querySelector('.keys').addEventListener('click', (e) => {
  const btn = e.target.closest('.key');
  if (!btn) return;
  const { action, value } = btn.dataset;

  if (action === 'digit') inputDigit(value);
  else if (action === 'decimal') inputDecimal();
  else if (action === 'clear') clearAll();
  else if (action === 'backspace') backspace();
  else if (action === 'percent') percent();
  else if (action === 'operator') chooseOperator(value);
  else if (action === 'equals') equals();
});

const keyMap = {
  '0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9',
  '+':'+', '-':'−', '*':'×', '/':'÷'
};

window.addEventListener('keydown', (e) => {
  const k = e.key;

  if (keyMap[k] && '0123456789'.includes(k)){
    inputDigit(k);
    flashKey(document.querySelector(`[data-action="digit"][data-value="${k}"]`));
    return;
  }
  if (k === '.' || k === ','){
    inputDecimal();
    flashKey(document.querySelector('[data-action="decimal"]'));
    return;
  }
  if (['+','-','*','/'].includes(k)){
    e.preventDefault();
    const sym = keyMap[k];
    chooseOperator(sym);
    flashKey(document.querySelector(`[data-action="operator"][data-value="${sym}"]`));
    return;
  }
  if (k === 'Enter' || k === '='){
    e.preventDefault();
    equals();
    flashKey(document.querySelector('[data-action="equals"]'));
    return;
  }
  if (k === 'Backspace'){
    backspace();
    flashKey(document.querySelector('[data-action="backspace"]'));
    return;
  }
  if (k === 'Escape'){
    clearAll();
    flashKey(document.querySelector('[data-action="clear"]'));
    return;
  }
  if (k === '%'){
    percent();
    flashKey(document.querySelector('[data-action="percent"]'));
    return;
  }
});

updateDisplay();
