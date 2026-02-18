// ================================
// API CONFIG
// ================================
const API_KEY = '052c09e5eaeccd95f10958d951abcc03'; // your key
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// ================================
// DOM ELEMENTS
// ================================
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const weatherDisplay = document.getElementById('weather-display');

const recentSection = document.getElementById('recent-searches-section');
const recentContainer = document.getElementById('recent-searches-container');
const clearBtn = document.getElementById('clear-history-btn');

// ================================
// STATE
// ================================
let recentSearches = [];
const MAX_RECENT = 5;

// ================================
// UI HELPERS
// ================================
function showLoading() {
  weatherDisplay.innerHTML = `
    <p class="loading">Loading weather data...</p>
  `;
}

function showError(message) {
  weatherDisplay.innerHTML = `
    <p class="loading">${message}</p>
  `;
}

function showWelcome() {
  weatherDisplay.innerHTML = `
    <div class="welcome-message">
      <h3>🌍 Welcome to SkyFetch</h3>
      <p>Search for a city to get started</p>
      <p><small>Try: London, Paris, Tokyo</small></p>
    </div>
  `;
}

// ================================
// WEATHER FETCH
// ================================
async function getWeather(city) {
  showLoading();
  searchBtn.disabled = true;
  searchBtn.textContent = 'Searching...';

  const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;

  try {
    const response = await axios.get(url);
    displayWeather(response.data);

    saveRecentSearch(city);
    localStorage.setItem('lastCity', city);

  } catch (error) {
    if (error.response && error.response.status === 404) {
      showError('City not found. Please try again.');
    } else {
      showError('Something went wrong. Please try later.');
    }
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = '🔍 Search';
  }
}

// ================================
// DISPLAY WEATHER
// ================================
function displayWeather(data) {
  const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  weatherDisplay.innerHTML = `
    <div class="weather-info">
      <h2 class="city-name">${data.name}</h2>
      <img src="${iconUrl}" class="weather-icon">
      <div class="temperature">${Math.round(data.main.temp)}°C</div>
      <p class="description">${data.weather[0].description}</p>
    </div>
  `;
}

// ================================
// RECENT SEARCHES (localStorage)
// ================================
function loadRecentSearches() {
  const saved = localStorage.getItem('recentSearches');
  if (saved) {
    recentSearches = JSON.parse(saved);
  }
  displayRecentSearches();
}

function saveRecentSearch(city) {
  const cityName =
    city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

  recentSearches = recentSearches.filter(c => c !== cityName);
  recentSearches.unshift(cityName);

  if (recentSearches.length > MAX_RECENT) {
    recentSearches.pop();
  }

  localStorage.setItem(
    'recentSearches',
    JSON.stringify(recentSearches)
  );

  displayRecentSearches();
}

function displayRecentSearches() {
  recentContainer.innerHTML = '';

  if (recentSearches.length === 0) {
    recentSection.style.display = 'none';
    return;
  }

  recentSection.style.display = 'block';

  recentSearches.forEach(city => {
    const btn = document.createElement('button');
    btn.className = 'recent-search-btn';
    btn.textContent = city;

    btn.addEventListener('click', () => {
      cityInput.value = city;
      getWeather(city);
    });

    recentContainer.appendChild(btn);
  });
}

function clearHistory() {
  if (confirm('Clear all recent searches?')) {
    recentSearches = [];
    localStorage.removeItem('recentSearches');
    displayRecentSearches();
  }
}

// ================================
// LOAD LAST CITY
// ================================
function loadLastCity() {
  const lastCity = localStorage.getItem('lastCity');
  if (lastCity) {
    getWeather(lastCity);
  } else {
    showWelcome();
  }
}

// ================================
// EVENTS
// ================================
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();

  if (!city) {
    showError('Please enter a city name.');
    return;
  }

  if (city.length < 2) {
    showError('City name is too short.');
    return;
  }

  getWeather(city);
  cityInput.value = '';
});

cityInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
});

if (clearBtn) {
  clearBtn.addEventListener('click', clearHistory);
}

// ================================
// INIT ON PAGE LOAD
// ================================
loadRecentSearches();
loadLastCity();
