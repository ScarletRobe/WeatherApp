import Weather from './fetch-weather.js';
import Unsplash from './fetch-unsplash.js';
import MyMemory from './fetch-mymemory.js';

// Переменные

const weather = new Weather();
const unsplash = new Unsplash();
const myMemory = new MyMemory();

// const availableScreenWidth = window.screen.availWidth;
let timeUpdateIntervalId;

// Элементы DOM

const searchFormElement = document.querySelector('#search');
const searchFormInputElement = searchFormElement.querySelector('.card__search-bar');

const weatherTitleElement = document.querySelector('.card__city');
const temperatureElement = document.querySelector('.card__temperature');
const iconElement = document.querySelector('.card__icon');

const detailsContainerElement = document.querySelector('.card__details');
const weatherDescriptionElement = detailsContainerElement.querySelector('.card__description');
const windSpeedElement = detailsContainerElement.querySelector('.card__wind-speed');
const humidityElement = detailsContainerElement.querySelector('.card__humidity');
const pressureElement = detailsContainerElement.querySelector('.card__pressure');

const otherInfoContainerElement = document.querySelector('.card__other-info');
const dateElement = otherInfoContainerElement.querySelector('.card__date');
const timeElement = otherInfoContainerElement.querySelector('.card__time');

// const sunInfoContainerElement = otherInfoContainerElement.querySelector('.card__sun');
// const sunriseElement = sunInfoContainerElement.querySelector('.card__sunrise');
// const sunsetElement = sunInfoContainerElement.querySelector('.card__sunset');

//

const calculateLocalTime = (timezone) => {
  const date = new Date();
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  const currTime = new Date(utcTime + (1000 * timezone));
  return {
    time: currTime.toLocaleTimeString(),
    date: currTime.toLocaleDateString(),
  };
};

const displayLocalTime = (timezone) => {
  const localDate = calculateLocalTime(timezone);
  dateElement.textContent = `Date: ${localDate.date}`;
  timeElement.textContent = `Current time: ${localDate.time}`;
};

const updateWeather = (data) => {
  if(timeUpdateIntervalId) {
    clearInterval(timeUpdateIntervalId);
  }

  weatherTitleElement.textContent = `Weather in ${data.name}`;
  temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
  iconElement.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  weatherDescriptionElement.textContent = data.weather[0].description;
  windSpeedElement.textContent = `Wind speed: ${data.wind.speed} km/h`;
  humidityElement.textContent = `Humidity: ${data.main.humidity}%`;
  pressureElement.textContent = `Pressure: ${data.main.pressure} hPa`;
  timeUpdateIntervalId = setInterval(() => displayLocalTime(data.timezone), 1000);

  // sunriseElement.textContent = `Sunrise: ${new Date((data.sys.sunrise + data.timezone * 60) * 1000).toLocaleTimeString()}`;
  // console.log(data.sys.sunrise * 1000, (data.sys.sunrise + data.timezone * 60) * 1000);
  // console.log(new Date(data.sys.sunrise * 1000).getHours(), new Date((data.sys.sunrise + data.timezone * 60) * 1000).toString());
  // sunsetElement.textContent = `Sunset: ${new Date((data.sys.sunset + data.timezone * 60) * 1000).toLocaleTimeString()}`;
};

const updateBackground = (images) => {
  // document.body.style.background = `url(${images.results[0].urls.raw}&w=${availableScreenWidth}&dpr=2&crop=faces,entropy)`;
  document.body.style.background = `url(${images.results[0].urls.regular})`;
};

const initSearchForm = async () => {
  searchFormElement.addEventListener('submit', searchFormSubmitHandler);
};

async function searchFormSubmitHandler(evt) {
  try {
    evt.preventDefault();
    const translatedSearchQuery = await myMemory.getTranslation(searchFormInputElement.value);
    const [data, images] = await Promise.allSettled([
      weather.searchByCity(searchFormInputElement.value),
      unsplash.getImage(translatedSearchQuery),
    ]);
    if (!images.value) {
      console.log('Ошибка при загрузке фотографии');
    } else { updateBackground(images.value); }
    if (!data.value) {
      console.log('Ошибка при загрузке информации о погоде');
    } else { updateWeather(data.value); }
  } catch (error) {
    console.log(error);
  }
  searchFormInputElement.value = '';
}

async function windowLoadHandler() {
  try {
    const [data, images] = await Promise.allSettled([
      weather.searchByCity('Moscow'),
      unsplash.getImage('Moscow'),
    ]);
    if (!images.value) {
      console.log('Ошибка при загрузке фотографии');
    } else { updateBackground(images.value); }
    if (!data.value) {
      console.log('Ошибка при загрузке информации о погоде');
    } else { updateWeather(data.value); }
  } catch (error) {
    console.log(error);
  }
}

export {
  initSearchForm,
  windowLoadHandler
};
