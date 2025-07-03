const API_KEY = 'e9e5f03cf6dd41878bbe38420be22d15';

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("preferencesModal");
  const form = document.getElementById("preferencesForm");

  // Show modal if no preferences exist
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

  // Load saved preferences
  const saved = localStorage.getItem("userPreferences");
  if (saved) {
    const prefs = JSON.parse(saved);
    fetchAndDisplayNews(prefs);
  }
});

function fetchAndDisplayNews({ country, interests }) {
  const container = document.getElementById("newsContainer");
  container.innerHTML = ""; // Clear old news
  const proxy = 'https://api.allorigins.win/raw?url=';

  interests.forEach(category => {
    const url = `${proxy}https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=${API_KEY}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.articles && data.articles.length > 0) {
          displayArticles(data.articles);
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
      <a href="${article.url}" target="_blank">Read More</a>
    `;
    container.appendChild(card);
  });
}
