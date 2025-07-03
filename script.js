// API Configuration
const API_KEY = 'e9e5f03cf6dd41878bbe38420be22d15';
const API_URL = 'https://newsapi.org/v2';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Global variables
let currentCategory = 'general';
let allArticles = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadNews();
    
    // Add enter key support for search
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchNews();
        }
    });
});

// Load news function
async function loadNews(category = 'general') {
    showLoading();
    hideError();
    
    try {
        const encodedUrl = encodeURIComponent(`${API_URL}/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`);
        const response = await fetch(`${CORS_PROXY}${encodedUrl}`);
        const data = await response.json();
        
        if (data.status === 'ok') {
            allArticles = data.articles;
            displayNews(allArticles);
        } else {
            throw new Error('Failed to fetch news');
        }
        
        hideLoading();
    } catch (error) {
        console.error('Error loading news:', error);
        hideLoading();
        showError();
    }
}

// Filter by category
function filterByCategory(category) {
    currentCategory = category;
    
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    loadNews(category);
}

// Search news
async function searchNews() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        loadNews(currentCategory);
        return;
    }
    
    showLoading();
    hideError();
    
    try {
        const encodedUrl = encodeURIComponent(`${API_URL}/everything?q=${encodeURIComponent(query)}&apiKey=${API_KEY}`);
        const response = await fetch(`${CORS_PROXY}${encodedUrl}`);
        const data = await response.json();
        
        if (data.status === 'ok') {
            allArticles = data.articles;
            displayNews(allArticles);
        } else {
            throw new Error('Failed to fetch news');
        }
        
        hideLoading();
    } catch (error) {
        console.error('Error searching news:', error);
        hideLoading();
        showError();
    }
}

// Display news
function displayNews(articles) {
    const newsGrid = document.getElementById('newsGrid');
    const noResults = document.getElementById('noResults');
    
    if (articles.length === 0) {
        newsGrid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    newsGrid.innerHTML = articles.map(article => `
        <div class="news-card" onclick="openModal('${encodeURIComponent(JSON.stringify(article))}')">
            <div class="news-image-container">
                <img class="news-image" src="${article.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop'}" 
                     alt="${article.title}"
                     onerror="this.src='https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop'">
            </div>
            <div class="news-content">
                <div class="news-category">${currentCategory}</div>
                <h3 class="news-title">${article.title}</h3>
                <p class="news-description">${article.description || 'No description available.'}</p>
                <div class="news-meta">
                    <span class="news-source">${article.source.name || 'Unknown Source'}</span>
                    <span class="news-date">${formatDate(article.publishedAt)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Open modal
function openModal(articleData) {
    const article = JSON.parse(decodeURIComponent(articleData));
    
    document.getElementById('modalImage').src = article.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop';
    document.getElementById('modalCategory').textContent = currentCategory;
    document.getElementById('modalTitle').textContent = article.title;
    document.getElementById('modalDescription').textContent = article.description || 'No description available.';
    document.getElementById('modalSource').textContent = article.source.name || 'Unknown Source';
    document.getElementById('modalDate').textContent = formatDate(article.publishedAt);
    document.getElementById('modalLink').href = article.url || '#';
    
    document.getElementById('newsModal').style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('newsModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('newsModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Utility functions
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('newsGrid').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('newsGrid').style.display = 'grid';
}

function showError() {
    document.getElementById('errorMessage').style.display = 'block';
}

function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}