document.addEventListener('DOMContentLoaded', () => {
  // Array of quote objects
  const quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
    { text: "Happiness depends upon ourselves.", category: "Philosophy" }
  ];

  // DOM elements
  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteBtn = document.getElementById('newQuote');
  const addQuoteBtn = document.getElementById('addQuoteBtn');
  const newQuoteTextInput = document.getElementById('newQuoteText');
  const newQuoteCategoryInput = document.getElementById('newQuoteCategory');

  // Function to display a quote object in the DOM
  function renderQuoteObject(qObj) {
    quoteDisplay.innerHTML = '';
    const p = document.createElement('p');
    p.textContent = `"${qObj.text}"`;
    const span = document.createElement('span');
    span.textContent = ` — [${qObj.category}]`;
    span.style.fontWeight = '700';
    quoteDisplay.appendChild(p);
    quoteDisplay.appendChild(span);
  }

  // Show a random quote
  function displayRandomQuote() {
    if (!Array.isArray(quotes) || quotes.length === 0) {
      quoteDisplay.textContent = 'No quotes available.';
      return;
    }
    const idx = Math.floor(Math.random() * quotes.length);
    renderQuoteObject(quotes[idx]);
  }

  // Add a new quote to the array and update the DOM
  function addQuote() {
    const text = newQuoteTextInput.value.trim();
    const category = newQuoteCategoryInput.value.trim();
    if (text === '' || category === '') {
      alert('Please enter both quote text and a category.');
      return;
    }
    const newQ = { text, category };
    quotes.push(newQ);
    newQuoteTextInput.value = '';
    newQuoteCategoryInput.value = '';
    renderQuoteObject(newQ);
  }

  // Event listeners
  newQuoteBtn.addEventListener('click', displayRandomQuote);
  addQuoteBtn.addEventListener('click', addQuote);

  // Expose functions globally (optional, for testing)
  window.displayRandomQuote = displayRandomQuote;
  window.addQuote = addQuote;
});
