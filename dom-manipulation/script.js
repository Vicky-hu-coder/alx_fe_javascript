document.addEventListener('DOMContentLoaded', () => {

  // Load quotes from localStorage or default
  let quotes = JSON.parse(localStorage.getItem('quotes')) || [
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
  const exportBtn = document.getElementById('exportBtn');
  const importFileInput = document.getElementById('importFile');
  const categoryFilterSelect = document.getElementById('categoryFilter');

  // Save quotes to localStorage
  function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
  }

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

  // Populate categories dropdown dynamically
  function populateCategories() {
    const categories = Array.from(new Set(quotes.map(q => q.category)));
    categoryFilterSelect.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      categoryFilterSelect.appendChild(option);
    });
    // Restore last selected category
    const lastCategory = localStorage.getItem('lastSelectedCategory') || 'all';
    categoryFilterSelect.value = lastCategory;
  }

  // Filter quotes
  window.filterQuotes = function() {
    const selected = categoryFilterSelect.value;
    localStorage.setItem('lastSelectedCategory', selected);
    const filteredQuotes = selected === 'all' ? quotes : quotes.filter(q => q.category === selected);
    if (filteredQuotes.length === 0) {
      quoteDisplay.textContent = 'No quotes in this category.';
      return;
    }
    const idx = Math.floor(Math.random() * filteredQuotes.length);
    renderQuoteObject(filteredQuotes[idx]);
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(filteredQuotes[idx]));
  }

  // Show random quote
  function showRandomQuote() {
    filterQuotes(); // reuse filtering logic
  }

  // Add new quote
  function addQuote() {
    const text = newQuoteTextInput.value.trim();
    const category = newQuoteCategoryInput.value.trim();
    if (!text || !category) return alert('Enter both quote and category.');
    const newQ = { text, category };
    quotes.push(newQ);
    saveQuotes();
    populateCategories(); // update categories dropdown
    renderQuoteObject(newQ);
    newQuoteTextInput.value = '';
    newQuoteCategoryInput.value = '';
  }

  // Export quotes
  function exportToJsonFile() {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "quotes.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import quotes
  function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
      try {
        const importedQuotes = JSON.parse(e.target.result);
        if (!Array.isArray(importedQuotes)) throw new Error('Invalid JSON');
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
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

  // Initialize categories dropdown
  populateCategories();

  // Load last viewed quote from sessionStorage
  const lastViewed = sessionStorage.getItem('lastViewedQuote');
  if (lastViewed) renderQuoteObject(JSON.parse(lastViewed));
  else showRandomQuote();

});
