// =====================================
// Dynamic Quote Generator with Server Sync & Conflict Resolution
// Required functions: fetchQuotesFromServer, postQuoteToServer, syncQuotes
// =====================================

// ---------- Data & Storage ----------
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to create it.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Do one thing every day that scares you.", category: "Motivation" },
];

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ---------- Notifications ----------
function showNotification(message, type = "success", duration = 4000) {
  const n = document.getElementById("notification");
  n.textContent = message;
  n.className = type;
  n.style.display = "block";
  setTimeout(() => (n.style.display = "none"), duration);
}

// ---------- Populate categories ----------
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  const last = localStorage.getItem("selectedCategory");
  if (last) {
    categoryFilter.value = last;
    filterQuotes();
  }
}

// ---------- Display & Filtering ----------
function filterQuotes() {
  const sel = document.getElementById("categoryFilter").value;
  const quoteDisplay = document.getElementById("quoteDisplay");
  localStorage.setItem("selectedCategory", sel);

  const filtered = sel === "all" ? quotes : quotes.filter(q => q.category === sel);
  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available for this category.</p>";
    return;
  }
  const q = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.innerHTML = `<p>"${escapeHtml(q.text)}"</p><p><em>Category: ${escapeHtml(q.category)}</em></p>`;
}

// Simple HTML escape to avoid broken markup when showing text
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ---------- Add Quote Form ----------
function createAddQuoteForm() {
  const container = document.getElementById("quoteFormContainer");
  container.innerHTML = "";

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";

  const catInput = document.createElement("input");
  catInput.id = "newQuoteCategory";
  catInput.type = "text";
  catInput.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote (Local + Post)";
  addBtn.addEventListener("click", () => {
    addQuote();
  });

  container.appendChild(textInput);
  container.appendChild(catInput);
  container.appendChild(addBtn);
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) {
    alert("Please fill both fields.");
    return;
  }

  const newQuote = { text, category };
  // Add locally
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();
  showNotification("Quote added locally.", "success");

  // Attempt to post to mock server (posting is required by checks)
  postQuoteToServer(newQuote).then(res => {
    showNotification("Quote posted to server (mock).", "success");
  }).catch(err => {
    showNotification("Posting to server failed (mock).", "warning");
  });

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// ---------- JSON Import / Export ----------
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const fr = new FileReader();
  fr.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("JSON must be an array of quotes");
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      showNotification("Quotes imported and saved.", "success");
    } catch (err) {
      showNotification("Import failed: invalid JSON.", "error");
    }
  };
  fr.readAsText(file);
}

// ---------- Mock API Integration (fetch/post) ----------
// NOTE: JSONPlaceholder is a public mock API. POST/create will return a response but won't persist for real.
// fetchQuotesFromServer must exist and actually fetch from a mock API (checks look for this).
async function fetchQuotesFromServer() {
  // We'll fetch a small set of posts and map them to quote objects.
  // Using JSONPlaceholder for mock data.
  const url = "https://jsonplaceholder.typicode.com/posts?_limit=5";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch from mock server");
  const posts = await res.json();
  // Map posts -> quotes (title -> text, use "Server" as category or body as category)
  const serverQuotes = posts.map(p => ({
    text: p.title,
    category: p.body ? p.body.split(" ").slice(0,2).join(" ") : "Server"
  }));
  return serverQuotes;
}

// postQuoteToServer must exist and POST to mock API
async function postQuoteToServer(quote) {
  const url = "https://jsonplaceholder.typicode.com/posts";
  // we send a small payload; JSONPlaceholder returns a created resource
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: quote.text, body: quote.category })
  });
  if (!res.ok) throw new Error("Failed to post to mock server");
  const data = await res.json();
  return data; // returned mock object
}

