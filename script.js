const API_KEY = 'e9e5f03cf6dd41878bbe38420be22d15';
const API_URL = 'https://newsapi.org/v2';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// In-memory storage (replaces localStorage)
let userPreferences = null;
let cachedNews = [];
let bookmarkedNews = [];
let isDarkMode = false;
let allArticles = []; // Store all articles with their categories

// Check offline status
if (!navigator.onLine) {
  alert("You're offline. Showing cached news.");
  displayArticles(cachedNews);
}

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("preferencesModal");
  const form = document.getElementById("preferencesForm");
  const toggleBtn = document.getElementById("darkModeToggle");

  // Initialize dark mode
  if (isDarkMode) {
    document.body.classList.add("dark");
    toggleBtn.textContent = "☀️ Light Mode";
  }

  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    isDarkMode = document.body.classList.contains("dark");
    toggleBtn.textContent = isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
  });

  // Show preferences modal if no preferences set
  if (!userPreferences) {
    modal.style.display = "flex";
  }

  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const country = document.getElementById("country").value;
    const interestInputs = document.querySelectorAll("#interestOptions input:checked");
    const interests = Array.from(interestInputs).map(input => input.value);

    userPreferences = { country, interests };
    modal.style.display = "none";

    fetchAndDisplayNews(userPreferences);
  });

  // Load default preferences if none exist
  if (!userPreferences) {
    userPreferences = { 
      country: 'us', 
      interests: ['general', 'technology', 'business'] 
    };
  }
  
  fetchAndDisplayNews(userPreferences);
});

async function fetchAndDisplayNews({ country, interests }) {
  const container = document.getElementById("newsContainer");
  container.innerHTML = "";

  // Show loading
  showLoading();

  try {
    allArticles = []; // Clear previous articles
    
    for (const category of interests) {
      const encodedUrl = encodeURIComponent(`${API_URL}/top-headlines?country=${country}&category=${category}&apiKey=${API_KEY}`);
      const response = await fetch(`${CORS_PROXY}${encodedUrl}`);
      const data = await response.json();

      if (data.articles && data.articles.length > 0) {
        // Add category information to each article
        const articlesWithCategory = data.articles.map(article => ({
          ...article,
          category: category
        }));
        
        allArticles = [...allArticles, ...articlesWithCategory];
        
        // Cache articles (limit to 50)
        cachedNews = [...articlesWithCategory, ...cachedNews].slice(0, 50);
      }
    }
    
    // Display all articles initially
    displayArticles(allArticles);
    
  } catch (error) {
    console.error("Error fetching news:", error);
    showError();
  } finally {
    hideLoading();
  }
}

// New function to filter articles by category
function filterByCategory(category) {
  if (category === 'all') {
    displayArticles(allArticles);
  } else {
    const filteredArticles = allArticles.filter(article => article.category === category);
    displayArticles(filteredArticles);
  }
}

function displayArticles(articles) {
  const container = document.getElementById("newsContainer");
  container.innerHTML = ""; // Clear existing articles

  if (articles.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <h3>No articles found</h3>
        <p>Try selecting different categories or check your internet connection.</p>
      </div>
    `;
    return;
  }

  articles.forEach(article => {
    const card = document.createElement("div");
    card.className = "news-card";
    card.innerHTML = `
      <img src="${article.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=300&fit=crop'}" alt="News Image">
      <div class="category-badge">${article.category || 'general'}</div>
      <h3>${article.title}</h3>
      <p>${article.description || "No description available."}</p>
      <div class="card-actions">
        <button class="speak-btn">🔊 Listen</button>
        <button class="bookmark-btn">🔖 Save</button>
        <a href="${article.url}" target="_blank" class="read-more-btn">Read More</a>
      </div>
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
      bookmarkedNews.push(article);
      alert("Article saved!");
    });

    container.appendChild(card);
  });
}

// Utility functions
function showLoading() {
  const container = document.getElementById("newsContainer");
  container.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading news...</p>
    </div>
  `;
}

function hideLoading() {
  // Loading will be replaced by articles
}

function showError() {
  const container = document.getElementById("newsContainer");
  container.innerHTML = `
    <div class="error-message">
      <h3>Oops! Something went wrong</h3>
      <p>Unable to fetch news. Please try again later.</p>
    </div>
  `;
}

// Function to show bookmarked articles
function showBookmarks() {
  const container = document.getElementById("newsContainer");
  container.innerHTML = "";
  
  if (bookmarkedNews.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <h3>No bookmarked articles</h3>
        <p>Save some articles to see them here.</p>
      </div>
    `;
    return;
  }
  
  displayArticles(bookmarkedNews);
}

// Function to refresh preferences
function openPreferences() {
  document.getElementById("preferencesModal").style.display = "flex";
}