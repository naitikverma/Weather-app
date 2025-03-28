// Weather API Configuration
const API_KEY = "112ff75499e14c04b8f171237252803";
const BASE_URL = "https://api.weatherapi.com/v1";

// DOM Elements
const searchInput = document.querySelector('.search-input');
const searchButton = document.querySelector('.search-button');
const unitSelector = document.querySelector('.unit-selector');
const currentTempElement = document.querySelector('.current-temp');
const feelsLikeElement = document.querySelector('.feels-like');
const weatherConditionElement = document.querySelector('.weather-condition span');
const currentDateElement = document.querySelector('.current-date');
const currentLocationElement = document.querySelector('.current-location');
const timeSlider = document.querySelector('.slider');

// Weather Metrics Elements
const cloudsValueElement = document.querySelector('.weather-metrics .metric-card:nth-child(1) .metric-value');
const uvIndexValueElement = document.querySelector('.weather-metrics .metric-card:nth-child(2) .metric-value');
const pressureValueElement = document.querySelector('.weather-metrics .metric-card:nth-child(3) .metric-value');

// Forecast Grid
const forecastGrid = document.querySelector('.forecast-grid');

// App State
let currentUnit = 'F'; // Default to Fahrenheit
let currentLocation = 'Bengaluru'; // Default location

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    unitSelector.addEventListener('click', toggleTemperatureUnit);
    
    // Load default weather data
    fetchWeatherData(currentLocation);
});

// Handle search functionality
function handleSearch() {
    const location = searchInput.value.trim();
    if (location) {
        currentLocation = location;
        fetchWeatherData(location);
    }
}

// Toggle between Celsius and Fahrenheit
function toggleTemperatureUnit() {
    currentUnit = currentUnit === 'F' ? 'C' : 'F';
    unitSelector.innerHTML = `°${currentUnit} <span class="dropdown-icon">▼</span>`;
    
    // Refresh weather data with new unit
    fetchWeatherData(currentLocation);
}

