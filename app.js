// ================================
// CONFIG
// ================================
const API_KEY = '052c09e5eaeccd95f10958d951abcc03';
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// ================================
// WEATHER APP CONSTRUCTOR
// ================================
function WeatherApp() {
  this.searchBtn = document.getElementById('search-btn');
  this.cityInput = document.getElementById('city-input');
  this.weatherDisplay = document.getElementById('weather-display');
}

// ================================
// INIT
// ================================
WeatherApp.prototype.init = function () {
  this.searchBtn.addEventListener('click', this.handleSearch.bind(this));
  this.cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') this.handleSearch();
  });
  this.showWelcome();
};

// ================================
// UI STATES
// ================================
WeatherApp.prototype.showWelcome = function () {
  this.weatherDisplay.innerHTML = `
    <div class="welcome-message">
      Enter a city name to get started 🌍
    </div>
  `;
};

WeatherApp.prototype.showLoading = function () {
  this.weatherDisplay.innerHTML = `
    <div class="loading-container">
      <p>Loading weather...</p>
    </div>
  `;
};

WeatherApp.prototype.showError = function (message) {
  this.weatherDisplay.innerHTML = `
    <div class="error-message">
      ⚠️ <strong>Oops!</strong>
      <p>${message}</p>
    </div>
  `;
};

// ================================
// HANDLE SEARCH
// ================================
WeatherApp.prototype.handleSearch = function () {
  const city = this.cityInput.value.trim();

  if (!city) {
    this.showError('Please enter a city name.');
    return;
  }

  if (city.length < 2) {
    this.showError('City name is too short.');
    return;
  }

  this.getWeather(city);
  this.cityInput.value = '';
};

// ================================
// FETCH WEATHER + FORECAST
// ================================
WeatherApp.prototype.getWeather = async function (city) {
  this.showLoading();
  this.searchBtn.disabled = true;
  this.searchBtn.textContent = 'Searching...';

  try {
    const [weatherRes, forecastRes] = await Promise.all([
      axios.get(`${WEATHER_URL}?q=${city}&appid=${API_KEY}&units=metric`),
      axios.get(`${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=metric`)
    ]);

    this.displayWeather(weatherRes.data);
    const dailyForecasts = this.processForecastData(forecastRes.data.list);
    this.displayForecast(dailyForecasts);

  } catch (error) {
    if (error.response && error.response.status === 404) {
      this.showError('City not found. Please check the spelling.');
    } else {
      this.showError('Something went wrong. Try again later.');
    }
  } finally {
    this.searchBtn.disabled = false;
    this.searchBtn.textContent = '🔍 Search';
  }
};

// ================================
// DISPLAY CURRENT WEATHER
// ================================
WeatherApp.prototype.displayWeather = function (data) {
  const cityName = data.name;
  const temperature = Math.round(data.main.temp);
  const description = data.weather[0].description;
  const icon = data.weather[0].icon;

  this.weatherDisplay.innerHTML = `
    <div class="weather-info">
      <h2>${cityName}</h2>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
      <div class="temperature">${temperature}°C</div>
      <p>${description}</p>

      <h3>5-Day Forecast</h3>
      <div
