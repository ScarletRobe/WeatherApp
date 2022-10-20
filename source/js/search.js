import Weather from './fetch-weather.js';
import Unsplash from './fetch-unsplash.js';
import MyMemory from './fetch-mymemory.js';

import WeatherWindowView from './view/weather-window-view.js';

// Переменные

const weather = new Weather();
const unsplash = new Unsplash();
const myMemory = new MyMemory();

let weatherWindowComponent = null;

// const availableScreenWidth = window.screen.availWidth;
let timeUpdateIntervalId;

// const sunInfoContainerElement = otherInfoContainerElement.querySelector('.card__sun');
// const sunriseElement = sunInfoContainerElement.querySelector('.card__sunrise');
// const sunsetElement = sunInfoContainerElement.querySelector('.card__sunset');

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

const calculateLocalTime = (timezone) => {
  const date = new Date();
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  const currTime = new Date(utcTime + (1000 * timezone));
  return {
    time: currTime.toLocaleTimeString(),
    date: currTime.toLocaleDateString(),
  };
};


const updateWeather = (data) => {
  if(timeUpdateIntervalId) {
    clearInterval(timeUpdateIntervalId);
  }

  if (weatherWindowComponent) {
    weatherWindowComponent.removeElement();
  }

  weatherWindowComponent = new WeatherWindowView(data, searchFormSubmitHandler);
  document.body.insertAdjacentElement('afterbegin', weatherWindowComponent.element);

  timeUpdateIntervalId = setInterval(() => weatherWindowComponent.updateLocalTime(calculateLocalTime(data.timezone)), 1000);

  // sunriseElement.textContent = `Sunrise: ${new Date((data.sys.sunrise + data.timezone * 60) * 1000).toLocaleTimeString()}`;
  // console.log(data.sys.sunrise * 1000, (data.sys.sunrise + data.timezone * 60) * 1000);
  // console.log(new Date(data.sys.sunrise * 1000).getHours(), new Date((data.sys.sunrise + data.timezone * 60) * 1000).toString());
  // sunsetElement.textContent = `Sunset: ${new Date((data.sys.sunset + data.timezone * 60) * 1000).toLocaleTimeString()}`;
};

const updateBackground = (images, searchQuery) => {
  if (images) {
    document.body.style.background = `url(${images.results[0].urls.raw})`;
  } else {
    document.body.style.background = `url(https://source.unsplash.com/1600x900/?${searchQuery})`;
  }
  // document.body.style.background = `url(${images.results[0].urls.raw}&w=${availableScreenWidth}&dpr=2&crop=faces,entropy)`;
};

async function makeRequestsByCoords (lat, lon) {
  try {
    const data = await weather.searchByCoord(lat, lon);

    if (!data) {
      throw new Error('Ошибка при загрузке информации о погоде');
    } else {
      updateWeather(data);
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
    } else {
      updateWeather(data.value);
      updateBackground(images.value, translatedSearchQuery);
    }

  } catch (error) {
    console.log(error);
  }
}

async function searchFormSubmitHandler(evt, query) {
  evt.preventDefault();
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
  windowLoadHandler
};
