// =====================================
// Dynamic Quote Generator with Syncing
// =====================================

// Load quotes from localStorage or default
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to create it.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Do one thing every day that scares you.", category: "Motivation" },
];

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ==============
// Notifications
// ==============

function showNotification(message, type = "success") {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.className = type === "warning" ? "warning" : "success";
  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, 4000);
}

// ==============
// Filtering Logic
// ==============

function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const lastFilter = localStorage.getItem("selectedCategory");
  if (lastFilter) {
    categoryFilter.value = lastFilter;
    filterQuotes();
  }
}

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  const quoteDisplay = document.getElementById("quoteDisplay");

  localStorage.setItem("selectedCategory", selectedCategory);

  const filtered =
    selectedCategory === "all"
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes found for this category.</p>";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.innerHTML = `
    <p>"${random.text}"</p>
    <p><em>Category: ${random.category}</em></p>
  `;
}

// ==============
// Quote Management
// ==============

function createAddQuoteForm() {
  const formContainer = document.getElementById("quoteFormContainer");
  formContainer.innerHTML = "";

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(textInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill in both fields!");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  showNotification("Quote added locally!");
  filterQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// ==============
// Server Sync Simulation
// ==============

async function fetchServerQuotes() {
  // Simulated server data fetch (using mock data)
  // In a real case, you’d use: await fetch("https://jsonplaceholder.typicode.com/posts")
  const serverQuotes = [
    { text: "The best way to predict the future is to create it.", category: "Inspiration" },
    { text: "Change the world by being yourself.", category: "Motivation" },
  ];

  handleServerSync(serverQuotes);
}

// Conflict resolution: server data takes precedence
function handleServerSync(serverQuotes) {
  let conflicts = 0;
  let newQuotes = 0;

  serverQuotes.forEach(serverQuote => {
    const existing = quotes.find(q => q.text === serverQuote.text);
    if (existing) {
      if (existing.category !== serverQuote.category) {
        existing.category = serverQuote.category;
        conflicts++;
      }
    } else {
      quotes.push(serverQuote);
      newQuotes++;
    }
  });

  saveQuotes();
  populateCategories();

  if (conflicts > 0) {
    showNotification(`${conflicts} conflicts resolved (server data used).`, "warning");
  } else if (newQuotes > 0) {
    showNotification(`${newQuotes} new quotes synced from server.`);
  } else {
    showNotification("Quotes are up to date!");
  }
}

// Periodic sync (every 30 seconds)
setInterval(fetchServerQuotes, 30000);

// ==============
// JSON Import/Export
// ==============

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        showNotification("Quotes imported successfully!");
      } else {
        showNotification("Invalid JSON format.", "warning");
      }
    } catch (error) {
      showNotification("Error importing quotes.", "warning");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ==============
// Event Listeners & Init
// ==============

document.getElementById("newQuote").addEventListener("click", filterQuotes);
document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);

// Initialize
createAddQuoteForm();
populateCategories();
filterQuotes();
showNotification("App loaded. Syncing with server...");

// Initial sync on load
fetchServerQuotes();