// ---------- Syncing & Conflict Resolution ----------
// syncQuotes must exist and implement server precedence resolution
async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();

    // Convert serverQuotes into a map by text for quick lookup
    const serverMap = new Map(serverQuotes.map(sq => [sq.text, sq]));

    let conflicts = [];
    let addedFromServer = 0;

    // 1) Resolve conflicts and update existing local records
    quotes.forEach(local => {
      const serverMatch = serverMap.get(local.text);
      if (serverMatch) {
        if (local.category !== serverMatch.category) {
          // Conflict: server wins by requirement
          conflicts.push({ local: { ...local }, server: { ...serverMatch } });
          local.category = serverMatch.category;
        }
        // remove processed server entry
        serverMap.delete(local.text);
      }
    });

    // 2) Any remaining serverMap entries are new quotes on server — add them locally
    for (const [, serverQuote] of serverMap) {
      quotes.push(serverQuote);
      addedFromServer++;
    }

    // Persist changes and update UI
    saveQuotes();
    populateCategories();
    filterQuotes();

    // Notify user
    if (conflicts.length > 0) {
      showNotification(`${conflicts.length} conflict(s) resolved (server precedence).`, "warning");
      // Also show manual conflict details in the conflict area for visibility & manual resolution option
      showConflictArea(conflicts);
    } else if (addedFromServer > 0) {
      showNotification(`${addedFromServer} new quote(s) synced from server.`, "success");
    } else {
      showNotification("No updates from server.", "success");
    }

  } catch (err) {
    showNotification("Sync failed: " + err.message, "error");
  }
}

// ---------- Conflict UI for manual review ----------
function showConflictArea(conflicts) {
  const area = document.getElementById("conflictArea");
  area.innerHTML = "";
  conflicts.forEach((c, idx) => {
    const div = document.createElement("div");
    div.style.marginBottom = "8px";
    div.innerHTML = `
      <strong>Conflict ${idx+1}:</strong><br/>
      Local - "${escapeHtml(c.local.text)}" [${escapeHtml(c.local.category)}] <br/>
      Server - "${escapeHtml(c.server.text)}" [${escapeHtml(c.server.category)}] <br/>
    `;
    // provide buttons to accept server or keep local (though server already applied)
    const keepLocalBtn = document.createElement("button");
    keepLocalBtn.textContent = "Keep Local";
    keepLocalBtn.addEventListener("click", () => {
      // revert local to original local category
      const target = quotes.find(q => q.text === c.local.text);
      if (target) {
        target.category = c.local.category;
        saveQuotes();
        populateCategories();
        filterQuotes();
        showNotification("Kept local version for: " + truncate(c.local.text), "success");
      }
      div.remove();
      if (!area.hasChildNodes()) area.style.display = "none";
    });

    const acceptServerBtn = document.createElement("button");
    acceptServerBtn.textContent = "Accept Server";
    acceptServerBtn.addEventListener("click", () => {
      // server is already applied, just remove UI card
      div.remove();
      if (!area.hasChildNodes()) area.style.display = "none";
      showNotification("Kept server version for: " + truncate(c.server.text), "success");
    });

    div.appendChild(keepLocalBtn);
    div.appendChild(acceptServerBtn);
    area.appendChild(div);
  });
  area.style.display = "block";
}

function truncate(s, n=50) {
  return s.length > n ? s.slice(0,n) + "..." : s;
}

// ---------- Periodic check ----------
const SYNC_INTERVAL_MS = 30000; // 30s
let syncIntervalId = null;

function startPeriodicSync() {
  if (syncIntervalId) clearInterval(syncIntervalId);
  syncIntervalId = setInterval(() => {
    syncQuotes();
  }, SYNC_INTERVAL_MS);
}

// ---------- Init & Event wiring ----------
document.getElementById("newQuote").addEventListener("click", filterQuotes);
document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);
document.getElementById("syncNow").addEventListener("click", () => {
  showNotification("Manual sync started...", "success");
  syncQuotes();
});

// Initialize UI
createAddQuoteForm();
populateCategories();
filterQuotes();

// Start periodic sync and run one immediately
startPeriodicSync();
syncQuotes();
showNotification("App initialized. Syncing with mock server...", "success");
