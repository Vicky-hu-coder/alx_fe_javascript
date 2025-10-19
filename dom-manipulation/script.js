// ===== INITIAL QUOTES ARRAY =====
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Success" }
];

// ===== DISPLAY RANDOM QUOTE =====
function showRandomQuote() {
  const quoteContainer = document.getElementById("quoteDisplay");
  if (quotes.length === 0) {
    quoteContainer.textContent = "No quotes available.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteContainer.innerHTML = `<p>"${quote.text}"</p><small>Category: ${quote.category}</small>`;
}

// ===== ADD QUOTE FUNCTION =====
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newQuote = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newQuote === "" || newCategory === "") {
    alert("Please enter both quote text and category.");
    return;
  }

  const quoteObject = { text: newQuote, category: newCategory };
  quotes.push(quoteObject); // add to array

  showRandomQuote(); // update DOM to show the new quote

  // Clear inputs
  textInput.value = "";
  categoryInput.value = "";
}

// ===== EVENT LISTENER FOR "SHOW NEW QUOTE" BUTTON =====
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  showRandomQuote(); // display initial quote
});
