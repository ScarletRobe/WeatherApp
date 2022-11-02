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

// Компоненты

let containerComponent = null;
let weatherWindowComponent = null;

//

const getLocation = async () => (
  new Promise((resolve) => {
    const getCoords = (geolocation) => {
      const lat = geolocation.coords.latitude;
      const lon = geolocation.coords.longitude;
      makeRequestsByCoords(lat, lon);
      resolve();
    };
    navigator.geolocation.getCurrentPosition(getCoords, () => {
      makeRequestsByCity();
      resolve();
    });
  })
);

const renderWeatherComponent = (data) => {
  if (timeUpdateIntervalId) {
    clearInterval(timeUpdateIntervalId);
  }

  if (weatherWindowComponent) {
    const prevWeatherWindowComponent = weatherWindowComponent;
    weatherWindowComponent = new WeatherWindowView(data, searchFormSubmitHandler);
    containerComponent.element.replaceChild(weatherWindowComponent.element, prevWeatherWindowComponent.element);
    prevWeatherWindowComponent.removeElement();
    containerComponent.slideRightToTheLeft();
  } else {
    weatherWindowComponent = new WeatherWindowView(data, searchFormSubmitHandler);
    containerComponent.element.insertAdjacentElement('afterbegin', weatherWindowComponent.element);
    containerComponent.slideRightToTheLeft();
  }
  weatherWindowComponent.setSubmitHandler();

  weatherWindowComponent.updateLocalTime(calculateLocalTime(data.timezone));
  timeUpdateIntervalId = setInterval(() => weatherWindowComponent.updateLocalTime(calculateLocalTime(data.timezone)), 1000);
};

const removeWeatherComponent = async () => {
  if (!weatherWindowComponent) {
    return;
  }

  return new Promise((resolve) => {
    containerComponent.slideLeft(() => {
      containerComponent.element.removeChild(weatherWindowComponent.element);
      weatherWindowComponent.removeElement();
      weatherWindowComponent = null;
      clearInterval(timeUpdateIntervalId);
      resolve();
    });
  });
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
      await removeWeatherComponent();
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
    await removeWeatherComponent();
    renderWeatherComponent(data.value);
    updateBackground(images?.value, translatedSearchQuery);

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

async function windowLoadHandler(container) {
  containerComponent = container;
  await getLocation();
}

export {
  windowLoadHandler,
  removeWeatherComponent,
};
