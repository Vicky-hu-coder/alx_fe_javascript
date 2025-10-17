document.addEventListener('DOMContentLoaded', function() {

  let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
    { text: "Happiness depends upon ourselves.", category: "Philosophy" }
  ];

  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteBtn = document.getElementById('newQuote');
  const addQuoteBtn = document.getElementById('addQuoteBtn');
  const newQuoteTextInput = document.getElementById('newQuoteText');
  const newQuoteCategoryInput = document.getElementById('newQuoteCategory');
  const categoryFilter = document.getElementById('categoryFilter');

  function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
  }

  function renderQuote(q) {
    quoteDisplay.textContent = `"${q.text}" — [${q.category}]`;
  }

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

  window.filterQuotes = function() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem('lastSelectedCategory', selectedCategory);
    const filtered = selectedCategory === 'all' ? quotes : quotes.filter(q => q.category === selectedCategory);
    if (filtered.length === 0) {
      quoteDisplay.textContent = 'No quotes in this category.';
      return;
    }
    const idx = Math.floor(Math.random() * filtered.length);
    renderQuote(filtered[idx]);
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(filtered[idx]));
  }

  function showRandomQuote() {
    filterQuotes();
  }

  function addQuote() {
    const text = newQuoteTextInput.value.trim();
    const category = newQuoteCategoryInput.value.trim();
    if (!text || !category) return alert('Enter both text and category.');
    const newQ = { text, category };
    quotes.push(newQ);
    saveQuotes();
    populateCategories();
    filterQuotes();
    newQuoteTextInput.value = '';
    newQuoteCategoryInput.value = '';
  }

  // ======= Server Sync Simulation =======
  async function fetchServerQuotes() {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
      const serverData = await response.json();

      let updated = false;
      serverData.forEach(post => {
        const exists = quotes.some(q => q.text === post.title);
        if (!exists) {
          quotes.push({ text: post.title, category: 'Server' });
          updated = true;
        }
      });

      if (updated) {
        saveQuotes();
        populateCategories();
        filterQuotes();
        showNotification('Quotes updated from server.');
      }

    } catch (err) {
      console.error('Server sync failed:', err);
    }
  }

  function showNotification(msg) {
    const notif = document.createElement('div');
    notif.textContent = msg;
    notif.style.background = '#fffae6';
    notif.style.padding = '10px';
    notif.style.margin = '10px auto';
    notif.style.width = '60%';
    notif.style.border = '1px solid #ffd700';
    notif.style.borderRadius = '5px';
    document.body.insertBefore(notif, quoteDisplay.nextSibling);
    setTimeout(() => notif.remove(), 5000);
  }

  // Periodic sync every 15 seconds (simulate server updates)
  setInterval(fetchServerQuotes, 15000);

  // ======= Event listeners =======
  newQuoteBtn.addEventListener('click', showRandomQuote);
  addQuoteBtn.addEventListener('click', addQuote);

  // ======= Initialize =======
  populateCategories();
  const lastCategory = localStorage.getItem('lastSelectedCategory') || 'all';
  categoryFilter.value = lastCategory;
  filterQuotes();

});
