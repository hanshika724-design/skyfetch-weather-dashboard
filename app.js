// ================================
// CONFIG
// ================================
const API_KEY = '052c09e5eaeccd95f10958d951abcc03';
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
// UI HELPERS
// ================================
function showLoading() {
  weatherDisplay.innerHTML = `
    <p class="loading">Loading weather...</p>
  `;
}

function showError(message) {
  weatherDisplay.innerHTML = `
    <div class="error-message">
      ⚠️ <strong>Oops!</strong>
      <p>${message}</p>
    </div>
  `;
}

// ================================
// FETCH WEATHER
// ================================
async function getWeather(city) {
  showLoading();
  searchBtn.disabled = true;
  searchBtn.textContent = 'Searching...';

  const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;

  try {
    const response = await axios.get(url);
    displayWeather(response.data);
    saveToRecent(city);
    saveLastCity(city);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      showError('City not found. Please check the spelling.');
    } else {
      showError('Something went wrong. Try again later.');
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
  const cityName = data.name;
  const temperature = Math.round(data.main.temp);
  const description = data.weather[0].description;
  const icon = data.weather[0].icon;

  weatherDisplay.innerHTML = `
    <div class="weather-info">
      <h2 class="city-name">${cityName}</h2>
      <img 
        src="https://openweathermap.org/img/wn/${icon}@2x.png" 
        alt="${description}" 
        class="weather-icon"
      />
      <div class="temperature">${temperature}°C</div>
      <p class="description">${description}</p>
    </div>
  `;
}

// ================================
// LOCAL STORAGE – RECENT SEARCHES
// ================================
function getRecentSearches() {
  return JSON.parse(localStorage.getItem('recentCities')) || [];
}

function saveToRecent(city) {
  let cities = getRecentSearches();
  city = city.toLowerCase();

  cities = cities.filter(c => c !== city);
  cities.unshift(city);

  if (cities.length > 5) cities.pop();

  localStorage.setItem('recentCities', JSON.stringify(cities));
  renderRecentSearches();
}

function renderRecentSearches() {
  const cities = getRecentSearches();
  recentContainer.innerHTML = '';

  if (cities.length === 0) {
    recentSection.style.display = 'none';
    return;
  }

  recentSection.style.display = 'block';

  cities.forEach(city => {
    const btn = document.createElement('button');
    btn.className = 'recent-search-btn';
    btn.textContent = city;
    btn.addEventListener('click', () => getWeather(city));
    recentContainer.appendChild(btn);
  });
}

function clearHistory() {
  localStorage.removeItem('recentCities');
  renderRecentSearches();
}

// ================================
// LAST SEARCHED CITY
// ================================
function saveLastCity(city) {
  localStorage.setItem('lastCity', city);
}

function loadLastCity() {
  const city = localStorage.getItem('lastCity');
  if (city) {
    getWeather(city);
  }
}

// ================================
// EVENT LISTENERS
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

cityInput.addEventListener('keypress', (e) => {
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
renderRecentSearches();
loadLastCity();
