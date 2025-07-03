const API_KEY = 'e9e5f03cf6dd41878bbe38420be22d15';

// Check offline status
if (!navigator.onLine) {
  alert("You're offline. Showing cached news.");
  const cached = JSON.parse(localStorage.getItem("cachedNews")) || [];
  displayArticles(cached);
}

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("preferencesModal");
  const form = document.getElementById("preferencesForm");
  const toggleBtn = document.getElementById("darkModeToggle");

  // Load dark mode preference
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    toggleBtn.textContent = "☀️ Light Mode";
  }

  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const mode = document.body.classList.contains("dark") ? "dark" : "light";
    toggleBtn.textContent = mode === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
    localStorage.setItem("theme", mode);
  });

  if (!localStorage.getItem("userPreferences")) {
    modal.style.display = "flex";
  }

  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const country = document.getElementById("country").value;
    const interestInputs = document.querySelectorAll("#interestOptions input:checked");
    const interests = Array.from(interestInputs).map(input => input.value);

    const preferences = { country, interests };
    localStorage.setItem("userPreferences", JSON.stringify(preferences));
    modal.style.display = "none";

    fetchAndDisplayNews(preferences);
  });

  const saved = localStorage.getItem("userPreferences");
  if (saved) {
    const prefs = JSON.parse(saved);
    fetchAndDisplayNews(prefs);
  }
});

function fetchAndDisplayNews({ country, interests }) {
  const container = document.getElementById("newsContainer");
  container.innerHTML = "";

  interests.forEach(category => {
    const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=${API_KEY}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.articles && data.articles.length > 0) {
          displayArticles(data.articles);

          let cache = JSON.parse(localStorage.getItem("cachedNews")) || [];
          cache = [...data.articles, ...cache].slice(0, 5);
          localStorage.setItem("cachedNews", JSON.stringify(cache));
        }
      })
      .catch(err => {
        console.error("Error fetching news:", err);
      });
  });
}


function displayArticles(articles) {
  const container = document.getElementById("newsContainer");

  articles.forEach(article => {
    const card = document.createElement("div");
    card.className = "news-card";
    card.innerHTML = `
      <img src="${article.urlToImage || 'https://via.placeholder.com/600x300'}" alt="News Image">
      <h3>${article.title}</h3>
      <p>${article.description || "No description available."}</p>
      <button class="speak-btn">🔊 Listen</button>
      <button class="bookmark-btn">🔖 Save</button>
      <a href="${article.url}" target="_blank">Read More</a>
    `;

    // Text to speech
    card.querySelector(".speak-btn").addEventListener("click", () => {
      const utterance = new SpeechSynthesisUtterance(article.description || article.title);
      utterance.lang = "en-US";
      window.speechSynthesis.cancel(); // Stop current
      window.speechSynthesis.speak(utterance);
    });

    // Bookmark
    card.querySelector(".bookmark-btn").addEventListener("click", () => {
      let bookmarks = JSON.parse(localStorage.getItem("bookmarkedNews")) || [];
      bookmarks.push(article);
      localStorage.setItem("bookmarkedNews", JSON.stringify(bookmarks));
      alert("Article saved!");
    });

    container.appendChild(card);
  });
}
