document.addEventListener("DOMContentLoaded", () => {

  // ===== SERVER CONFIG =====
  const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

  // ===== LOCAL STORAGE FUNCTIONS =====
  function getLocalQuotes() {
    return JSON.parse(localStorage.getItem("quotes")) || [];
  }

  function saveLocalQuotes(quotes) {
    localStorage.setItem("quotes", JSON.stringify(quotes));
  }

  // ===== POST QUOTE TO SERVER =====
  async function postQuoteToServer(quote) {
    try {
      const response = await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quote)
      });
      const data = await response.json();
      console.log("Posted to server:", data);
    } catch (error) {
      console.error("Error posting to server:", error);
    }
  }

  // ===== FETCH QUOTES FROM SERVER =====
  async function fetchQuotesFromServer() {
    try {
      const response = await fetch(SERVER_URL);
      const data = await response.json();
      // Only take first 5 items for simplicity
      return data.slice(0, 5).map(item => ({
        id: item.id,
        text: item.title,
        author: `Server User ${item.userId}`,
        updatedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error fetching from server:", error);
      return [];
    }
  }

  // ===== SYNC QUOTES FUNCTION =====
  async function syncQuotes() {
    const localQuotes = getLocalQuotes();
    const serverQuotes = await fetchQuotesFromServer();

    // Merge quotes, giving server precedence
    const mergedQuotes = [...serverQuotes];
    localQuotes.forEach(localQuote => {
      const exists = serverQuotes.some(sq => sq.id === localQuote.id);
      if (!exists) mergedQuotes.push(localQuote);
    });

    saveLocalQuotes(mergedQuotes);
    showNotification("Quotes synced with server. Conflicts resolved using server data.");

    // Post any local-only quotes to server
    localQuotes.forEach(localQuote => {
      const existsOnServer = serverQuotes.some(sq => sq.id === localQuote.id);
      if (!existsOnServer) postQuoteToServer(localQuote);
    });
  }

  // ===== DISPLAY RANDOM QUOTE =====
  function displayQuote() {
    const quotes = getLocalQuotes();
    const container = document.getElementById("quote-container");
    if (quotes.length > 0) {
      const random = quotes[Math.floor(Math.random() * quotes.length)];
      container.innerHTML = `<p>"${random.text}"</p><small>- ${random.author}</small>`;
    } else {
      container.textContent = "No quotes available.";
    }
  }

  // ===== SHOW NOTIFICATION =====
  function showNotification(message) {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.style.display = "block";
    setTimeout(() => {
      notification.style.display = "none";
    }, 5000);
  }

  // ===== EVENT LISTENER =====
  document.getElementById("new-quote").addEventListener("click", displayQuote);

  // ===== INITIAL LOAD =====
  syncQuotes();
  displayQuote();

  // ===== PERIODIC SYNC =====
  setInterval(syncQuotes, 15000); // sync every 15 seconds

});
