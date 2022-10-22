import Weather from './fetch/fetch-weather.js';
import Unsplash from './fetch/fetch-unsplash.js';
import MyMemory from './fetch/fetch-mymemory.js';

import WeatherWindowView from './view/weather-window-view.js';

import { calculateLocalTime } from './utils.js';

// Переменные

const weather = new Weather();
const unsplash = new Unsplash();
const myMemory = new MyMemory();

let timeUpdateIntervalId;

// Элементы DOM

const container = document.querySelector('.card');

let weatherWindowComponent = null;


// const availableScreenWidth = window.screen.availWidth;

const getLocation = () => {
  const getCoords = (geolocation) => {
    const lat = geolocation.coords.latitude;
    const lon = geolocation.coords.longitude;
    makeRequestsByCoords(lat, lon);
  };
  navigator.geolocation.getCurrentPosition(getCoords, () => {
    makeRequestsByCity();
  });
};

const renderWeatherComponent = (data) => {
  if (timeUpdateIntervalId) {
    clearInterval(timeUpdateIntervalId);
  }

  if (weatherWindowComponent) {
    const prevWeatherWindowComponent = weatherWindowComponent;
    weatherWindowComponent = new WeatherWindowView(data, searchFormSubmitHandler);
    container.replaceChild(weatherWindowComponent.element, prevWeatherWindowComponent.element);
    prevWeatherWindowComponent.removeElement();
  } else {
    weatherWindowComponent = new WeatherWindowView(data, searchFormSubmitHandler);
    container.insertAdjacentElement('afterbegin', weatherWindowComponent.element);
  }
  weatherWindowComponent.setSubmitHandler();

  weatherWindowComponent.updateLocalTime(calculateLocalTime(data.timezone));
  timeUpdateIntervalId = setInterval(() => weatherWindowComponent.updateLocalTime(calculateLocalTime(data.timezone)), 1000);

  // sunriseElement.textContent = `Sunrise: ${new Date((data.sys.sunrise + data.timezone * 60) * 1000).toLocaleTimeString()}`;
  // console.log(data.sys.sunrise * 1000, (data.sys.sunrise + data.timezone * 60) * 1000);
  // console.log(new Date(data.sys.sunrise * 1000).getHours(), new Date((data.sys.sunrise + data.timezone * 60) * 1000).toString());
  // sunsetElement.textContent = `Sunset: ${new Date((data.sys.sunset + data.timezone * 60) * 1000).toLocaleTimeString()}`;
};

const removeWeatherComponent = () => {
  container.removeChild(weatherWindowComponent.element);
  weatherWindowComponent.removeElement();
  weatherWindowComponent = null;
  clearInterval(timeUpdateIntervalId);
};

const updateBackground = (images, searchQuery) => {
  if (images) {
    document.body.style.background = `url(${images.results[0].urls.full})`;
  } else {
    document.body.style.background = `url(https://source.unsplash.com/1600x900/?${searchQuery})`;
  }
};

async function makeRequestsByCoords (lat, lon) {
  try {
    const data = await weather.searchByCoord(lat, lon);

    if (!data) {
      throw new Error('Ошибка при загрузке информации о погоде');
    } else {
      renderWeatherComponent(data);
    }

    const images = await unsplash.getImage(data.name);
    updateBackground(images, data.name);

  } catch (error) {
    console.error(error);
  }
}

async function makeRequestsByCity (searchquery = 'Moscow', translatedSearchQuery = 'Moscow') {
  try {
    const [data, images] = await Promise.allSettled([
      weather.searchByCity(searchquery),
      unsplash.getImage(translatedSearchQuery),
    ]);

    if (!data.value) {
      throw new Error('Ошибка при загрузке информации о погоде');
    }
    renderWeatherComponent(data.value);
    updateBackground(images.value, translatedSearchQuery);

  } catch (error) {
    console.log(error);
  }
}

async function searchFormSubmitHandler(query) {
  try {
    const translatedSearchQuery = await myMemory.getTranslation(query);
    makeRequestsByCity(query, translatedSearchQuery);
  } catch (error) {
    console.error(error);
  }
}

async function windowLoadHandler() {
  getLocation();
}

export {
  windowLoadHandler,
  removeWeatherComponent,
};
