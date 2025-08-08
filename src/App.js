import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader, Sun, Cloud, CloudRain, CloudSnow, Wind, Droplets, Settings, X, Moon, Globe, Palette, Move } from 'lucide-react';

// === Helper functions for cookie management ===
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const setCookie = (name, value, days) => {
  let expires = "";
  if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value}${expires}; path=/`;
};

// === Translations ===
const translations = {
  en: {
    news: 'News',
    source: 'Source',
    currency: 'Currency',
    addSymbol: 'Add',
    placeholderSymbol: 'Add symbol (e.g. BTC)',
    price: 'Price',
    change24h: '24h',
    remove: 'Remove',
    refreshing: 'Refreshing…',
    'days7': '7D',
    'days16': '16D',
    'forecastGeneric': 'Forecast',
    'd7': '7D',
    'd16': '16D',
  },
  de: {
    news: 'Nachrichten',
    source: 'Quelle',
    currency: 'Währung',
    addSymbol: 'Hinzufügen',
    placeholderSymbol: 'Symbol hinzufügen (z. B. BTC)',
    price: 'Preis',
    change24h: '24h',
    remove: 'Entfernen',
    refreshing: 'Aktualisiere…',
    'days7': '7 Tage',
    'days16': '16 Tage',
    'forecastGeneric': 'Vorhersage',
    'd7': '7 Tage',
    'd16': '16 Tage',
  },

  en: {
    weather: 'Weather',
    searchCity: 'Search city...',
    today: 'Today',
    tomorrow: 'Tomorrow',
    feelsLike: 'Feels like',
    wind: 'Wind',
    humidity: 'Humidity',
    forecast: '16-Day Forecast',
    calculator: 'Calculator',
    workTimer: 'Work Timer',
    timeRemaining: 'Time remaining until',
    notSet: 'Not set',
    setEndTime: 'Set End Time',
    save: 'Save',
    dashboardTitle: 'My Co-Dash',
    dashboardSubtitle: 'A collection of modern, clean components.',
    english: 'English',
    german: 'German',
    colorCustomization: 'Color Customization',
    selectColor: 'Select Accent Color',
    error: 'Error',
    failedToFetch: 'Failed to fetch weather data. Please try again.',
    cityNotFound: 'Could not find coordinates for "%s". Please try a different city.',
    // Weather descriptions
    'Clear sky': 'Clear sky',
    'Mainly clear': 'Mainly clear',
    'Partly cloudy': 'Partly cloudy',
    'Overcast': 'Overcast',
    'Fog': 'Fog',
    'Depositing rime fog': 'Depositing rime fog',
    'Light drizzle': 'Light drizzle',
    'Moderate drizzle': 'Moderate drizzle',
    'Dense drizzle': 'Dense drizzle',
    'Light freezing drizzle': 'Light freezing drizzle',
    'Dense freezing drizzle': 'Dense freezing drizzle',
    'Slight rain': 'Slight rain',
    'Moderate rain': 'Moderate rain',
    'Heavy rain': 'Heavy rain',
    'Light freezing rain': 'Light freezing rain',
    'Heavy freezing rain': 'Heavy freezing rain',
    'Slight snow fall': 'Slight snow fall',
    'Moderate snow fall': 'Moderate snow fall',
    'Heavy snow fall': 'Heavy snow fall',
    'Snow grains': 'Snow grains',
    'Slight rain showers': 'Slight rain showers',
    'Moderate rain showers': 'Moderate rain showers',
    'Violent rain showers': 'Violent rain showers',
    'Slight snow showers': 'Slight snow showers',
    'Heavy snow showers': 'Heavy snow showers',
    'Thunderstorm': 'Thunderstorm',
    'Thunderstorm with slight hail': 'Thunderstorm with slight hail',
    'Thunderstorm with heavy hail': 'Thunderstorm with heavy hail',
    'Unknown': 'Unknown',
  },
  de: {
    weather: 'Wetter',
    searchCity: 'Stadt suchen...',
    today: 'Heute',
    tomorrow: 'Morgen',
    feelsLike: 'Gefühlte Temperatur',
    wind: 'Wind',
    humidity: 'Luftfeuchtigkeit',
    forecast: '16-Tage-Vorhersage',
    calculator: 'Rechner',
    workTimer: 'Arbeits-Timer',
    timeRemaining: 'Verbleibende Zeit bis',
    notSet: 'Nicht festgelegt',
    setEndTime: 'Endzeit festlegen',
    save: 'Speichern',
    dashboardTitle: 'Mein Co-Dash',
    dashboardSubtitle: 'Eine Sammlung moderner, sauberer Komponenten.',
    english: 'Englisch',
    german: 'Deutsch',
    colorCustomization: 'Farbanpassung',
    selectColor: 'Akzentfarbe wählen',
    error: 'Fehler',
    failedToFetch: 'Wetterdaten konnten nicht abgerufen werden. Bitte versuchen Sie es erneut.',
    cityNotFound: 'Koordinaten für "%s" nicht gefunden. Bitte versuchen Sie eine andere Stadt.',
    // Weather descriptions
    'Clear sky': 'Klarer Himmel',
    'Mainly clear': 'Überwiegend klar',
    'Partly cloudy': 'Teilweise bewölkt',
    'Overcast': 'Bedeckt',
    'Fog': 'Nebel',
    'Depositing rime fog': 'Reifnebel',
    'Light drizzle': 'Leichter Nieselregen',
    'Moderate drizzle': 'Mäßiger Nieselregen',
    'Dense drizzle': 'Starker Nieselregen',
    'Light freezing drizzle': 'Leichter gefrierender Nieselregen',
    'Dense freezing drizzle': 'Starker gefrierender Nieselregen',
    'Slight rain': 'Leichter Regen',
    'Moderate rain': 'Mäßiger Regen',
    'Heavy rain': 'Starker Regen',
    'Light freezing rain': 'Leichter gefrierender Regen',
    'Heavy freezing rain': 'Starker gefrierender Regen',
    'Slight snow fall': 'Leichter Schneefall',
    'Moderate snow fall': 'Mäßiger Schneefall',
    'Heavy snow fall': 'Starker Schneefall',
    'Snow grains': 'Schneegriesel',
    'Slight rain showers': 'Leichte Regenschauer',
    'Moderate rain showers': 'Mäßige Regenschauer',
    'Violent rain showers': 'Heftige Regenschauer',
    'Slight snow showers': 'Leichte Schneeschauer',
    'Heavy snow showers': 'Starke Schneeschauer',
    'Thunderstorm': 'Gewitter',
    'Thunderstorm with slight hail': 'Gewitter mit leichtem Hagel',
    'Thunderstorm with heavy hail': 'Gewitter mit starkem Hagel',
    'Unknown': 'Unbekannt',
  },
};

// === Weather Component ===
const WeatherCard = ({ t }) => {
  const [forecastDays, setForecastDays] = useState(16);
  const [forecastDays, setForecastDays] = useState(16);

  const [city, setCity] = useState('Siegen');
  const [country, setCountry] = useState('Germany');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  const weatherCodeMap = {
    0: { icon: <Sun size={24} />, description: 'Clear sky' },
    1: { icon: <Sun size={24} />, description: 'Mainly clear' },
    2: { icon: <Cloud size={24} />, description: 'Partly cloudy' },
    3: { icon: <Cloud size={24} />, description: 'Overcast' },
    45: { icon: <Droplets size={24} />, description: 'Fog' },
    48: { icon: <Droplets size={24} />, description: 'Depositing rime fog' },
    51: { icon: <CloudRain size={24} />, description: 'Light drizzle' },
    53: { icon: <CloudRain size={24} />, description: 'Moderate drizzle' },
    55: { icon: <CloudRain size={24} />, description: 'Dense drizzle' },
    56: { icon: <CloudRain size={24} />, description: 'Light freezing drizzle' },
    57: { icon: <CloudRain size={24} />, description: 'Dense freezing drizzle' },
    61: { icon: <CloudRain size={24} />, description: 'Slight rain' },
    63: { icon: <CloudRain size={24} />, description: 'Moderate rain' },
    65: { icon: <CloudRain size={24} />, description: 'Heavy rain' },
    66: { icon: <CloudRain size={24} />, description: 'Light freezing rain' },
    67: { icon: <CloudRain size={24} />, description: 'Heavy freezing rain' },
    71: { icon: <CloudSnow size={24} />, description: 'Slight snow fall' },
    73: { icon: <CloudSnow size={24} />, description: 'Moderate snow fall' },
    75: { icon: <CloudSnow size={24} />, description: 'Heavy snow fall' },
    77: { icon: <CloudSnow size={24} />, description: 'Snow grains' },
    80: { icon: <CloudRain size={24} />, description: 'Slight rain showers' },
    81: { icon: <CloudRain size={24} />, description: 'Moderate rain showers' },
    82: { icon: <CloudRain size={24} />, description: 'Violent rain showers' },
    85: { icon: <CloudSnow size={24} />, description: 'Slight snow showers' },
    86: { icon: <CloudSnow size={24} />, description: 'Heavy snow showers' },
    95: { icon: <CloudRain size={24} />, description: 'Thunderstorm' },
    96: { icon: <CloudRain size={24} />, description: 'Thunderstorm with slight hail' },
    99: { icon: <CloudRain size={24} />, description: 'Thunderstorm with heavy hail' },
  };

  const getWeatherIcon = (code) => {
    return weatherCodeMap[code]?.icon || <Sun size={24} />;
  };

  const getWeatherDescription = (code) => {
    return weatherCodeMap[code]?.description || 'Unknown';
  };

  const fetchWeather = async (cityToFetch, countryToFetch = '') => {
    setLoading(true);
    setError('');
    setWeatherData(null);

    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${cityToFetch}&count=1&language=en&format=json`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError(t('cityNotFound').replace('%s', cityToFetch));
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,surface_pressure,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max&timezone=Europe%2FBerlin&forecast_days=16`;
      const weatherResponse = await fetch(weatherUrl);
      const weatherJson = await weatherResponse.json();

      if (weatherJson.error) {
        setError(weatherJson.reason);
        setLoading(false);
        return;
      }

      setCity(name);
      setCountry(country);
      setWeatherData(weatherJson);
    } catch (err) {
      console.error(err);
      setError(t('failedToFetch'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(city, country);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchWeather(searchQuery.trim());
      setSearchQuery('');
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return t('today');
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return t('tomorrow');
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
  };
  
  return (
    <div className="w-full bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 transition-all duration-300">
      <div className="flex items-center justify-between drag-handle cursor-move select-none">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('weather')}</h2>
        <form onSubmit={handleSearch} className="relative w-1/2">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchCity')}
            className="w-full pl-8 pr-2 py-1 text-sm border border-gray-300 dark:border-[#333333] bg-gray-100 dark:bg-[#2A2A2A] rounded-full focus:outline-none focus:ring-1 transition-all duration-300"
            style={{ '--tw-ring-color': 'var(--accent-color)' }}
          />
          <button type="submit" className="absolute inset-y-0 left-0 flex items-center justify-center w-8 text-gray-500 dark:text-[#B3B3B3]">
            <Search size={16} />
          </button>
        </form>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader size={32} className="animate-spin" style={{ color: 'var(--accent-color)' }} />
          <p className="mt-2 text-sm">Fetching...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center p-8 text-red-500 text-sm text-center">
          <p>{error}</p>
        </div>
      )}

      {weatherData && !loading && (
        <div className="space-y-6">
          <div className="bg-gray-100 dark:bg-[#2A2A2A] p-4 rounded-xl shadow-inner transition-colors duration-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{city}, {country}</h3>
              <p className="text-xs text-gray-500 dark:text-[#B3B3B3]">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="flex items-center justify-around space-x-2">
              <div className="flex items-center space-x-2">
                <div style={{ color: 'var(--accent-color)' }}>{getWeatherIcon(weatherData.daily.weather_code[0])}</div>
                <div className="text-4xl font-bold">
                  {Math.round(weatherData.hourly.temperature_2m[0])}°C
                </div>
              </div>
              <div className="text-center">
                <p className="text-base font-medium">{t(getWeatherDescription(weatherData.daily.weather_code[0]))}</p>
                <p className="text-xs text-gray-500 dark:text-[#B3B3B3]">
                  {t('feelsLike')}: {Math.round(weatherData.hourly.apparent_temperature[0])}°C
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="flex flex-col items-center p-1 rounded-lg bg-white dark:bg-[#2A2A2A]">
                <Wind size={16} className="text-gray-600 dark:text-gray-300" />
                <p className="mt-0.5">{Math.round(weatherData.hourly.wind_speed_10m[0])} km/h</p>
                <p className="text-gray-500 dark:text-[#B3B3B3]">{t('wind')}</p>
              </div>
              <div className="flex flex-col items-center p-1 rounded-lg bg-white dark:bg-[#2A2A2A]">
                <Droplets size={16} className="text-gray-600 dark:text-gray-300" />
                <p className="mt-0.5">{weatherData.hourly.relative_humidity_2m[0]}%</p>
                <p className="text-gray-500 dark:text-[#B3B3B3]">{t('humidity')}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-[#2A2A2A] p-4 rounded-xl shadow-inner transition-colors duration-300">
            <div className="flex items-center justify-between mb-2"><h3 className="text-base font-semibold">{t('forecastGeneric')}</h3><div className="flex gap-2"><button onClick={() => setForecastDays(7)} className="px-3 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-700 hover:opacity-90" style={{ border: forecastDays===7 ? `2px solid var(--accent-color)` : "2px solid transparent" }}>{t('d7')}</button><button onClick={() => setForecastDays(16)} className="px-3 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-700 hover:opacity-90" style={{ border: forecastDays===16 ? `2px solid var(--accent-color)` : "2px solid transparent" }}>{t('d16')}</button></div></div>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {weatherData.daily.time.slice(0, forecastDays).map((dateString, index) => {
                const maxTemp = Math.round(weatherData.daily.temperature_2m_max[index]);
                const minTemp = Math.round(weatherData.daily.temperature_2m_min[index]);
                const weatherCode = weatherData.daily.weather_code[index];
                const dayName = getDayName(dateString);

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center p-2 bg-white dark:bg-[#2A2A2A] rounded-lg shadow-sm space-y-1"
                  >
                    <p className="text-xs font-semibold whitespace-nowrap">{dayName}</p>
                    <div style={{ color: 'var(--accent-color)' }}>{getWeatherIcon(weatherCode)}</div>
                    <div className="text-[10px] text-center text-gray-500 dark:text-[#B3B3B3] h-6 overflow-hidden leading-tight">{t(getWeatherDescription(weatherCode))}</div>
                    <div className="mt-1 text-center text-xs">
                      <span className="font-bold">{maxTemp}°</span>
                      <span className="text-gray-400"> / {minTemp}°</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// === Calculator Component ===
const CalculatorCard = ({ t, accentColor }) => {
  const [expression, setExpression] = useState('0');
  const [result, setResult] = useState(null);

  // Function to perform the calculation
  const calculate = (expr) => {
    try {
      const sanitizedExpr = expr.replace(/×/g, '*').replace(/÷/g, '/');
      const tokens = sanitizedExpr.match(/(\d+\.?\d*|\-|\+|\*|\/)/g) || [];
      
      let numbers = [];
      let operators = [];

      let currentNum = '';
      for (const token of tokens) {
        if (/[0-9.]/.test(token)) {
          currentNum += token;
        } else {
          if (currentNum !== '') {
            numbers.push(parseFloat(currentNum));
            currentNum = '';
          }
          operators.push(token);
        }
      }
      if (currentNum !== '') {
        numbers.push(parseFloat(currentNum));
      }

      // Handle multiplication and division first
      for (let i = 0; i < operators.length; i++) {
        if (operators[i] === '*' || operators[i] === '/') {
          let res;
          if (operators[i] === '*') {
            res = numbers[i] * numbers[i + 1];
          } else {
            res = numbers[i] / numbers[i + 1];
          }
          numbers.splice(i, 2, res);
          operators.splice(i, 1);
          i--;
        }
      }

      // Handle addition and subtraction
      let finalResult = numbers[0];
      for (let i = 0; i < operators.length; i++) {
        if (operators[i] === '+') {
          finalResult += numbers[i + 1];
        } else if (operators[i] === '-') {
          finalResult -= numbers[i + 1];
        }
      }

      return finalResult;
    } catch (e) {
      console.error(e);
      return NaN;
    }
  };

  const handleInput = (input) => {
    if (result !== null && /[0-9]/.test(input)) {
      setExpression(String(input));
      setResult(null);
    } else if (result !== null && ['+', '-', '×', '÷'].includes(input)) {
      setExpression(String(result) + input);
      setResult(null);
    } else if (expression === '0') {
      if (input === '.') {
        setExpression('0.');
      } else {
        setExpression(String(input));
      }
    } else {
      setExpression(expression + input);
    }
  };

  const handleEquals = () => {
    const calculatedResult = calculate(expression);
    if (!isNaN(calculatedResult)) {
      setExpression(String(calculatedResult));
      setResult(calculatedResult);
    } else {
      setExpression(t('error'));
      setResult(null);
    }
  };

  const handleClear = () => {
    setExpression('0');
    setResult(null);
  };

  const handlePercent = () => {
    const calculatedValue = calculate(expression) / 100;
    if (!isNaN(calculatedValue)) {
      setExpression(String(calculatedValue));
      setResult(calculatedValue);
    } else {
      setExpression(t('error'));
      setResult(null);
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key;
      if (/[0-9]/.test(key)) {
        handleInput(key);
      } else if (key === '+') {
        handleInput(' + ');
      } else if (key === '-') {
        handleInput(' - ');
      } else if (key === '*') {
        handleInput(' × ');
      } else if (key === '/') {
        handleInput(' ÷ ');
      } else if (key === '.' || key === ',') {
        handleInput('.');
      } else if (key === 'Enter' || key === '=') {
        handleEquals();
      } else if (key === 'Backspace') {
        if (expression.length > 1) {
          setExpression(expression.slice(0, -1));
        } else {
          setExpression('0');
        }
      } else if (key === 'Delete') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [expression, result]);

  const buttons = [
    { label: 'AC', className: 'col-span-2 text-xl', onClick: handleClear },
    { label: '%', className: 'text-xl', onClick: handlePercent },
    { label: '÷', className: 'text-xl bg-blue-500 text-white', onClick: () => handleInput(' ÷ ') },
    { label: '7', className: 'text-2xl font-semibold', onClick: () => handleInput('7') },
    { label: '8', className: 'text-2xl font-semibold', onClick: () => handleInput('8') },
    { label: '9', className: 'text-2xl font-semibold', onClick: () => handleInput('9') },
    { label: '×', className: 'text-2xl bg-blue-500 text-white', onClick: () => handleInput(' × ') },
    { label: '4', className: 'text-2xl font-semibold', onClick: () => handleInput('4') },
    { label: '5', className: 'text-2xl font-semibold', onClick: () => handleInput('5') },
    { label: '6', className: 'text-2xl font-semibold', onClick: () => handleInput('6') },
    { label: '-', className: 'text-2xl bg-blue-500 text-white', onClick: () => handleInput(' - ') },
    { label: '1', className: 'text-2xl font-semibold', onClick: () => handleInput('1') },
    { label: '2', className: 'text-2xl font-semibold', onClick: () => handleInput('2') },
    { label: '3', className: 'text-2xl font-semibold', onClick: () => handleInput('3') },
    { label: '+', className: 'text-2xl bg-blue-500 text-white', onClick: () => handleInput(' + ') },
    { label: '0', className: 'text-2xl font-semibold col-span-2', onClick: () => handleInput('0') },
    { label: '.', className: 'text-2xl font-semibold', onClick: () => handleInput('.') },
    { label: '=', className: 'text-2xl bg-blue-500 text-white', onClick: handleEquals },
  ];

  return (
    <div className="w-full bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 transition-all duration-300">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('calculator')}</h2>
      <div className="bg-gray-100 dark:bg-[#2A2A2A] p-4 rounded-xl shadow-inner transition-colors duration-300">
        <div className="text-right text-3xl md:text-4xl font-light h-12 overflow-hidden truncate">
          {expression}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {buttons.map((button, index) => (
          <button
            key={index}
            onClick={button.onClick}
            className={`
              ${button.className.includes('bg-blue-500') ? '' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}
              ${button.className.includes('col-span-2') ? 'col-span-2' : ''}
              ${button.className.includes('text-xl') ? 'text-xl' : ''}
              ${button.className.includes('font-semibold') ? 'font-semibold' : ''}
              w-full h-16 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-105 active:opacity-80 focus:outline-none focus:ring-2
            `}
            style={{
              backgroundColor: button.className.includes('bg-blue-500') ? accentColor : '',
              color: button.className.includes('text-white') ? 'white' : '',
              '--tw-ring-color': accentColor,
            }}
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// === Work Timer Component ===
const WorkTimerCard = ({ t }) => {
  const [endTime, setEndTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const endTimeInputRef = useRef(null);

  useEffect(() => {
    const storedTime = getCookie('work_end_time');
    if (storedTime) {
      setEndTime(new Date(storedTime));
    }
  }, []);

  useEffect(() => {
    let timerId;
    if (endTime) {
      timerId = setInterval(() => {
        const now = new Date();
        const diff = endTime.getTime() - now.getTime();
        setRemainingTime(diff > 0 ? diff : 0);
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [endTime]);

  const handleSettingsSave = (e) => {
    e.preventDefault();
    const [hours, minutes] = e.target.time.value.split(':').map(Number);
    const newEndTime = new Date();
    newEndTime.setHours(hours, minutes, 0, 0);

    if (newEndTime.getTime() < new Date().getTime()) {
      newEndTime.setDate(newEndTime.getDate() + 1);
    }

    setEndTime(newEndTime);
    setCookie('work_end_time', newEndTime.toISOString(), 30);
    setShowSettings(false);
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const currentEndTimeString = endTime ? endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : t('notSet');

  return (
    <div className="w-full bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 transition-all duration-300 relative">
      <div className="flex justify-between items-center drag-handle cursor-move select-none">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('workTimer')}</h2>
        <button onClick={() => setShowSettings(true)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-600">
          <Settings size={20} />
        </button>
      </div>

      <div className="bg-gray-100 dark:bg-[#2A2A2A] p-4 rounded-xl shadow-inner text-center space-y-2">
        <p className="text-sm text-gray-500 dark:text-[#B3B3B3]">{t('timeRemaining')} {currentEndTimeString}:</p>
        <div className="text-5xl font-bold" style={{ color: 'var(--accent-color)' }}>
          {remainingTime !== null && remainingTime > 0 ? formatTime(remainingTime) : '00:00:00'}
        </div>
      </div>
      
      {showSettings && (
        <div className="absolute inset-0 bg-white/70 dark:bg-[#121212]/70 backdrop-blur-sm flex items-center justify-center rounded-3xl transition-opacity duration-300">
          <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-xl w-80 relative">
            <h3 className="text-xl font-bold mb-4">{t('setEndTime')}</h3>
            <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
              <X size={20} />
            </button>
            <form onSubmit={handleSettingsSave} className="space-y-4">
              <input
                ref={endTimeInputRef}
                type="time"
                name="time"
                className="w-full text-center p-2 text-xl bg-gray-100 dark:bg-[#2A2A2A] rounded-xl focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--accent-color)' }}
                defaultValue={endTime ? `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}` : ''}
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold rounded-full text-white transition-colors duration-200"
                  style={{ backgroundColor: 'var(--accent-color)', ':hover': { backgroundColor: 'var(--accent-color-hover)' } }}
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App component

// === NewsFeedCard Component ===
const NewsFeedCard = ({ t, language, accentColor }) => {
  const FEEDS = language === 'de'
    ? [
        { name: 'Tagesschau', url: 'https://www.tagesschau.de/xml/rss2' },
        { name: 'heise', url: 'https://www.heise.de/rss/heise-atom.xml' },
      ]
    : [
        { name: 'BBC', url: 'https://feeds.bbci.co.uk/news/rss.xml' },
        { name: 'NASA', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss' },
      ];

  const [sourceIndex, setSourceIndex] = React.useState(0);
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const fetchRSS = async (feedUrl) => {
    setLoading(true);
    try {
      const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;
      const res = await fetch(proxy);
      const json = await res.json();
      const xml = json.contents;
      const doc = new DOMParser().parseFromString(xml, 'text/xml');

      const entries = [...doc.querySelectorAll('item, entry')].map((n) => {
        const title = n.querySelector('title')?.textContent?.trim() || 'Untitled';
        const link =
          n.querySelector('link')?.getAttribute?.('href') ||
          n.querySelector('link')?.textContent ||
          '#';
        const pub =
          n.querySelector('pubDate')?.textContent ||
          n.querySelector('updated')?.textContent ||
          n.querySelector('published')?.textContent ||
          '';
        // try to find preview image
        const thumb = n.querySelector('media\:thumbnail, thumbnail, media\:content, enclosure');
        let img = null;
        if (thumb) {
          img = thumb.getAttribute('url') || thumb.getAttribute('href') || null;
        }
        if (!img) {
          const content = n.querySelector('content, description');
          const html = content?.textContent || '';
          const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
          if (m) img = m[1];
        }
        return { title, link, pubDate: pub ? new Date(pub) : new Date(0), img };
      });

      entries.sort((a, b) => b.pubDate - a.pubDate);
      setItems(entries.slice(0, 15));
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRSS(FEEDS[sourceIndex].url);
    const id = setInterval(() => fetchRSS(FEEDS[sourceIndex].url), 3 * 60 * 60 * 1000);
    return () => clearInterval(id);
  }, [sourceIndex, language]);

  return (
    <div className="w-full bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-2xl p-6 md:p-8 space-y-4 transition-all duration-300">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">{t('news')}</h2>
        <select
          value={sourceIndex}
          onChange={(e) => setSourceIndex(Number(e.target.value))}
          className="px-3 py-1 rounded-full bg-gray-100 dark:bg-[#2A2A2A] text-sm focus:outline-none focus:ring"
          style={{ '--tw-ring-color': accentColor }}
        >
          {FEEDS.map((f, i) => (
            <option key={f.name} value={i}>{f.name}</option>
          ))}
        </select>
      </div>
      <div className="max-h-80 overflow-y-auto pr-1 space-y-2">
        {loading && <div className="text-xs opacity-70">{t('refreshing')}</div>}
        {items.map((it, idx) => (
          <a
            key={idx}
            href={it.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-xl bg-gray-100 dark:bg-[#2A2A2A] hover:opacity-90 transition"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold leading-snug line-clamp-2">{it.title}</div>
                <div className="text-[11px] opacity-70 mt-1">
                  {it.pubDate instanceof Date && !isNaN(it.pubDate) ? it.pubDate.toLocaleString() : ''}
                </div>
              </div>
              {it.img && (
                <img
                  src={it.img}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover flex-none"
                  loading="lazy"
                />
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

// === MarketTickerCard Component ===
const MarketTickerCard = ({ t, accentColor }) => {
  const MAP = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    SOL: 'solana',
    ADA: 'cardano',
    DOGE: 'dogecoin',
    XRP: 'ripple',
    LTC: 'litecoin',
    DOT: 'polkadot',
    AVAX: 'avalanche-2',
    MATIC: 'polygon',
    BNB: 'binancecoin',
  };
  const [symbols, setSymbols] = React.useState(() => {
    const saved = localStorage.getItem('ticker_symbols');
    return saved ? JSON.parse(saved) : ['BTC', 'ETH', 'SOL'];
  });
  const [currency, setCurrency] = React.useState(() => localStorage.getItem('ticker_currency') || 'EUR');
  const [data, setData] = React.useState({});
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const fetchPrices = async () => {
    const ids = symbols.map((s) => MAP[s.toUpperCase()]).filter(Boolean).join(',');
    if (!ids) return;
    setLoading(true);
    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,eur&include_24hr_change=true`;
      const res = await fetch(url);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPrices();
    const id = setInterval(fetchPrices, 60 * 1000);
    return () => clearInterval(id);
  }, [symbols]);

  React.useEffect(() => {
    localStorage.setItem('ticker_symbols', JSON.stringify(symbols));
  }, [symbols]);

  React.useEffect(() => {
    localStorage.setItem('ticker_currency', currency);
  }, [currency]);

  const addSymbol = () => {
    const sym = input.trim().toUpperCase();
    if (!sym) return;
    if (!MAP[sym]) {
      alert(`Unknown symbol: ${sym}`);
      return;
    }
    if (!symbols.includes(sym)) setSymbols([...symbols, sym]);
    setInput('');
  };

  const removeSymbol = (sym) => setSymbols(symbols.filter((s) => s !== sym));
  const fmt = (n) => new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 6 }).format(n);

  return (
    <div className="w-full bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-2xl p-6 md:p-8 space-y-4 transition-all duration-300">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Markets</h2>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}
          className="px-3 py-1 rounded-full bg-gray-100 dark:bg-[#2A2A2A] text-sm focus:outline-none focus:ring"
          style={{ '--tw-ring-color': accentColor }}>
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
        </select>
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('placeholderSymbol')}
          className="flex-1 px-3 py-2 rounded-xl bg-gray-100 dark:bg-[#2A2A2A] text-sm focus:outline-none focus:ring"
          style={{ '--tw-ring-color': accentColor }} />
        <button onClick={addSymbol} className="px-4 py-2 rounded-xl text-white font-semibold" style={{ backgroundColor: accentColor }}>
          {t('addSymbol')}
        </button>
      </div>
      {loading && <div className="text-xs opacity-70">{t('refreshing')}</div>}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {symbols.map((sym) => {
          const id = MAP[sym];
          const row = data[id];
          const price = currency === 'EUR' ? row?.eur : row?.usd;
          const change = currency === 'EUR' ? row?.eur_24h_change : row?.usd_24h_change;
          const up = typeof change === 'number' ? change >= 0 : null;
          return (
            <div key={sym} className="p-3 rounded-xl bg-gray-100 dark:bg-[#2A2A2A] flex flex-col gap-1">
              <div className="flex items-center justify-between drag-handle cursor-move select-none">
                <div className="text-sm font-bold">{sym}</div>
                <button onClick={() => removeSymbol(sym)} className="text-[11px] opacity-70 hover:opacity-100" title={t('remove')}>✕</button>
              </div>
              <div className="text-lg font-semibold">{price != null ? fmt(price) : '—'}</div>
              <div className={up === null ? '' : up ? 'text-green-600' : 'text-red-600'}>
                {t('change24h')}: {change != null ? `${change.toFixed(2)}%` : '—'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function App() {
  const rowHeight = 26; // fixed row height for stable 2-row layout

  const defaultLayouts = {
    lg: [
      { i: 'weather', x: 0, y: 0, w: 1, h: 8 },
      { i: 'calc', x: 1, y: 0, w: 1, h: 8 },
      { i: 'timer', x: 2, y: 0, w: 1, h: 8 },
      { i: 'news', x: 0, y: 8, w: 1, h: 10 },
      { i: 'markets', x: 1, y: 8, w: 1, h: 10 },
      { i: 'placeholder', x: 2, y: 8, w: 1, h: 10 },
    ],
    md: [
      { i: 'weather', x: 0, y: 0, w: 1, h: 8 },
      { i: 'calc', x: 1, y: 0, w: 1, h: 8 },
      { i: 'timer', x: 0, y: 8, w: 2, h: 8 },
      { i: 'news', x: 0, y: 16, w: 1, h: 10 },
      { i: 'markets', x: 1, y: 16, w: 1, h: 10 },
      { i: 'placeholder', x: 0, y: 26, w: 2, h: 10 },
    ],
    sm: [
      { i: 'weather', x: 0, y: 0, w: 1, h: 8 },
      { i: 'calc', x: 0, y: 8, w: 1, h: 8 },
      { i: 'timer', x: 0, y: 16, w: 1, h: 8 },
      { i: 'news', x: 0, y: 24, w: 1, h: 10 },
      { i: 'markets', x: 0, y: 34, w: 1, h: 10 },
      { i: 'placeholder', x: 0, y: 44, w: 1, h: 10 },
    ]
  };
  const [layouts, setLayouts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dashboard_layouts_v1')) || defaultLayouts; } catch { return defaultLayouts; }
  });
  const [isDarkMode, setIsDarkMode] = useState(() => getCookie('dark_mode') === 'true');
  const [language, setLanguage] = useState(() => getCookie('language') || 'en');
  const [accentColor, setAccentColor] = useState(() => getCookie('accent_color') || '#3b82f6');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [tempAccentColor, setTempAccentColor] = useState(accentColor);

  const t = (key) => translations[language][key];

  // Set initial preferences from cookies
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.documentElement.style.setProperty('--accent-color', accentColor);
    document.documentElement.style.setProperty('--accent-color-hover', `${accentColor}E6`);
  }, []);

  // Save settings to cookies whenever they change
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    setCookie('dark_mode', isDarkMode, 365);
  }, [isDarkMode]);

  useEffect(() => {
    setCookie('language', language, 365);
  }, [language]);
  
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
    document.documentElement.style.setProperty('--accent-color-hover', `${accentColor}E6`);
    setCookie('accent_color', accentColor, 365);
  }, [accentColor]);

  const handleSaveColor = () => {
    setAccentColor(tempAccentColor);
    setIsColorPickerOpen(false);
  };
  
  const handleCancelColor = () => {
    setTempAccentColor(accentColor);
    setIsColorPickerOpen(false);
  };

  return (
    <div className="bg-[#f3f6fa] dark:bg-[#121212] text-[#333] dark:text-[#f0f0f0] min-h-screen p-4 flex flex-col font-['Source_Code_Pro',_monospace] transition-colors duration-300">
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600&display=swap" rel="stylesheet" />
      
      <div className="flex justify-end p-4 absolute top-0 right-0 z-10">
        <div className="flex space-x-2 bg-white dark:bg-[#1E1E1E] p-2 rounded-full shadow-lg">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" title="Light/Dark Switch">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setLanguage(language === 'en' ? 'de' : 'en')} className="p-2 rounded-full text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" title="Change Language">
            <Globe size={20} />
          </button>
          <button onClick={() => setIsColorPickerOpen(true)} className="p-2 rounded-full text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" title="Customize Theme">
            <Palette size={20} />
          </button>
        </div>
      </div>
      
      {isColorPickerOpen && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-xl w-80 relative">
            <h3 className="text-xl font-bold mb-4">{t('selectColor')}</h3>
            <div className="flex items-center justify-center mb-4">
                <input
                    type="color"
                    value={tempAccentColor}
                    onChange={(e) => setTempAccentColor(e.target.value)}
                    className="w-full h-12 border-none rounded-md cursor-pointer"
                />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
                <button
                    onClick={handleCancelColor}
                    className="px-4 py-2 font-semibold rounded-full text-gray-600 dark:text-gray-300 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSaveColor}
                    className="px-4 py-2 font-semibold rounded-full text-white transition-colors duration-200"
                    style={{ backgroundColor: tempAccentColor }}
                >
                    Save
                </button>
            </div>
          </div>
        </div>
      )}

      <!-- removed title block for space --><div className="hidden">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 dark:text-gray-100">
          {t('dashboardTitle')}
        </h1>
        <p className="mt-2 text-gray-500 dark:text-[#B3B3B3]">
          {t('dashboardSubtitle')}
        </p>
      </div>
      
      <div className="flex-grow p-4 md:p-8">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <NewsFeedCard t={t} language={language} accentColor={accentColor} />
          <MarketTickerCard t={t} accentColor={accentColor} />
          <WeatherCard t={t} />
          <CalculatorCard t={t} accentColor={accentColor} />
          <WorkTimerCard t={t} />
        </div>
      </div>
    </div>
  );
}
