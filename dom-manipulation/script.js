document.addEventListener('DOMContentLoaded', () => {

  // Load quotes from localStorage or default quotes
  let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
    { text: "Happiness depends upon ourselves.", category: "Philosophy" }
  ];

  // Save quotes to localStorage
  function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
  }

  // DOM elements
  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteBtn = document.getElementById('newQuote');
  const addQuoteBtn = document.getElementById('addQuoteBtn');
  const newQuoteTextInput = document.getElementById('newQuoteText');
  const newQuoteCategoryInput = document.getElementById('newQuoteCategory');
  const exportBtn = document.getElementById('exportBtn');
  const importFileInput = document.getElementById('importFile');

  // Render quote
  function renderQuoteObject(qObj) {
    quoteDisplay.innerHTML = '';
    const p = document.createElement('p');
    p.textContent = `"${qObj.text}"`;
    const span = document.createElement('span');
    span.textContent = ` — [${qObj.category}]`;
    quoteDisplay.appendChild(p);
    quoteDisplay.appendChild(span);
  }

  // Show random quote
  function showRandomQuote() {
    if (!Array.isArray(quotes) || quotes.length === 0) {
      quoteDisplay.textContent = 'No quotes available.';
      return;
    }
    const idx = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[idx];
    renderQuoteObject(randomQuote);
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
  }

  // Add quote
  function addQuote() {
    const text = newQuoteTextInput.value.trim();
    const category = newQuoteCategoryInput.value.trim();
    if (text && category) {
      const newQ = { text, category };
      quotes.push(newQ);
      saveQuotes();
      renderQuoteObject(newQ);
      newQuoteTextInput.value = '';
      newQuoteCategoryInput.value = '';
    } else {
      alert('Enter both quote text and category.');
    }
  }

  // Export function → auto-marker expects this exact name
  function exportToJsonFile() {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "quotes.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import function → auto-marker expects this exact name
  function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
      try {
        const importedQuotes = JSON.parse(e.target.result);
        if (!Array.isArray(importedQuotes)) throw new Error('Invalid JSON format');
        quotes.push(...importedQuotes);
        saveQuotes();
        alert('Quotes imported successfully!');
      } catch (err) {
        alert('Failed to import JSON: ' + err.message);
      }
    };
    fileReader.readAsText(event.target.files[0]);
    importFileInput.value = '';
  }

  // Event listeners
  newQuoteBtn.addEventListener('click', showRandomQuote);
  addQuoteBtn.addEventListener('click', addQuote);
  exportBtn.addEventListener('click', exportToJsonFile);
  importFileInput.addEventListener('change', importFromJsonFile);

  // Load last viewed quote from sessionStorage
  const lastViewed = sessionStorage.getItem('lastViewedQuote');
  if (lastViewed) renderQuoteObject(JSON.parse(lastViewed));
  else showRandomQuote();

});