// Fetch weather data from API
async function fetchWeatherData(location) {
    try {
        showLoadingState(true);
        
        // Fetch current weather
        const currentWeatherResponse = await fetch(
            `${BASE_URL}/current.json?key=${API_KEY}&q=${location}&aqi=yes`
        );
        
        if (!currentWeatherResponse.ok) {
            throw new Error('Failed to fetch current weather data');
        }
        
        const currentWeatherData = await currentWeatherResponse.json();
        
        // Fetch forecast for 7 days
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast.json?key=${API_KEY}&q=${location}&days=8`
        );
        
        if (!forecastResponse.ok) {
            throw new Error('Failed to fetch forecast data');
        }
        
        const forecastData = await forecastResponse.json();
        
        // Update UI with fetched data
        updateCurrentWeather(currentWeatherData);
        updateWeatherMetrics(currentWeatherData);
        updateForecast(forecastData);
        
        showLoadingState(false);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError(error.message);
        showLoadingState(false);
    }
}

// Update current weather section
function updateCurrentWeather(data) {
    const { current, location } = data;
    
    // Update temperature based on selected unit
    const temp = currentUnit === 'F' ? current.temp_f : current.temp_c;
    const feelsLike = currentUnit === 'F' ? current.feelslike_f : current.feelslike_c;
    
    currentTempElement.innerHTML = `${temp.toFixed(1)}<span class="degree">°${currentUnit}</span>`;
    feelsLikeElement.textContent = `Feels like ${feelsLike.toFixed(1)} °${currentUnit}`;
    
    // Update weather condition
    weatherConditionElement.textContent = current.condition.text.toLowerCase();
    
    // Update date and location
    const date = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    currentDateElement.textContent = date.toLocaleDateString('en-US', options);
    currentLocationElement.textContent = `${location.name}, ${location.country}`;
    
    // Update weather icon based on condition code
    updateWeatherIcon(current.condition.code, current.is_day);
}

// Update weather metrics section
function updateWeatherMetrics(data) {
    const { current } = data;
    
    // Update clouds percentage
    cloudsValueElement.innerHTML = `${current.cloud}<span class="metric-unit">%</span>`;
    
    // Update UV index
    uvIndexValueElement.textContent = current.uv;
    
    // Update pressure
    const pressure = currentUnit === 'F' ? 
        current.pressure_in : // Imperial (inches)
        current.pressure_mb;  // Metric (millibars)
    
    const unit = currentUnit === 'F' ? 'inHg' : 'hPa';
    pressureValueElement.innerHTML = `${pressure}<span class="metric-unit">${unit}</span>`;
}

// Update forecast section
function updateForecast(data) {
    const { forecast } = data;
    
    // Clear existing forecast cards
    forecastGrid.innerHTML = '';
    
    // Create forecast cards for each day
    forecast.forecastday.forEach(day => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const monthDay = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        
        // Get temperatures based on selected unit
        const highTemp = currentUnit === 'F' ? day.day.maxtemp_f : day.day.maxtemp_c;
        const lowTemp = currentUnit === 'F' ? day.day.mintemp_f : day.day.mintemp_c;
        
        // Create forecast card
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        
        forecastCard.innerHTML = `
            <div class="forecast-day">${dayName}, ${monthDay}</div>
            <div class="forecast-icon">
                ${getWeatherIconSVG(day.day.condition.code, 1)}
            </div>
            <div class="forecast-condition">${day.day.condition.text.toLowerCase()}</div>
            <div class="forecast-temp">
                <span class="high-temp">${highTemp.toFixed(1)} °${currentUnit}</span>
                <span class="low-temp">${lowTemp.toFixed(1)} °${currentUnit}</span>
            </div>
        `;
        
        forecastGrid.appendChild(forecastCard);
    });
}

// Update weather icon based on condition code
function updateWeatherIcon(conditionCode, isDay) {
    const weatherIconContainer = document.querySelector('.weather-icon');
    weatherIconContainer.innerHTML = getWeatherIconSVG(conditionCode, isDay);
}

// Get SVG icon based on condition code
function getWeatherIconSVG(conditionCode, isDay) {
    // Map condition codes to appropriate SVG icons
    // This is a simplified version - you would want to map all condition codes
    
    // Sunny / Clear
    if ([1000].includes(conditionCode)) {
        return `
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${isDay ? '#ff9800' : '#f5f5f5'}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="m4.93 4.93 1.41 1.41"></path>
                <path d="m17.66 17.66 1.41 1.41"></path>
                <path d="M2 12h2"></path>
                <path d="M20 12h2"></path>
                <path d="m6.34 17.66-1.41 1.41"></path>
                <path d="m19.07 4.93-1.41 1.41"></path>
            </svg>
        `;
    }
    
    // Partly cloudy
    if ([1003].includes(conditionCode)) {
        return `
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${isDay ? '#ff9800' : '#f5f5f5'}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="m4.93 4.93 1.41 1.41"></path>
                <path d="m17.66 17.66 1.41 1.41"></path>
                <path d="M2 12h2"></path>
                <path d="M20 12h2"></path>
                <path d="m6.34 17.66-1.41 1.41"></path>
                <path d="m19.07 4.93-1.41 1.41"></path>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="cloud-icon-small">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
            </svg>
        `;
    }
    
    // Cloudy
    if ([1006, 1009].includes(conditionCode)) {
        return `
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
            </svg>
        `;
    }
    
    // Rainy
    if ([1063, 1180, 1183, 1186, 1189, 1192, 1195].includes(conditionCode)) {
        return `
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
                <path d="M11 13v2"></path>
                <path d="M14 13v2"></path>
            </svg>
        `;
    }
    
    // Default to cloudy if code not matched
    return `
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
        </svg>
    `;
}

// Show loading state
function showLoadingState(isLoading) {
    const loadingClass = 'loading';
    if (isLoading) {
        document.body.classList.add(loadingClass);
    } else {
        document.body.classList.remove(loadingClass);
    }
}

// Show error message
function showError(message) {
    // Create error toast
    const errorToast = document.createElement('div');
    errorToast.className = 'error-toast';
    errorToast.textContent = message;
    
    document.body.appendChild(errorToast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        errorToast.classList.add('hide');
        setTimeout(() => {
            document.body.removeChild(errorToast);
        }, 300);
    }, 3000);
}

// Format time from API (convert 24h to 12h format)
function formatTime(time24h) {
    const [hours, minutes] = time24h.split(':');
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes} ${period}`;
}