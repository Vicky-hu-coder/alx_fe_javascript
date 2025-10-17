document.addEventListener('DOMContentLoaded', function() {
  // Quotes array
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
  const categoryFilter = document.getElementById('categoryFilter');

  // Save quotes to localStorage
  function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
  }

  // Render quote
  function renderQuote(q) {
    quoteDisplay.textContent = `"${q.text}" — [${q.category}]`;
  }

  // Populate category dropdown
  function populateCategories() {
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    const cats = Array.from(new Set(quotes.map(q => q.category)));
    cats.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      categoryFilter.appendChild(option);
    });
  }

  // Filter quotes based on selected category
  window.filterQuotes = function() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem('lastSelectedCategory', selectedCategory); // save category
    const filtered = selectedCategory === 'all' ? quotes : quotes.filter(q => q.category === selectedCategory);
    if (filtered.length === 0) {
      quoteDisplay.textContent = 'No quotes in this category.';
      return;
    }
    const idx = Math.floor(Math.random() * filtered.length);
    renderQuote(filtered[idx]);
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(filtered[idx]));
  }

  // Show random quote
  function showRandomQuote() {
    filterQuotes();
  }

  // Add new quote
  function addQuote() {
    const text = newQuoteTextInput.value.trim();
    const category = newQuoteCategoryInput.value.trim();
    if (!text || !category) return alert('Enter both text and category.');
    const newQ = { text, category };
    quotes.push(newQ);
    saveQuotes();
    populateCategories();
    filterQuotes(); // show respecting current filter
    newQuoteTextInput.value = '';
    newQuoteCategoryInput.value = '';
  }

  // Event listeners
  newQuoteBtn.addEventListener('click', showRandomQuote);
  addQuoteBtn.addEventListener('click', addQuote);

  // Initialize categories
  populateCategories();

  // Restore last selected category before filtering
  const lastCategory = localStorage.getItem('lastSelectedCategory') || 'all';
  categoryFilter.value = lastCategory;

  // Display filtered quote immediately
  filterQuotes();
});
