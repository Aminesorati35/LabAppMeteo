import { Oval } from 'react-loader-spinner';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown, faStar } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function Grp204WeatherApp() {
  const [input, setInput] = useState('');
  const [weather, setWeather] = useState({
    loading: false,
    data: {},
    error: false,
  });
  const [forecast, setForecast] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Retrieve favorite cities from localStorage on component mount
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(savedFavorites);
  }, []);

  const toDateFunction = () => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août',
      'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    const WeekDays = [
      'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
    ];
    const currentDate = new Date();
    const date = `${WeekDays[currentDate.getDay()]} ${currentDate.getDate()} ${months[currentDate.getMonth()]}`;
    return date;
  };

  const search = async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setInput('');
      setWeather({ ...weather, loading: true });
      const apiKey = 'f00c38e0279b7bc85480c3fe775d518c';

      try {
        // Fetch current weather data
        const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
          params: {
            q: input,
            units: 'metric',
            appid: apiKey,
          },
        });
        setWeather({ data: weatherResponse.data, loading: false, error: false });

        // Fetch forecast data
        const forecastResponse = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
          params: {
            q: input,
            units: 'metric',
            appid: apiKey,
          },
        });

        // Extract daily data (every 24 hours)
        const dailyForecast = forecastResponse.data.list.filter((reading) =>
          reading.dt_txt.includes("12:00:00")
        ).slice(0, 5);  // Get forecast for the next 5 days
        setForecast(dailyForecast);

      } catch (error) {
        setWeather({ ...weather, data: {}, error: true });
        setInput('');
      }
    }
  };

  // Save city to favorites
  const addToFavorites = () => {
    if (weather.data && !favorites.some(fav => fav.name === weather.data.name)) {
      const updatedFavorites = [...favorites, weather.data];
      setFavorites(updatedFavorites);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    }
  };

  // Handle click on a favorite city
  const handleFavoriteClick = (city) => {
    setWeather({ data: city, loading: false, error: false });
    setInput(city.name);
    // Fetch the forecast for the clicked city
    const apiKey = 'f00c38e0279b7bc85480c3fe775d518c';
    axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        q: city.name,
        units: 'metric',
        appid: apiKey,
      },
    }).then((response) => {
      const dailyForecast = response.data.list.filter((reading) =>
        reading.dt_txt.includes("12:00:00")
      ).slice(0, 5);
      setForecast(dailyForecast);
    });
  };

  return (
    <div className="App">
      <h1 className="app-name">Application Météo grp204</h1>
      <div className="search-bar">
        <input
          type="text"
          className="city-search"
          placeholder="Entrez le nom de la ville..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyPress={search}
        />
        <button className="add-favorite" onClick={addToFavorites}>
          <FontAwesomeIcon icon={faStar} />
        </button>
      </div>

      {weather.loading && (
        <Oval type="Oval" color="black" height={100} width={100} />
      )}
      {weather.error && (
        <span className="error-message">
          <FontAwesomeIcon icon={faFrown} />
          <span>Ville introuvable</span>
        </span>
      )}

      {/* Current Weather Section */}
      {weather.data && weather.data.name && weather.data.sys && (
        <div>
          <h2>{weather.data.name}, {weather.data.sys.country}</h2>
          <span>{toDateFunction()}</span>
          <img
            src={`https://openweathermap.org/img/wn/${weather.data.weather[0].icon}@2x.png`}
            alt={weather.data.weather[0].description}
          />
          <p>{Math.round(weather.data.main.temp)}°C</p>
          <p>Vitesse du vent : {weather.data.wind.speed} m/s</p>
        </div>
      )}

      {/* Forecast Section */}
      {forecast.length > 0 && (
        <div className="forecast">
          <h3>Prévisions pour les 5 prochains jours</h3>
          <div className="forecast-container">
            {forecast.map((day) => (
              <div key={day.dt} className="forecast-day">
                <p>{new Date(day.dt * 1000).toLocaleDateString('fr-FR', {
                  weekday: 'long', day: 'numeric', month: 'long'
                })}</p>
                <img
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                  alt={day.weather[0].description}
                />
                <p>{Math.round(day.main.temp)}°C</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorite Cities Section */}
      {favorites.length > 0 && (
        <div className="favorites">
          <h3>Villes favorites</h3>
          <div className="favorites-container">
            {favorites.map((fav) => (
              <div
                key={fav.name}
                className="favorite-city"
                onClick={() => handleFavoriteClick(fav)}
              >
                {fav.name}, {fav.sys ? fav.sys.country : 'Non disponible'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Grp204WeatherApp;
