document.addEventListener("DOMContentLoaded", () => {

  // ===== SERVER SETUP =====
  const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

  async function fetchQuotesFromServer() {
    try {
      const response = await fetch(SERVER_URL);
      const data = await response.json();
      return data.slice(0, 5).map(item => ({
        id: item.id,
        text: item.title,
        author: `Server User ${item.userId}`,
        updatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching server quotes:", error);
      return [];
    }
  }

  async function postQuoteToServer(quote) {
    try {
      const response = await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quote),
      });
      const data = await response.json();
      console.log("Quote posted to server:", data);
    } catch (error) {
      console.error("Error posting quote:", error);
    }
  }

  // ===== LOCAL STORAGE =====
  function getLocalQuotes() {
    return JSON.parse(localStorage.getItem("quotes")) || [];
  }

  function saveLocalQuotes(quotes) {
    localStorage.setItem("quotes", JSON.stringify(quotes));
  }

  // ===== SYNC & CONFLICT RESOLUTION =====
  async function syncQuotes() {
    const localQuotes = getLocalQuotes();
    const serverQuotes = await fetchQuotesFromServer();

    const mergedQuotes = [...serverQuotes];
    localQuotes.forEach(localQuote => {
      const exists = serverQuotes.some(serverQuote => serverQuote.id === localQuote.id);
      if (!exists) mergedQuotes.push(localQuote);
    });

    saveLocalQuotes(mergedQuotes);
    showNotification("Quotes synced with server. Conflicts resolved using server data.");
  }

  // ===== NOTIFICATION =====
  function showNotification(message) {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.style.display = "block";
    setTimeout(() => {
      notification.style.display = "none";
    }, 5000);
  }

  // ===== QUOTE DISPLAY =====
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

  document.getElementById("new-quote").addEventListener("click", displayQuote);

  // ===== PERIODIC SYNC =====
  setInterval(syncQuotes, 15000); // every 15 seconds

  // INITIAL LOAD
  syncQuotes();
  displayQuote();
});
