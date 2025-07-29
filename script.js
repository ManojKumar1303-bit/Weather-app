// Weather API Configuration
const API_KEY = '476f8de490cfa58b668dc8e1ab9ddccd'; // You'll need to get a free API key from OpenWeatherMap
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const celsiusBtn = document.getElementById('celsiusBtn');
const fahrenheitBtn = document.getElementById('fahrenheitBtn');
const themeBtn = document.getElementById('themeBtn');
const favoriteBtn = document.getElementById('favoriteBtn');
const favoritesContainer = document.getElementById('favoritesContainer');
const weatherInfo = document.getElementById('weatherInfo');
const loading = document.getElementById('loading');
const error = document.getElementById('error');

// Weather display elements
const cityName = document.getElementById('cityName');
const country = document.getElementById('country');
const lastUpdated = document.getElementById('lastUpdated');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const weatherIcon = document.getElementById('weatherIcon');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const visibility = document.getElementById('visibility');
const pressure = document.getElementById('pressure');
const uvIndex = document.getElementById('uvIndex');
const forecastContainer = document.getElementById('forecastContainer');
const errorMessage = document.getElementById('errorMessage');

// Global variables
let currentUnit = 'metric'; // 'metric' for Celsius, 'imperial' for Fahrenheit
let currentWeatherData = null;
let currentCity = '';
let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// Initialize app
function initApp() {
    // Set initial theme
    if (isDarkMode) {
        document.body.setAttribute('data-theme', 'dark');
        themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Load favorites
    loadFavorites();
    
    // Set initial unit
    updateUnitButtons();
}

// Theme toggle functionality
function toggleTheme() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', isDarkMode);
    
    if (isDarkMode) {
        document.body.setAttribute('data-theme', 'dark');
        themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.removeAttribute('data-theme');
        themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    // Update background based on weather
    if (currentWeatherData) {
        updateBackground(currentWeatherData.weather[0].main);
    }
}

// Update background based on weather
function updateBackground(weatherType) {
    const body = document.body;
    const weatherBackgrounds = {
        'Clear': isDarkMode ? 
            'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #f39c12 100%)' : 
            'linear-gradient(135deg, #ff6b6b 0%, #f39c12 50%, #45b7d1 100%)',
        'Clouds': isDarkMode ? 
            'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #95a5a6 100%)' : 
            'linear-gradient(135deg, #ff6b6b 0%, #95a5a6 50%, #45b7d1 100%)',
        'Rain': isDarkMode ? 
            'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #3498db 100%)' : 
            'linear-gradient(135deg, #ff6b6b 0%, #3498db 50%, #45b7d1 100%)',
        'Snow': isDarkMode ? 
            'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #bdc3c7 100%)' : 
            'linear-gradient(135deg, #ff6b6b 0%, #bdc3c7 50%, #45b7d1 100%)',
        'Thunderstorm': isDarkMode ? 
            'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #f1c40f 100%)' : 
            'linear-gradient(135deg, #ff6b6b 0%, #f1c40f 50%, #45b7d1 100%)'
    };
    
    const background = weatherBackgrounds[weatherType] || (isDarkMode ? 
        'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #3498db 100%)' : 
        'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)');
    
    body.style.background = background;
}

// Favorites functionality
function addToFavorites() {
    if (!currentCity) return;
    
    const cityData = {
        name: currentCity,
        country: country.textContent,
        temp: temperature.textContent,
        description: description.textContent
    };
    
    if (!favorites.find(fav => fav.name === currentCity)) {
        favorites.push(cityData);
        localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
        loadFavorites();
        favoriteBtn.classList.add('active');
        favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
    }
}

function removeFromFavorites(cityName) {
    favorites = favorites.filter(fav => fav.name !== cityName);
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    loadFavorites();
    
    if (currentCity === cityName) {
        favoriteBtn.classList.remove('active');
        favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
    }
}

function loadFavorites() {
    favoritesContainer.innerHTML = '';
    
    if (favorites.length === 0) {
        favoritesContainer.innerHTML = '<p style="color: var(--text-secondary-light); font-size: 14px;">No favorite cities yet</p>';
        return;
    }
    
    favorites.forEach(fav => {
        const favoriteItem = document.createElement('div');
        favoriteItem.className = 'favorite-item';
        favoriteItem.innerHTML = `
            <span>${fav.name}</span>
            <button onclick="removeFromFavorites('${fav.name}')" style="background: none; border: none; color: #e74c3c; cursor: pointer; margin-left: 8px;">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        favoriteItem.addEventListener('click', () => {
            cityInput.value = fav.name;
            searchWeather();
        });
        
        favoritesContainer.appendChild(favoriteItem);
    });
}

function updateFavoriteButton() {
    if (favorites.find(fav => fav.name === currentCity)) {
        favoriteBtn.classList.add('active');
        favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
    } else {
        favoriteBtn.classList.remove('active');
        favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
    }
}

// Event Listeners
searchBtn.addEventListener('click', searchWeather);
locationBtn.addEventListener('click', getLocationWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

celsiusBtn.addEventListener('click', () => switchUnit('metric'));
fahrenheitBtn.addEventListener('click', () => switchUnit('imperial'));
themeBtn.addEventListener('click', toggleTheme);
favoriteBtn.addEventListener('click', addToFavorites);

// Unit conversion function
function switchUnit(unit) {
    if (unit === currentUnit) return;
    
    currentUnit = unit;
    localStorage.setItem('weatherUnit', unit);
    
    // Update button states
    updateUnitButtons();
    
    // Re-display weather data with new unit
    if (currentWeatherData) {
        displayWeather(currentWeatherData);
    }
}

function updateUnitButtons() {
    celsiusBtn.classList.toggle('active', currentUnit === 'metric');
    fahrenheitBtn.classList.toggle('active', currentUnit === 'imperial');
}

// Convert temperature
function convertTemp(temp, fromUnit, toUnit) {
    if (fromUnit === toUnit) return temp;
    
    if (fromUnit === 'metric' && toUnit === 'imperial') {
        return (temp * 9/5) + 32;
    } else if (fromUnit === 'imperial' && toUnit === 'metric') {
        return (temp - 32) * 5/9;
    }
    return temp;
}

// Get weather by geolocation
async function getLocationWeather() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser.');
        return;
    }
    
    showLoading();
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const weatherData = await fetchWeatherDataByCoords(latitude, longitude);
                displayWeather(weatherData);
            } catch (err) {
                showError(err.message);
            }
        },
        (error) => {
            let errorMsg = 'Unable to get your location.';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg = 'Location access denied. Please allow location access.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg = 'Location information unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMsg = 'Location request timed out.';
                    break;
            }
            showError(errorMsg);
        }
    );
}

// Search weather function
async function searchWeather() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    showLoading();
    
    try {
        const weatherData = await fetchWeatherData(city);
        displayWeather(weatherData);
    } catch (err) {
        showError(err.message);
    }
}

// Fetch weather data from API
async function fetchWeatherData(city) {
    const url = `${API_BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}`;
    
    console.log('Fetching weather data for:', city);
    console.log('API URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        
        if (response.status === 404) {
            throw new Error('City not found. Please check the spelling and try again.');
        } else if (response.status === 401) {
            throw new Error('Invalid API key. Please check your API key.');
        } else if (response.status === 429) {
            throw new Error('API rate limit exceeded. Please try again later.');
        } else {
            throw new Error(`API Error (${response.status}): ${errorData.message || 'Unknown error'}`);
        }
    }
    
    const data = await response.json();
    console.log('Weather data received:', data);
    return data;
}

// Fetch weather data by coordinates
async function fetchWeatherDataByCoords(lat, lon) {
    const url = `${API_BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error (${response.status}): ${errorData.message || 'Unknown error'}`);
    }
    
    return await response.json();
}

// Fetch 5-day forecast
async function fetchForecast(city) {
    const url = `${FORECAST_API_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        console.warn('Forecast data not available');
        return null;
    }
    
    return await response.json();
}

// Display weather data
function displayWeather(data) {
    currentWeatherData = data;
    currentCity = data.name;
    
    // Update main weather info
    cityName.textContent = data.name;
    country.textContent = data.sys.country;
    lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    
    const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
    const speedUnit = currentUnit === 'metric' ? ' km/h' : ' mph';
    
    temperature.textContent = `${Math.round(data.main.temp)}${tempUnit}`;
    description.textContent = data.weather[0].description;
    
    // Update weather icon
    updateWeatherIcon(data.weather[0].main, data.weather[0].description);
    
    // Update weather details
    feelsLike.textContent = `${Math.round(data.main.feels_like)}${tempUnit}`;
    humidity.textContent = `${data.main.humidity}%`;
    
    const windSpeedValue = currentUnit === 'metric' 
        ? Math.round(data.wind.speed * 3.6) 
        : Math.round(data.wind.speed * 2.237);
    windSpeed.textContent = `${windSpeedValue}${speedUnit}`;
    
    visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    pressure.textContent = `${data.main.pressure} hPa`;
    
    // UV Index (not available in current weather API, showing placeholder)
    uvIndex.textContent = 'N/A';
    
    // Update background based on weather
    updateBackground(data.weather[0].main);
    
    // Update favorite button
    updateFavoriteButton();
    
    showWeatherInfo();
    
    // Load forecast
    loadForecast(data.name);
}

// Load and display forecast
async function loadForecast(city) {
    try {
        const forecastData = await fetchForecast(city);
        if (forecastData) {
            displayForecast(forecastData);
        }
    } catch (error) {
        console.warn('Could not load forecast:', error);
    }
}

// Display forecast
function displayForecast(data) {
    const dailyData = processForecastData(data.list);
    
    forecastContainer.innerHTML = '';
    
    dailyData.forEach(day => {
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        
        const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
        
        forecastItem.innerHTML = `
            <div class="forecast-day">${day.day}</div>
            <div class="forecast-icon">
                <i class="fas ${getWeatherIconClass(day.weather)}"></i>
            </div>
            <div class="forecast-temp">${Math.round(day.temp)}${tempUnit}</div>
            <div class="forecast-desc">${day.description}</div>
        `;
        
        forecastContainer.appendChild(forecastItem);
    });
}

// Process forecast data to get daily averages
function processForecastData(list) {
    const dailyData = {};
    
    list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        if (!dailyData[day]) {
            dailyData[day] = {
                day: day,
                temp: item.main.temp,
                weather: item.weather[0].main,
                description: item.weather[0].description,
                count: 1
            };
        } else {
            dailyData[day].temp += item.main.temp;
            dailyData[day].count += 1;
        }
    });
    
    // Calculate averages
    Object.values(dailyData).forEach(day => {
        day.temp = day.temp / day.count;
    });
    
    return Object.values(dailyData).slice(0, 5); // Return first 5 days
}

// Update weather icon based on conditions
function updateWeatherIcon(main, description) {
    weatherIcon.className = 'fas';
    weatherIcon.classList.add(getWeatherIconClass(main));
}

// Get weather icon class
function getWeatherIconClass(main) {
    const iconMap = {
        'Clear': 'fa-sun',
        'Clouds': 'fa-cloud',
        'Rain': 'fa-cloud-rain',
        'Drizzle': 'fa-cloud-rain',
        'Thunderstorm': 'fa-bolt',
        'Snow': 'fa-snowflake',
        'Mist': 'fa-smog',
        'Smoke': 'fa-smog',
        'Haze': 'fa-smog',
        'Dust': 'fa-smog',
        'Fog': 'fa-smog',
        'Sand': 'fa-smog',
        'Ash': 'fa-smog',
        'Squall': 'fa-wind',
        'Tornado': 'fa-wind'
    };
    
    return iconMap[main] || 'fa-cloud';
}

// Show/hide functions
function showLoading() {
    weatherInfo.style.display = 'none';
    error.style.display = 'none';
    loading.style.display = 'block';
}

function showWeatherInfo() {
    loading.style.display = 'none';
    error.style.display = 'none';
    weatherInfo.style.display = 'block';
}

function showError(message) {
    loading.style.display = 'none';
    weatherInfo.style.display = 'none';
    error.style.display = 'block';
    errorMessage.textContent = message;
}

// Initialize app when page loads
window.addEventListener('load', initApp); 