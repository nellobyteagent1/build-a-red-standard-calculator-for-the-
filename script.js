(() => {
  'use strict';

  const display = document.getElementById('display');
  const expression = document.getElementById('expression');
  const buttons = document.querySelectorAll('.btn');

  let currentValue = '0';
  let previousValue = '';
  let operator = null;
  let shouldResetDisplay = false;
  let lastResult = null;

  const OPERATOR_SYMBOLS = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  const MAX_DIGITS = 15;

  function updateDisplay() {
    display.textContent = formatDisplay(currentValue);
    display.classList.toggle('shrink', currentValue.length > 10);
  }

  function formatDisplay(value) {
    if (value === 'Error') return 'Error';
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    // If it contains a decimal point being typed, preserve it
    if (value.includes('.') && value.endsWith('.')) return value;
    if (value.includes('.') && value.endsWith('0') && value.indexOf('.') < value.length - 1) return value;
    // Format large/small numbers
    if (Math.abs(num) >= 1e15 || (Math.abs(num) < 1e-10 && num !== 0)) {
      return num.toExponential(6);
    }
    return value;
  }

  function updateExpression() {
    if (operator && previousValue) {
      expression.textContent = `${formatDisplay(previousValue)} ${OPERATOR_SYMBOLS[operator]}`;
    } else {
      expression.textContent = '';
    }
  }

  function clearActiveOperator() {
    document.querySelectorAll('.btn.op').forEach(b => b.classList.remove('active'));
  }

  function highlightOperator(op) {
    clearActiveOperator();
    document.querySelectorAll('.btn.op').forEach(b => {
      if (b.dataset.value === op) b.classList.add('active');
    });
  }

  function inputDigit(digit) {
    if (shouldResetDisplay) {
      currentValue = digit;
      shouldResetDisplay = false;
    } else if (currentValue === '0' && digit !== '0') {
      currentValue = digit;
    } else if (currentValue === '0' && digit === '0') {
      return;
    } else {
      if (currentValue.replace(/[^0-9]/g, '').length >= MAX_DIGITS) return;
      currentValue += digit;
    }
    updateDisplay();
  }

  function inputDecimal() {
    if (shouldResetDisplay) {
      currentValue = '0.';
      shouldResetDisplay = false;
    } else if (!currentValue.includes('.')) {
      currentValue += '.';
    }
    updateDisplay();
  }

  function calculate(a, b, op) {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    switch (op) {
      case '+': return numA + numB;
      case '-': return numA - numB;
      case '*': return numA * numB;
      case '/': return numB === 0 ? 'Error' : numA / numB;
      default: return numB;
    }
  }

  function handleOperator(nextOp) {
    const current = parseFloat(currentValue);

    if (operator && !shouldResetDisplay) {
      const result = calculate(previousValue, currentValue, operator);
      if (result === 'Error') {
        currentValue = 'Error';
        previousValue = '';
        operator = null;
        clearActiveOperator();
        updateDisplay();
        updateExpression();
        return;
      }
      currentValue = String(parseFloat(result.toFixed(12)));
      previousValue = currentValue;
    } else {
      previousValue = currentValue;
    }

    operator = nextOp;
    shouldResetDisplay = true;
    highlightOperator(nextOp);
    updateDisplay();
    updateExpression();
  }

  function handleEquals() {
    if (!operator || !previousValue) return;

    const result = calculate(previousValue, currentValue, operator);
    expression.textContent = `${formatDisplay(previousValue)} ${OPERATOR_SYMBOLS[operator]} ${formatDisplay(currentValue)} =`;

    if (result === 'Error') {
      currentValue = 'Error';
    } else {
      lastResult = result;
      currentValue = String(parseFloat(result.toFixed(12)));
    }

    previousValue = '';
    operator = null;
    shouldResetDisplay = true;
    clearActiveOperator();
    updateDisplay();
  }

  function handleClear() {
    currentValue = '0';
    previousValue = '';
    operator = null;
    shouldResetDisplay = false;
    lastResult = null;
    clearActiveOperator();
    updateDisplay();
    updateExpression();
  }

  function handleBackspace() {
    if (shouldResetDisplay || currentValue === 'Error') {
      handleClear();
      return;
    }
    currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : '0';
    updateDisplay();
  }

  function handlePercent() {
    const num = parseFloat(currentValue);
    if (isNaN(num)) return;
    if (operator && previousValue) {
      // 100 + 10% = 110 (percentage of previous value)
      currentValue = String(parseFloat((parseFloat(previousValue) * num / 100).toFixed(12)));
    } else {
      currentValue = String(parseFloat((num / 100).toFixed(12)));
    }
    updateDisplay();
  }

  function handleButton(btn) {
    const action = btn.dataset.action;
    switch (action) {
      case 'digit':
        if (currentValue === 'Error') handleClear();
        inputDigit(btn.dataset.value);
        if (shouldResetDisplay) clearActiveOperator();
        break;
      case 'decimal':
        if (currentValue === 'Error') handleClear();
        inputDecimal();
        break;
      case 'operator':
        if (currentValue === 'Error') return;
        handleOperator(btn.dataset.value);
        break;
      case 'equals':
        handleEquals();
        break;
      case 'clear':
        handleClear();
        break;
      case 'backspace':
        handleBackspace();
        break;
      case 'percent':
        handlePercent();
        break;
    }
  }

  // Click handlers
  buttons.forEach(btn => {
    btn.addEventListener('click', () => handleButton(btn));
  });

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (key >= '0' && key <= '9') {
      e.preventDefault();
      if (currentValue === 'Error') handleClear();
      inputDigit(key);
    } else if (key === '.') {
      e.preventDefault();
      inputDecimal();
    } else if (key === '+' || key === '-') {
      e.preventDefault();
      handleOperator(key);
    } else if (key === '*') {
      e.preventDefault();
      handleOperator('*');
    } else if (key === '/') {
      e.preventDefault();
      handleOperator('/');
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      handleEquals();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
      e.preventDefault();
      handleClear();
    } else if (key === 'Backspace') {
      e.preventDefault();
      handleBackspace();
    } else if (key === '%') {
      e.preventDefault();
      handlePercent();
    }
  });

  updateDisplay();
})();
